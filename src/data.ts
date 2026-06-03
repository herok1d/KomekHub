import {
  BookOpen,
  HeartHandshake,
  Leaf,
  Megaphone,
  Palette,
  Stethoscope,
  Users,
} from 'lucide-react';

export type Format = 'Offline' | 'Online' | 'Hybrid';
export type Employment = 'Few hours' | 'Part-time' | 'Weekend' | 'Project';

export type Opportunity = {
  id: number;
  title: string;
  organization: string;
  city: string;
  format: Format;
  duration: string;
  category: string;
  employment: Employment;
  description: string;
  longDescription: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  tags: string[];
  badges: string[];
  postedDaysAgo: number;
  distanceKm: number;
};

export const categories = [
  { name: 'Education', count: 42, icon: BookOpen, tone: 'bg-skysoft text-ocean' },
  { name: 'Health', count: 28, icon: Stethoscope, tone: 'bg-mint text-leaf' },
  { name: 'Environment', count: 36, icon: Leaf, tone: 'bg-emerald-50 text-emerald-700' },
  { name: 'Community', count: 51, icon: Users, tone: 'bg-indigo-50 text-indigo-700' },
  { name: 'Fundraising', count: 19, icon: HeartHandshake, tone: 'bg-rose-50 text-rose-700' },
  { name: 'Media', count: 15, icon: Megaphone, tone: 'bg-amber-50 text-amber-700' },
  { name: 'Arts', count: 23, icon: Palette, tone: 'bg-violet-50 text-violet-700' },
];

