export type Language = 'en' | 'ru' | 'kk';
export type Page = 'home' | 'list' | 'detail' | 'profile' | 'organization' | 'dashboard' | 'post' | 'verify' | 'sign-in' | 'sign-up';
export type UserRole = 'volunteer' | 'organization';
export type Format = 'Offline' | 'Online' | 'Hybrid';
export type Schedule = 'Few hours' | 'Weekend' | 'Part-time' | 'Project' | 'Flexible';
export type VolunteerLanguage = 'Kazakh' | 'Russian' | 'English';
export type SortKey = 'relevant' | 'newest' | 'nearest' | 'popular';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
export type OpportunityStatus = 'recruiting' | 'closed' | 'in_progress' | 'completed';
export type VolunteerResponseStatus = 'pending' | 'accepted' | 'declined';

export type LocalizedText = {
  en: string;
  ru: string;
  kk?: string;
};

export type Filters = {
  query: string;
  city: string;
  category: string;
  format: string;
  schedule: string;
  age: string;
  language: string;
  languages: string[];
  badge: string;
  badges: string[];
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
  ages: string[];
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
  minAge?: number;
  certificate: boolean;
  status: OpportunityStatus;
  applicationCount: number;
  postedDaysAgo: number;
  distanceKm: number;
  popularity: number;
  createdAt?: string;
};

export type Organization = {
  id?: string;
  ownerId?: string;
  name: string;
  logo: string;
  logoUrl?: string;
  rating: number;
  reviews: number;
  city: string;
  contactEmail?: string;
  phone?: string;
  website?: string;
  description: LocalizedText;
};

export type OrganizationInput = {
  name: string;
  description: string;
  city: string;
  contactEmail: string;
  phone: string;
  website: string;
};

export type OpportunityInput = {
  title: string;
  description: string;
  city: string;
  category: string;
  format: string;
  schedule: string;
  languages: string[];
  badges: string[];
  requirements: string;
  benefits: string;
  volunteerHours: number;
  minAge?: number | null;
  certificateAvailable: boolean;
  status: OpportunityStatus;
};

export type Profile = {
  id: string;
  userId: string;
  fullName: string;
  role: UserRole;
  city: string;
  avatarUrl?: string;
  birthDate?: string;
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
  volunteerResponse: VolunteerResponseStatus;
  assignedRole?: string;
  organizationNote?: string;
};

export type OrganizationApplication = Application & {
  volunteerCity: string;
  opportunityTitle: string;
  message?: string;
  certificateAvailable: boolean;
  certificateNumber?: string;
};

export type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  relatedApplicationId?: string;
  relatedOpportunityId?: string;
  createdAt: string;
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
