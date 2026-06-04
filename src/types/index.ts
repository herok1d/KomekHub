export type Language = 'en' | 'ru';
export type Page = 'home' | 'list' | 'detail' | 'profile' | 'organization' | 'post' | 'verify';
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
  count: number;
  tone: string;
};

export type Opportunity = {
  id: number;
  title: LocalizedText;
  organization: string;
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
};

export type Organization = {
  name: string;
  logo: string;
  rating: number;
  reviews: number;
  city: string;
  description: LocalizedText;
};

export type Application = {
  id: string;
  userId: string;
  volunteerName: string;
  opportunityId: number;
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
  opportunityId: number;
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
