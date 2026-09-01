# DESIGN DIRECTION

The visual reference is **https://homequuest.webflow.io/**, and it is followed
closely. This document records what was measured off it, how it was adapted for
APERTURE, and the one place the brief and the reference disagreed.

> An earlier revision of this file argued *against* following HomeQuest and
> proposed a "professional register" aesthetic instead. That direction was
> reviewed and overruled: the build now follows the reference. The register
> argument survives only where it costs nothing — see *Honesty constraints*.

---

## Measured from the reference

Not estimated. These came out of the live page's computed styles.

| Property | Value |
|---|---|
| Container | `1320px`, `30px` gutter |
| Section padding | `120px` block (`72px` under 900px) |
| Section corners | `24px 24px 0 0`, pulled up `-24px` so sections stack as sheets |
| Ink | `#0A0915` |
| Theme green | `#203F30` |
| Accent | `#DBFB1E` |
| Neutral ground | `#F7F6F4` |
| h1 | 80px / 92px / `-3px` / weight **400** |
| h2 | 48px / 60px / `-2.5px` / weight 400 |
| Body | 16px / 1.6 |
| Nav CTA | pill, `100px` radius, `11px 24px` |
| Primary button | `12px` radius, `18px 32px` |
| Card image | `12px` radius |
| Typeface | Geist |

The single most load-bearing detail is that **display type is set at weight 400
with heavy negative tracking**. Large type at 600 reads as shouting; at 400 with
`-0.045em` it reads as confidence. Do not "fix" the heading weights.

The second is the **sheet stack**: every section has rounded top corners and
overlaps the one above it. That one move is most of what makes the reference feel
composed rather than assembled. `.sheet` in `globals.css`.

## Card anatomy

Listing cards carry **no border, no shadow and no fill**. The photograph is the
card; the text sits directly on the page beneath it. Order runs:

```
image (12px radius, chip overlaid top-left)
category label      — small, uppercase, faint
name                — 20px, medium
price               — mono, tabular
meta row            — icon + area + distance + verification
```

Adding a border or a card background to these breaks the whole grid. Don't.

## Adapted, not copied

| HomeQuest | APERTURE |
|---|---|
| Properties | Gear listings |
| Agents | Creators |
| "Trusted by leading company" logo bar | Disciplines strip, same lime band |
| Property specs (sq ft / bed / bath) | Area, distance, verification state |
| Services with prices | The four ways in |
| Homeowner stories | Creator stories |
| CEO message | Editorial block: "Your work deserves more than follower counts" |
| Contact form section | Final CTA |
| FAQ accordion | FAQ accordion |

No HomeQuest branding, copy, imagery or property content is reused.

## Palette

```
--ink        #0A0915   text
--canvas     #FFFFFF   default ground
--sand       #F7F6F4   alternating sections
--forest     #203F30   brand panels, CTA blocks
--lime       #DCF23E   THE accent — primary action and the trust strip only
--verified   forest family, for verification semantics
--flag       #9A3412   at-risk, disputed, overdue
```

Verification colour deliberately sits in the forest family so trust state reads
as part of the brand rather than as a bolted-on status pill. The lime is the
reference's signature; it is used for the primary action and nowhere decorative.

The brief asked for "no neon". `#DCF23E` is bright by any measure — it is kept
because it *is* the reference's identity, and restraint is applied through
frequency rather than saturation: it appears on the nav CTA, the hero CTA, the
disciplines band and the instant-book chip. That is all.

## Type

**Geist** and **Geist Mono**, loaded by `<link>` rather than `next/font` so a
missing entry in the bundled font manifest degrades to Inter instead of failing
the build. Every rupee amount, distance, count, date and score is mono with
tabular figures — misaligned currency columns read as amateurish in exactly the
screens where trust is being established.

## The verification strip

Kept from the original direction, restyled to this palette. A compact row of
verification states rendered identically on the passport, on every listing, on
every booking screen and in search results. Same component, same order, same
meaning. Order runs cheapest signal to most expensive, so scanning left to right
tells you how far someone actually went. Meaning is never carried by colour
alone: every state carries an icon and a label.

## Honesty constraints

These are product constraints, not aesthetic ones, and they outrank the visual
reference:

- **No fabricated platform metrics.** The reference's logo bar became a
  disciplines strip rather than invented counts.
- **Reviews follow transactions.** There is no path to a review without a
  completed booking behind it.
- **Protection is stated, not implied.** `/how-it-works#protection` lists what is
  *not* covered as prominently as what is.
- **The demo cast is marked as such** in the footer and in `catalogue.ts`. Names,
  studios and quotes are invented for development and must not reach production.

## Motion

Restrained. Image scale on card hover, underline sweep on links, colour
transitions on buttons. No fade-and-slide-up on every section. On a trust
product, restraint reads as competence and animation reads as marketing.
`prefers-reduced-motion` disables all of it.
