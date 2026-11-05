export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  currency: string; // Defaults to UGX
  status: 'active' | 'suspended';
  emailVerified: boolean;
  createdAt: string;
}

export interface Admin {
  id: string;
  fullName: string;
  email: string;
  role: 'Super Admin' | 'Finance Admin' | 'Support Admin';
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface Deposit {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  reference: string;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  createdAt: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewReason?: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  payoutMethod: string;
  destinationDetails: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected' | 'failed';
  createdAt: string;
  payoutReference?: string | null;
  reviewedBy?: string | null;
  reviewReason?: string;
}

export interface SavingsPlan {
  id: string;
  userId: string;
  planName: string;
  amount: number;
  currency: string;
  dailyRate: number;
  waitingPeriodDays: number;
  status: 'pending_waiting' | 'active' | 'completed';
  createdAt: string;
  activationDate: string;
  earnedInterest: number;
  lastCalculatedDate?: string | null;
}

export interface CreditRecord {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
  category: string;
  reason: string;
  reference: string;
  issuedBy: string;
  createdAt: string;
}

export interface TreasuryRecord {
  id: string;
  source: string;
  currency: string;
  amount: number;
  date: string;
  reference: string;
  recordedBy: string;
}

export interface AuditLog {
  id: string;
  actorType: 'user' | 'admin' | 'system';
  actorId: string;
  action: string;
  details: any;
  timestamp: string;
}

export interface PlatformSettings {
  waitingPeriodDays: number;
  dailyInterestRate: number;
  minDeposit: number;
  maxDeposit: number;
  minWithdrawal: number;
  withdrawalFeePercent: number;
  supportedCurrencies: string[];
  maintenanceMode: boolean;
  maintenanceChangedBy?: string;
  maintenanceChangedAt?: string;
  maintenanceReason?: string;
}

export interface WebsiteStatusInfo {
  systemStatus: 'Online' | 'Maintenance';
  maintenanceMode: boolean;
  changedBy: string;
  changedAt: string | null;
  reason?: string | null;
  serverTime?: string;
  uptime?: number;
  activeUsersCount?: number;
}

export interface WebsiteAppearance {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  aboutTitle: string;
  aboutText: string;
  aboutPoints: string[];
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  socialLinks: {
    whatsapp?: string;
    twitter?: string;
    telegram?: string;
    linkedin?: string;
  };
  faqItems: Array<{ question: string; answer: string; category?: string }>;
  footerText: string;
  footerCopyright: string;
  navigationLabels: {
    overview: string;
    savingsEngine: string;
    security: string;
    faq: string;
    about: string;
    contact: string;
  };
  sectionOrder: string[];
  sectionVisibility: {
    hero: boolean;
    previewCard: boolean;
    engine: boolean;
    features: boolean;
    about: boolean;
    faq: boolean;
    contact: boolean;
  };
  announcement: {
    enabled: boolean;
    message: string;
    level: 'info' | 'warning' | 'alert';
    link?: string;
  };
  maintenanceMessage: string;
  version: number;
  updatedAt: string;
  updatedBy: string;
}

export interface AppearanceVersion {
  id: string;
  version: number;
  name: string;
  data: WebsiteAppearance;
  savedBy: string;
  savedAt: string;
  note?: string;
}

export interface CustomPage {
  id: string;
  slug: string;
  title: string;
  body: string;
  imageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  lastEditor: string;
}

export interface AdminNote {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface UserDetail extends User {
  notes?: AdminNote[];
  passwordResetRequired?: boolean;
  lastLoginAt?: string | null;
  totalDeposited: number;
  activeSavingsAmount: number;
  earnedInterest: number;
  pendingWithdrawalsAmount: number;
  availableBalance: number;
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  savingsPlans: SavingsPlan[];
  credits: CreditRecord[];
}

export interface SystemHealthInfo {
  status: 'healthy' | 'degraded' | 'offline';
  systemStatus: 'Online' | 'Maintenance';
  dbReachable: boolean;
  dbLatencyMs: number;
  dbFileSize: number;
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalSavingsPlans: number;
  totalAuditLogs: number;
  memoryUsageMb: number;
  uptimeSeconds: number;
  nodeVersion: string;
  timestamp: string;
}

