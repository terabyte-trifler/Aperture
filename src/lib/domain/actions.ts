"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  onboardingIntentSchema,
  onboardingLocationSchema,
  onboardingSkillsSchema,
  otpSchema,
  phoneSchema,
  privacySchema,
  profileSchema,
  usernameChangeSchema,
} from "@/lib/validation/profile";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; field?: string };

function fail(error: string, field?: string): ActionResult<never> {
  return { ok: false, error, field };
}

/* ── Auth ──────────────────────────────────────────────────────── */

export async function sendOtp(formData: FormData): Promise<ActionResult> {
  const parsed = phoneSchema.safeParse(formData.get("phone"));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Check that number", "phone");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ phone: parsed.data });

  // Rate limiting lives at the edge (Upstash) — see SRS gap M-2.
  // Until that ships, Supabase's own OTP throttle is the only ceiling.
  if (error) return fail("We couldn't send that code. Try again in a minute.");
  return { ok: true };
}

export async function verifyOtp(formData: FormData): Promise<ActionResult> {
  const phone = phoneSchema.safeParse(formData.get("phone"));
  const token = otpSchema.safeParse(formData.get("code"));

  if (!phone.success) return fail("That number looks wrong", "phone");
  if (!token.success) return fail("Enter the 6-digit code", "code");

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    phone: phone.data,
    token: token.data,
    type: "sms",
  });

  if (error) return fail("That code didn't match. Check it and try again.", "code");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("Sign-in didn't complete. Try again.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_step")
    .eq("id", user.id)
    .single();

  redirect(profile?.onboarding_step ? "/onboarding" : "/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/* ── Onboarding ────────────────────────────────────────────────── */

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function saveIntent(formData: FormData): Promise<ActionResult> {
  const parsed = onboardingIntentSchema.safeParse({
    primaryRole: formData.get("primaryRole"),
    wantsToRent: formData.get("wantsToRent") === "on",
    wantsToList: formData.get("wantsToList") === "on",
  });
  if (!parsed.success) return fail("Pick what you do", "primaryRole");

  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("profiles")
    .update({ primary_role: parsed.data.primaryRole, onboarding_step: "location" })
    .eq("id", user.id);
  if (error) return fail("Couldn't save that. Try again.");

  await supabase
    .from("creator_roles")
    .upsert(
      { profile_id: user.id, role_slug: parsed.data.primaryRole, is_primary: true },
      { onConflict: "profile_id,role_slug" },
    );

  revalidatePath("/onboarding");
  return { ok: true };
}

export async function saveLocation(formData: FormData): Promise<ActionResult> {
  const parsed = onboardingLocationSchema.safeParse({
    city: formData.get("city"),
    state: formData.get("state") || undefined,
    serviceRadiusKm: formData.get("serviceRadiusKm") ?? 25,
  });
  if (!parsed.success) return fail("Enter your city", "city");

  const { supabase, user } = await requireUser();

  // Note: no precise coordinate is written from the client. location_precise
  // is set server-side from a geocode of the city centroid, and is never
  // returned to any client. See threat T-19.
  const { error } = await supabase
    .from("profiles")
    .update({
      city: parsed.data.city,
      state: parsed.data.state ?? null,
      onboarding_step: "skills",
    })
    .eq("id", user.id);

  if (error) return fail("Couldn't save that. Try again.");
  revalidatePath("/onboarding");
  return { ok: true };
}

export async function saveSkills(formData: FormData): Promise<ActionResult> {
  const parsed = onboardingSkillsSchema.safeParse({
    skillIds: formData.getAll("skillIds").map(String),
  });
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Pick a skill", "skillIds");
  }

  const { supabase, user } = await requireUser();

  await supabase.from("creator_skills").delete().eq("profile_id", user.id);
  const { error } = await supabase.from("creator_skills").insert(
    parsed.data.skillIds.map((skill_id) => ({ profile_id: user.id, skill_id })),
  );
  if (error) return fail("Couldn't save those skills. Try again.");

  await supabase
    .from("profiles")
    .update({ onboarding_step: "profile" })
    .eq("id", user.id);

  revalidatePath("/onboarding");
  return { ok: true };
}

