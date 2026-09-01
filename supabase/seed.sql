-- ═══════════════════════════════════════════════════════════════════
-- seed.sql — development data
--
-- Realistic Pune/Mumbai creator-marketplace data. The app should feel
-- alive on first `supabase db reset`. No lorem ipsum.
--
-- NOTE: no fabricated reviews or testimonials. The landing page shows
-- live counts from these tables, and inventing social proof on a trust
-- product is self-defeating.
-- ═══════════════════════════════════════════════════════════════════

-- ─── Skills taxonomy ───────────────────────────────────────────────
insert into public.skills (slug, name, category) values
  ('wedding-photography',   'Wedding photography',    'photography'),
  ('candid-photography',    'Candid photography',     'photography'),
  ('pre-wedding',           'Pre-wedding shoots',     'photography'),
  ('portrait',              'Portrait',               'photography'),
  ('street',                'Street photography',     'photography'),
  ('product-photography',   'Product photography',    'photography'),
  ('fashion',               'Fashion',                'photography'),
  ('wildlife',              'Wildlife',               'photography'),
  ('architecture',          'Architecture',           'photography'),
  ('event-coverage',        'Event coverage',         'photography'),
  ('cinematography',        'Cinematography',         'film'),
  ('documentary',           'Documentary',            'film'),
  ('music-video',           'Music video',            'film'),
  ('corporate-video',       'Corporate video',        'film'),
  ('drone-operation',       'Drone operation',        'film'),
  ('gimbal-operation',      'Gimbal operation',       'film'),
  ('video-editing',         'Video editing',          'post'),
  ('colour-grading',        'Colour grading',         'post'),
  ('sound-design',          'Sound design',           'post'),
  ('motion-graphics',       'Motion graphics',        'post'),
  ('photo-retouching',      'Photo retouching',       'post'),
  ('album-design',          'Album design',           'post')
on conflict (slug) do nothing;

-- ─── Gear categories ───────────────────────────────────────────────
insert into public.gear_categories (slug, name, sort_order, attribute_schema) values
  ('camera-body', 'Camera bodies', 10,
   '{"mount":"enum","sensor_format":"enum","media_type":"array","battery_type":"text","has_ibis":"bool"}'),
  ('lens', 'Lenses', 20,
   '{"mount":"enum","image_circle":"enum","focal_min_mm":"num","focal_max_mm":"num","aperture_max":"num","filter_thread_mm":"num"}'),
  ('lighting', 'Lighting', 30,
   '{"power_w":"num","mount_type":"enum","power_source":"enum","colour":"enum"}'),
  ('audio', 'Audio', 40,
   '{"connector":"enum","phantom_power":"bool","channels":"num"}'),
  ('support', 'Tripods & support', 50,
   '{"payload_kg":"num","plate_type":"enum","head_type":"enum"}'),
  ('stabiliser', 'Gimbals & stabilisers', 60, '{"payload_kg":"num"}'),
  ('drone', 'Drones', 70, '{"weight_g":"num","dgca_class":"text"}'),
  ('media', 'Memory & storage', 80,
   '{"card_type":"enum","speed_mbs":"num","capacity_gb":"num"}'),
  ('accessory', 'Accessories', 90, '{}')
on conflict (slug) do nothing;

-- ─── Brands ────────────────────────────────────────────────────────
insert into public.gear_brands (slug, name) values
  ('sony','Sony'), ('canon','Canon'), ('nikon','Nikon'), ('fujifilm','Fujifilm'),
  ('panasonic','Panasonic'), ('blackmagic','Blackmagic Design'), ('dji','DJI'),
  ('godox','Godox'), ('aputure','Aputure'), ('rode','RODE'), ('sennheiser','Sennheiser'),
  ('manfrotto','Manfrotto'), ('benro','Benro'), ('sigma','Sigma'), ('tamron','Tamron'),
  ('zhiyun','Zhiyun'), ('sandisk','SanDisk'), ('smallrig','SmallRig')
on conflict (slug) do nothing;

-- ─── Models (representative subset; full catalogue is ~3,000 SKUs) ──
with b as (select id, slug from public.gear_brands),
     c as (select id, slug from public.gear_categories)
