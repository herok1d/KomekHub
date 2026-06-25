-- KomekHub demo seed data.
-- Run after supabase/schema.sql.
-- This file does not insert fake auth.users. It uses the first existing auth user
-- as the demo organization owner. If there is no auth user yet, create one in
-- Supabase Auth and re-run this seed.

do $$
declare
  demo_owner uuid;
  seeded_organizations integer;
  seeded_opportunities integer;
begin
  select id into demo_owner from auth.users order by created_at limit 1;

  if demo_owner is null then
    raise notice 'No auth.users found. Create one Supabase Auth user, then re-run supabase/seed.sql.';
    return;
  end if;

  -- Demo Kazakhstan organizations.
  insert into public.organizations (id, owner_id, name, description, city, logo_url, contact_email, website)
  values
    ('11111111-1111-4111-8111-111111111111', demo_owner, 'Qoldau Foundation', 'Supports students, families, and local communities through education and social projects.', 'Astana', null, 'hello@qoldau.kz', 'https://qoldau.kz'),
    ('22222222-2222-4222-8222-222222222222', demo_owner, 'EcoStep Kazakhstan', 'Environmental NGO organizing cleanups, recycling workshops, and green city initiatives.', 'Almaty', null, 'team@ecostep.kz', 'https://ecostep.kz'),
    ('33333333-3333-4333-8333-333333333333', demo_owner, 'Volunteer Astana', 'City volunteer hub for public events, conferences, and student initiatives.', 'Astana', null, 'volunteer@astana.kz', 'https://volunteer-astana.kz'),
    ('44444444-4444-4444-8444-444444444444', demo_owner, 'Jastar Qoldau', 'Youth organization helping school and university students join social impact projects.', 'Shymkent', null, 'info@jastarqoldau.kz', 'https://jastarqoldau.kz'),
    ('55555555-5555-4555-8555-555555555555', demo_owner, 'Aq Niet Charity', 'Humanitarian charity focused on health, food support, and family assistance.', 'Karaganda', null, 'care@aqniet.kz', 'https://aqniet.kz'),
    ('66666666-6666-4666-8666-666666666666', demo_owner, 'Bilim Bridge', 'Education foundation supporting inclusive learning and online tutoring for regions.', 'Astana', null, 'learn@bilimbridge.kz', 'https://bilimbridge.kz'),
    ('77777777-7777-4777-8777-777777777777', demo_owner, 'AITU Volunteer Club', 'University volunteer club connecting tech students with nonprofit digitalization projects.', 'Astana', null, 'club@aitu.edu.kz', 'https://aitu.edu.kz'),
    ('88888888-8888-4888-8888-888888888888', demo_owner, 'Meirim Animal Care', 'Animal welfare team helping shelters with care shifts and adoption campaigns.', 'Almaty', null, 'help@meirimanimals.kz', 'https://meirimanimals.kz')
  on conflict (id) do update set
    owner_id = excluded.owner_id,
    name = excluded.name,
    description = excluded.description,
    city = excluded.city,
    logo_url = excluded.logo_url,
    contact_email = excluded.contact_email,
    website = excluded.website,
    updated_at = now();
  get diagnostics seeded_organizations = row_count;

  -- Demo volunteer opportunities across Kazakhstan.
  alter table public.opportunities add column if not exists min_age integer;

  insert into public.opportunities (
    id, organization_id, title, description, city, category, format, schedule,
    languages, badges, requirements, benefits, volunteer_hours, min_age, certificate_available
  )
  values
    ('aaaaaaaa-0001-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Student mentor for school students', 'Mentor high school students in Astana on study planning, confidence, and university pathways.', 'Astana', 'Education', 'Hybrid', 'Part-time', array['Kazakh','Russian'], array['Student-friendly','Certificate'], 'Communication skills, reliability, weekly availability.', 'Mentor training, certificate, verified volunteer hours.', 36, 16, true),
    ('aaaaaaaa-0002-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 'Eco cleanup volunteer', 'Join a weekend cleanup in Almaty parks and help run a recycling awareness booth.', 'Almaty', 'Environment', 'Offline', 'Weekend', array['Kazakh','Russian'], array['Weekend','Certificate','No experience needed'], 'Comfortable outdoor work.', 'Outdoor teamwork, environmental impact, certificate.', 8, 14, true),
    ('aaaaaaaa-0003-4000-8000-000000000003', '33333333-3333-4333-8333-333333333333', 'University conference event volunteer', 'Help guests, speakers, and students at an education and technology conference.', 'Astana', 'Events', 'Offline', 'Project', array['Russian','English'], array['Student-friendly','Certificate','English language'], 'Friendly communication and punctuality.', 'Networking, 16 volunteer hours, certificate.', 16, 18, true),
    ('aaaaaaaa-0004-4000-8000-000000000004', '44444444-4444-4444-8444-444444444444', 'Charity food distribution', 'Prepare and distribute food packages for families and elderly people in Shymkent.', 'Shymkent', 'Charity', 'Offline', 'Weekend', array['Kazakh','Russian'], array['Urgent','Weekend','No experience needed'], 'Respectful communication and reliability.', 'Direct community impact and team experience.', 12, null, false),
    ('aaaaaaaa-0005-4000-8000-000000000005', '66666666-6666-4666-8666-666666666666', 'Online language tutoring volunteer', 'Tutor school students online in English, Kazakh, or Russian.', 'Kazakhstan', 'Education', 'Online', 'Flexible', array['Kazakh','Russian','English'], array['Online','Student-friendly','Certificate','Flexible schedule'], 'Confident in at least one supported language.', 'Flexible schedule, certificate, tutoring experience.', 24, 16, true),
    ('aaaaaaaa-0006-4000-8000-000000000006', '88888888-8888-4888-8888-888888888888', 'Animal shelter care assistant', 'Help an Almaty shelter with walking, feeding, cleaning, and adoption days.', 'Almaty', 'Animals', 'Offline', 'Part-time', array['Russian'], array['Weekend','No experience needed'], 'Comfortable around dogs and cats.', 'Animal care experience and shelter team training.', 10, 16, false),
    ('aaaaaaaa-0007-4000-8000-000000000007', '55555555-5555-4555-8555-555555555555', 'Media and SMM volunteer for local NGO', 'Create posts, short videos, and volunteer stories for a charity campaign.', 'Karaganda', 'Media', 'Hybrid', 'Flexible', array['Kazakh','Russian'], array['Student-friendly','Certificate','Flexible schedule'], 'Basic Canva, Instagram, or TikTok skills.', 'Portfolio pieces and certificate.', 20, 16, true),
    ('aaaaaaaa-0008-4000-8000-000000000008', '55555555-5555-4555-8555-555555555555', 'Blood donation awareness campaign', 'Support information desks, flyers, and volunteer coordination.', 'Aktobe', 'Health', 'Offline', 'Project', array['Kazakh','Russian'], array['Urgent','Certificate','Kazakh language'], 'Respectful communication about health topics.', 'Health campaign experience and certificate.', 18, 18, true),
    ('aaaaaaaa-0009-4000-8000-000000000009', '66666666-6666-4666-8666-666666666666', 'Inclusive education assistant', 'Support inclusive learning sessions for children with additional needs.', 'Pavlodar', 'Education', 'Hybrid', 'Part-time', array['Kazakh','Russian'], array['Student-friendly','Certificate'], 'Patience and interest in inclusive education.', 'Inclusive education training and certificate.', 32, 18, true),
    ('aaaaaaaa-0010-4000-8000-000000000010', '77777777-7777-4777-8777-777777777777', 'Tech volunteer for nonprofit digitalization', 'Help a nonprofit organize forms, dashboards, website content, or documentation.', 'Kazakhstan', 'IT & Digital', 'Online', 'Flexible', array['Russian','English'], array['Online','Student-friendly','Certificate','English language'], 'Basic web, spreadsheet, or no-code skills.', 'Portfolio case, certificate, recommendation note.', 28, 16, true),
    ('aaaaaaaa-0011-4000-8000-000000000011', '44444444-4444-4444-8444-444444444444', 'Youth debate club facilitator', 'Facilitate debate sessions for teenagers and public speaking practice.', 'Kyzylorda', 'Youth', 'Offline', 'Few hours', array['Kazakh','Russian'], array['Student-friendly','Kazakh language'], 'Public speaking interest.', 'Facilitation practice and volunteer hours.', 14, 14, false),
    ('aaaaaaaa-0012-4000-8000-000000000012', '11111111-1111-4111-8111-111111111111', 'Community elder support calls', 'Make friendly check-in calls to elderly people and flag support needs.', 'Kazakhstan', 'Community', 'Online', 'Flexible', array['Kazakh','Russian'], array['Online','Certificate','Flexible schedule'], 'Warm phone communication.', 'Flexible online role and certificate.', 16, 18, true),
    ('aaaaaaaa-0013-4000-8000-000000000013', '77777777-7777-4777-8777-777777777777', 'Regional STEM workshop helper', 'Help run a beginner-friendly STEM workshop for school students.', 'Semey', 'IT & Digital', 'Hybrid', 'Project', array['Russian','English'], array['Student-friendly','Certificate','English language'], 'Basic programming or robotics interest.', 'Teaching experience and certificate.', 20, 16, true),
    ('aaaaaaaa-0014-4000-8000-000000000014', '33333333-3333-4333-8333-333333333333', 'Community fair registration volunteer', 'Welcome guests, support registration, and guide visitors.', 'Kostanay', 'Events', 'Offline', 'Few hours', array['Kazakh','Russian'], array['Student-friendly','No experience needed'], 'Friendly communication.', 'First volunteer experience and 6 volunteer hours.', 6, null, false),
    ('aaaaaaaa-0015-4000-8000-000000000015', '22222222-2222-4222-8222-222222222222', 'Recycling workshop assistant', 'Support a practical recycling workshop for families and students.', 'Atyrau', 'Environment', 'Offline', 'Project', array['Kazakh','Russian'], array['Certificate','No experience needed'], 'Interest in ecology and public education.', 'Workshop facilitation experience and certificate.', 12, 14, true),
    ('aaaaaaaa-0016-4000-8000-000000000016', '66666666-6666-4666-8666-666666666666', 'Online English speaking buddy', 'Help regional students practice conversational English online.', 'Kazakhstan', 'Education', 'Online', 'Few hours', array['English','Russian'], array['Online','Student-friendly','Flexible schedule','English language'], 'Comfortable conversational English.', 'Remote schedule and tutoring experience.', 18, 16, false),
    ('aaaaaaaa-0017-4000-8000-000000000017', '55555555-5555-4555-8555-555555555555', 'Family support hotline assistant', 'Help coordinators organize requests and follow-up calls for families.', 'Karaganda', 'Community', 'Hybrid', 'Part-time', array['Kazakh','Russian'], array['Urgent','Certificate'], 'Confidentiality and empathy.', 'Coordinator training and certificate.', 22, 18, true),
    ('aaaaaaaa-0018-4000-8000-000000000018', '88888888-8888-4888-8888-888888888888', 'Adoption day event volunteer', 'Support animal adoption day setup, visitor navigation, and photo stories.', 'Almaty', 'Animals', 'Offline', 'Weekend', array['Russian'], array['Weekend','No experience needed'], 'Comfortable with animals and visitors.', 'Shelter event experience.', 8, null, false)
  on conflict (id) do update set
    organization_id = excluded.organization_id,
    title = excluded.title,
    description = excluded.description,
    city = excluded.city,
    category = excluded.category,
    format = excluded.format,
    schedule = excluded.schedule,
    languages = excluded.languages,
    badges = excluded.badges,
    requirements = excluded.requirements,
    benefits = excluded.benefits,
    volunteer_hours = excluded.volunteer_hours,
    min_age = excluded.min_age,
    certificate_available = excluded.certificate_available,
    updated_at = now();
  get diagnostics seeded_opportunities = row_count;

  raise notice 'KomekHub seed complete: % organizations and % opportunities inserted or updated. Existing user-created rows were not deleted.',
    seeded_organizations,
    seeded_opportunities;
end $$;