export const opportunities: Opportunity[] = [
  {
    id: 1,
    title: 'Youth Mentorship Program',
    organization: 'Bright Futures Network',
    city: 'New York',
    format: 'Hybrid',
    duration: '3 months',
    category: 'Education',
    employment: 'Part-time',
    description: 'Support high school students with weekly mentoring sessions, career talks, and confidence-building workshops.',
    longDescription:
      'Bright Futures Network connects volunteer mentors with students preparing for college, first jobs, and personal projects. Volunteers meet students online and join one in-person group workshop each month.',
    requirements: ['Clear communication skills', 'Available 2 evenings per month', 'Interest in youth development'],
    responsibilities: ['Run one-to-one mentoring calls', 'Help students set goals', 'Join monthly group workshops'],
    benefits: ['Mentor training', 'Verified volunteer hours', 'Community networking events'],
    tags: ['Students', 'Mentoring', 'Career support'],
    badges: ['Student-friendly', 'Weekend'],
    postedDaysAgo: 2,
    distanceKm: 7,
  },
  {
    id: 2,
    title: 'Online Crisis Chat Support',
    organization: 'CareLine Collective',
    city: 'Remote',
    format: 'Online',
    duration: '6 weeks training',
    category: 'Health',
    employment: 'Few hours',
    description: 'Help moderate supportive online chats after completing a guided mental health first-response training.',
    longDescription:
      'CareLine Collective provides supervised digital support for people who need a calm first contact. Volunteers receive training and work in scheduled shifts with experienced coordinators.',
    requirements: ['Empathy and discretion', 'Stable internet connection', 'Complete online training'],
    responsibilities: ['Respond to incoming chat requests', 'Escalate urgent situations', 'Document shift notes'],
    benefits: ['Professional training', 'Flexible shifts', 'Reference letter after completion'],
    tags: ['Mental health', 'Remote', 'Training provided'],
    badges: ['Urgent', 'Online'],
    postedDaysAgo: 1,
    distanceKm: 0,
  },
  {
    id: 3,
    title: 'Urban Garden Weekend Crew',
    organization: 'Green Blocks',
    city: 'Austin',
    format: 'Offline',
    duration: 'Every Saturday',
    category: 'Environment',
    employment: 'Weekend',
    description: 'Plant, harvest, and maintain community gardens that provide fresh food to neighborhood kitchens.',
    longDescription:
      'Green Blocks transforms unused lots into productive community gardens. Weekend volunteers work alongside local residents to plant, compost, harvest, and prepare produce deliveries.',
    requirements: ['Comfortable working outdoors', 'No gardening experience required', 'Able to lift light materials'],
    responsibilities: ['Prepare garden beds', 'Water and harvest produce', 'Pack donations for local kitchens'],
    benefits: ['Fresh outdoor work', 'Gardening skills', 'Team lunch after shifts'],
    tags: ['Gardening', 'Food access', 'Outdoor'],
    badges: ['Weekend'],
    postedDaysAgo: 8,
    distanceKm: 3,
  },
  {
    id: 4,
    title: 'Community Event Photographer',
    organization: 'Open Streets Foundation',
    city: 'Chicago',
    format: 'Offline',
    duration: 'One-day event',
    category: 'Media',
    employment: 'Project',
    description: 'Capture warm, candid photos at a neighborhood event celebrating accessible public spaces.',
    longDescription:
      'Open Streets Foundation needs a volunteer photographer for a one-day community event. Photos will support future grant reports, social posts, and community newsletters.',
    requirements: ['Own camera or strong phone photography skills', 'Portfolio or sample photos', 'Comfortable photographing groups'],
    responsibilities: ['Document activities and speakers', 'Edit a small photo set', 'Share files within 5 days'],
    benefits: ['Portfolio credit', 'Event access', 'Public attribution'],
    tags: ['Photography', 'Events', 'Portfolio'],
    badges: ['Student-friendly'],
    postedDaysAgo: 4,
    distanceKm: 12,
  },
  {
    id: 5,
    title: 'Digital Accessibility Tester',
    organization: 'Access for All Lab',
    city: 'Remote',
    format: 'Online',
    duration: '4 weeks',
    category: 'Community',
    employment: 'Few hours',
    description: 'Test nonprofit websites and report usability issues that affect people with disabilities.',
    longDescription:
      'Access for All Lab audits digital services for small nonprofits. Volunteers follow checklists, test pages, and write clear reports for partner organizations.',
    requirements: ['Detail-oriented mindset', 'Basic web literacy', 'Interest in inclusive design'],
    responsibilities: ['Run accessibility checklists', 'Write concise findings', 'Join weekly review calls'],
    benefits: ['Accessibility training', 'Remote schedule', 'Certificate of contribution'],
    tags: ['Accessibility', 'UX', 'Remote'],
    badges: ['Online', 'Student-friendly'],
    postedDaysAgo: 5,
    distanceKm: 0,
  },
  {
    id: 6,
    title: 'Shelter Meal Service Team',
    organization: 'Harbor Home',
    city: 'Boston',
    format: 'Offline',
    duration: '2 shifts per month',
    category: 'Community',
    employment: 'Part-time',
    description: 'Prepare and serve evening meals for residents at a family shelter with an experienced kitchen lead.',
    longDescription:
      'Harbor Home provides temporary housing and support for families. Volunteers join small teams to prepare simple meals, serve residents, and clean the kitchen after dinner.',
    requirements: ['Food safety briefing', 'Respectful communication', 'Evening availability'],
    responsibilities: ['Prepare meal stations', 'Serve residents', 'Clean shared kitchen spaces'],
    benefits: ['Hands-on impact', 'Team-based shifts', 'Verified hours'],
    tags: ['Food service', 'Families', 'Local'],
    badges: ['Urgent', 'Weekend'],
    postedDaysAgo: 3,
    distanceKm: 5,
  },
];

export const organizations = [
  {
    name: 'Bright Futures Network',
    logo: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=240&q=80',
    rating: 4.8,
    reviews: 128,
    description:
      'A youth-focused nonprofit helping students build confidence, practical skills, and professional networks.',
  },
  {
    name: 'Green Blocks',
    logo: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=240&q=80',
    rating: 4.7,
    reviews: 91,
    description:
      'A city gardening initiative creating greener blocks and stronger food access through local volunteer teams.',
  },
  {
    name: 'CareLine Collective',
    logo: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=240&q=80',
    rating: 4.9,
    reviews: 204,
    description:
      'A remote-first care organization offering supervised digital support and training for compassionate volunteers.',
  },
];