insert into public.gear_models
  (brand_id, category_id, slug, model_name, variant, released_year, replacement_value_minor)
select b.id, c.id, v.slug, v.model_name, v.variant, v.year, v.value
from (values
  ('sony','camera-body','sony-a7-iv','α7 IV', 'Body', 2021, 21000000),
  ('sony','camera-body','sony-a7iii','α7 III','Body', 2018, 14000000),
  ('sony','camera-body','sony-fx3','FX3','Body', 2021, 34000000),
  ('sony','camera-body','sony-a6700','α6700','Body', 2023, 13500000),
  ('canon','camera-body','canon-r6-ii','EOS R6 Mark II','Body', 2022, 21500000),
  ('canon','camera-body','canon-r5','EOS R5','Body', 2020, 32000000),
  ('nikon','camera-body','nikon-z6-ii','Z6 II','Body', 2020, 16000000),
  ('fujifilm','camera-body','fuji-xt5','X-T5','Body', 2022, 15500000),
  ('blackmagic','camera-body','bmpcc-6k','Pocket Cinema 6K','Body', 2021, 20000000),
  ('sony','lens','sony-24-70-gm2','FE 24-70mm f/2.8 GM II', null, 2022, 20000000),
  ('sony','lens','sony-70-200-gm2','FE 70-200mm f/2.8 GM II', null, 2021, 22000000),
  ('sony','lens','sony-35-14-gm','FE 35mm f/1.4 GM', null, 2021, 13000000),
  ('sony','lens','sony-85-18','FE 85mm f/1.8', null, 2019, 5000000),
  ('canon','lens','canon-rf-24-70','RF 24-70mm f/2.8L IS', null, 2019, 21000000),
  ('sigma','lens','sigma-24-70-art','24-70mm f/2.8 DG DN Art','E-mount', 2019, 9000000),
  ('tamron','lens','tamron-28-75-g2','28-75mm f/2.8 Di III VXD G2','E-mount', 2021, 7500000),
  ('godox','lighting','godox-ad200pro','AD200Pro', null, 2019, 3200000),
  ('godox','lighting','godox-sl60w','SL60W', null, 2017, 1400000),
  ('aputure','lighting','aputure-300d-ii','LS 300d II', null, 2020, 7500000),
  ('rode','audio','rode-wireless-go-ii','Wireless GO II', null, 2021, 2400000),
  ('rode','audio','rode-ntg5','NTG5', null, 2020, 4500000),
  ('sennheiser','audio','sennheiser-mke600','MKE 600', null, 2018, 3000000),
  ('manfrotto','support','manfrotto-055','055 Aluminium Tripod', null, 2015, 2200000),
  ('benro','support','benro-s6','S6 Video Head', null, 2016, 1200000),
  ('dji','stabiliser','dji-rs3-pro','RS 3 Pro', null, 2022, 7000000),
  ('zhiyun','stabiliser','zhiyun-crane-m3','Crane M3', null, 2021, 3200000),
  ('dji','drone','dji-mini-4-pro','Mini 4 Pro', null, 2023, 9500000),
  ('dji','drone','dji-air-3','Air 3', null, 2023, 11000000),
  ('sandisk','media','sandisk-cfexpress-a-160','CFexpress Type A 160GB', null, 2020, 2800000),
  ('sandisk','media','sandisk-extreme-pro-128','Extreme Pro SDXC 128GB', null, 2019, 350000)
) as v(brand, cat, slug, model_name, variant, year, value)
join b on b.slug = v.brand
join c on c.slug = v.cat
on conflict (slug) do nothing;

-- ─── Attributes powering compatibility and facets ──────────────────
insert into public.gear_model_attributes (gear_model_id, attribute_key, value_text)
select m.id, 'mount', 'E'
from public.gear_models m
where m.slug in ('sony-a7-iv','sony-a7iii','sony-fx3','sony-a6700',
                 'sony-24-70-gm2','sony-70-200-gm2','sony-35-14-gm','sony-85-18',
                 'sigma-24-70-art','tamron-28-75-g2')
on conflict do nothing;