export async function completeOnboarding(formData: FormData): Promise<ActionResult> {
  const parsed = profileSchema.pick({ displayName: true, headline: true }).safeParse({
    displayName: formData.get("displayName"),
    headline: formData.get("headline") ?? "",
  });
  if (!parsed.success) return fail("Add your name", "displayName");

  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      headline: parsed.data.headline || null,
      onboarding_step: null,
    })
    .eq("id", user.id);

  if (error) return fail("Couldn't finish. Try again.");
  redirect("/dashboard");
}

/* ── Profile ───────────────────────────────────────────────────── */

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    headline: formData.get("headline") ?? "",
    bio: formData.get("bio") ?? "",
    city: formData.get("city"),
    languages: formData.getAll("languages").map(String),
    isAvailable: formData.get("isAvailable") === "on",
    availabilityNote: formData.get("availabilityNote") ?? "",
    dayRateMinor: formData.get("dayRateMinor")
      ? Math.round(Number(formData.get("dayRateMinor")) * 100)
      : null,
    showRate: formData.get("showRate") === "on",
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(issue?.message ?? "Check the form", String(issue?.path[0] ?? ""));
  }

  const { supabase, user } = await requireUser();
  const d = parsed.data;

  // Only columns granted to `authenticated` are listed here. Attempting
  // verification_tier or credibility_* would be reverted by the trigger
  // regardless — this is the first of three layers.
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: d.displayName,
      headline: d.headline || null,
      bio: d.bio || null,
      city: d.city,
      languages: d.languages,
      is_available: d.isAvailable,
      availability_note: d.availabilityNote || null,
      day_rate_minor: d.dayRateMinor ?? null,
      show_rate: d.showRate,
    })
    .eq("id", user.id);

  if (error) return fail("Couldn't save your profile. Try again.");

  const { data: profile } = await supabase
    .from("profiles").select("username").eq("id", user.id).single();

  revalidatePath("/settings/profile");
  if (profile?.username) revalidatePath(`/c/${profile.username}`);
  return { ok: true };
}

export async function changeUsername(formData: FormData): Promise<ActionResult> {
  const parsed = usernameChangeSchema.safeParse({
    username: formData.get("username"),
  });
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid username", "username");
  }

  const { supabase, user } = await requireUser();

  const { data: available } = await supabase.rpc("username_available", {
    p_username: parsed.data.username,
  });
  if (!available) return fail("That username is taken", "username");

  const { error } = await supabase
    .from("profiles")
    .update({ username: parsed.data.username })
    .eq("id", user.id);

  if (error) return fail("That username is taken", "username");

  revalidatePath("/settings/profile");
  return { ok: true, data: undefined };
}

export async function updatePrivacy(formData: FormData): Promise<ActionResult> {
  const parsed = privacySchema.safeParse({
    visProfile: formData.get("visProfile"),
    visPortfolio: formData.get("visPortfolio"),
    visRentalHistory: formData.get("visRentalHistory"),
    discoverableOnRadar: formData.get("discoverableOnRadar") === "on",
    allowMessagesFrom: formData.get("allowMessagesFrom"),
    locationRadiusM: Number(formData.get("locationRadiusM")),
  });
  if (!parsed.success) return fail("Check your privacy settings");

  const { supabase, user } = await requireUser();
  const d = parsed.data;

  const { error } = await supabase
    .from("user_settings")
    .update({
      vis_profile: d.visProfile,
      vis_portfolio: d.visPortfolio,
      vis_rental_history: d.visRentalHistory,
      discoverable_on_radar: d.discoverableOnRadar,
      allow_messages_from: d.allowMessagesFrom,
    })
    .eq("user_id", user.id);
  if (error) return fail("Couldn't save. Try again.");

  await supabase
    .from("profiles")
    .update({ location_radius_m: d.locationRadiusM })
    .eq("id", user.id);

  revalidatePath("/settings/privacy");
  return { ok: true };
}
