export type Language = 'en' | 'ru';
export type Page = 'home' | 'list' | 'detail' | 'profile' | 'organization' | 'post' | 'verify' | 'sign-in' | 'sign-up';
export type UserRole = 'volunteer' | 'organization';
export type Format = 'Offline' | 'Online' | 'Hybrid';
export type Schedule = 'Few hours' | 'Weekend' | 'Part-time' | 'Project' | 'Flexible';
export type VolunteerLanguage = 'Kazakh' | 'Russian' | 'English';
export type SortKey = 'relevant' | 'newest' | 'nearest' | 'popular';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export type LocalizedText = {
  en: string;
  ru: string;
};

export type Filters = {
  query: string;
  city: string;
  category: string;
  format: string;
  schedule: string;
  language: string;
  badge: string;
  sort: SortKey;
};

export type Category = {
  name: string;
  tone: string;
};

export type FilterOptions = {
  cities: string[];
  categories: string[];
  formats: string[];
  schedules: string[];
  languages: string[];
  badges: string[];
};

export type Opportunity = {
  id: string;
  organizationId?: string;
  title: LocalizedText;
  organization: string;
  organizationLogo?: string;
  city: string;
  format: Format;
  duration: LocalizedText;
  category: string;
  schedule: Schedule;
  description: LocalizedText;
  longDescription: LocalizedText;
  requirements: LocalizedText[];
  responsibilities: LocalizedText[];
  benefits: LocalizedText[];
  tags: string[];
  badges: string[];
  languages: VolunteerLanguage[];
  volunteerHours: number;
  certificate: boolean;
  postedDaysAgo: number;
  distanceKm: number;
  popularity: number;
  createdAt?: string;
};

export type Organization = {
  id?: string;
  name: string;
  logo: string;
  logoUrl?: string;
  rating: number;
  reviews: number;
  city: string;
  contactEmail?: string;
  description: LocalizedText;
};

export type Profile = {
  id: string;
  userId: string;
  fullName: string;
  role: UserRole;
  city: string;
  avatarUrl?: string;
  university?: string;
  languages: string[];
  skills: string[];
  interests: string[];
  volunteerHours: number;
};

export type Application = {
  id: string;
  userId: string;
  volunteerName: string;
  opportunityId: string;
  organizationName: string;
  status: ApplicationStatus;
  appliedAt: string;
  completedAt?: string;
  volunteerHours: number;
};

export type Certificate = {
  id: string;
  applicationId: string;
  userId: string;
  opportunityId: string;
  organizationId: string;
  certificateNumber: string;
  volunteerName: string;
  organizationName: string;
  opportunityTitle: LocalizedText;
  city: string;
  volunteerHours: number;
  issuedAt: string;
  certificateUrl?: string;
};