insert into public.gear_model_attributes (gear_model_id, attribute_key, value_text)
select m.id, 'mount', 'RF' from public.gear_models m
where m.slug in ('canon-r6-ii','canon-r5','canon-rf-24-70')
on conflict do nothing;

insert into public.gear_model_attributes (gear_model_id, attribute_key, value_text)
select m.id, 'sensor_format', 'FF' from public.gear_models m
where m.slug in ('sony-a7-iv','sony-a7iii','sony-fx3','canon-r6-ii','canon-r5','nikon-z6-ii')
on conflict do nothing;

insert into public.gear_model_attributes (gear_model_id, attribute_key, value_text)
select m.id, 'sensor_format', 'APS-C' from public.gear_models m
where m.slug in ('sony-a6700','fuji-xt5')
on conflict do nothing;

insert into public.gear_model_attributes (gear_model_id, attribute_key, value_text)
select m.id, 'image_circle', 'FF' from public.gear_models m
where m.slug in ('sony-24-70-gm2','sony-70-200-gm2','sony-35-14-gm','sony-85-18',
                 'canon-rf-24-70','sigma-24-70-art','tamron-28-75-g2')
on conflict do nothing;

insert into public.gear_model_attributes (gear_model_id, attribute_key, value_num, unit)
select m.id, 'focal_min_mm', v.a, 'mm' from public.gear_models m
join (values ('sony-24-70-gm2',24),('sony-70-200-gm2',70),('sony-35-14-gm',35),
             ('sony-85-18',85),('canon-rf-24-70',24),('sigma-24-70-art',24),
             ('tamron-28-75-g2',28)) as v(slug,a) on v.slug = m.slug
on conflict do nothing;

insert into public.gear_model_attributes (gear_model_id, attribute_key, value_num, unit)
select m.id, 'focal_max_mm', v.a, 'mm' from public.gear_models m
join (values ('sony-24-70-gm2',70),('sony-70-200-gm2',200),('sony-35-14-gm',35),
             ('sony-85-18',85),('canon-rf-24-70',70),('sigma-24-70-art',70),
             ('tamron-28-75-g2',75)) as v(slug,a) on v.slug = m.slug
on conflict do nothing;

-- ─── Subscription plans ────────────────────────────────────────────
insert into public.subscription_plans (slug, name, audience, price_minor, interval, features) values
  ('creator-pro-monthly','Creator Pro','creator', 39900,'month',
   '{"analytics":true,"vanity_url":true,"calendar_sync":true,"early_collab_access_hours":2}'),
  ('creator-pro-yearly','Creator Pro (annual)','creator', 349900,'year',
   '{"analytics":true,"vanity_url":true,"calendar_sync":true,"early_collab_access_hours":2}')
on conflict (slug) do nothing;

-- ─── Launch-city communities (platform-seeded, handed to organisers
--     once each passes 100 members — see SRS Section 7 §4.7) ────────
insert into public.communities (slug, name, description, city, community_type, join_policy, is_official, rules) values
  ('pune-photographers','Pune Photographers',
   'Working photographers in and around Pune. Gear talk, referrals, and monthly meets.',
   'Pune','city','open', true,
   E'1. Real name and real work on your profile.\n2. No unpaid work posts without saying so plainly.\n3. Referrals welcome. Spam is not.'),
  ('pune-street','Pune Street Photography',
   'Weekly walks through Kasba Peth, Tulshibaug and the cantonment. All levels.',
   'Pune','genre','open', true,
   E'1. Respect the people you photograph.\n2. Ask before posting identifiable faces.\n3. Show up when you RSVP.'),
  ('pune-filmmakers','Pune Filmmakers',
   'Crews, kit and collaboration for narrative and documentary work.',
   'Pune','genre','open', true, null),
  ('pune-wedding','Pune Wedding Photographers',
   'Season planning, second-shooter swaps, and honest vendor talk.',
   'Pune','professional','request', true, null),
  ('gear-talk-india','Gear Talk India',
   'Buying, renting and maintaining kit in India. Import duty, service centres, real prices.',
   'Pune','interest','open', true, null)
on conflict (slug) do nothing;
