// User & Auth Types
export interface User {
  userId: string;
  email: string;
  role: string;
  profile?: UserProfile;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Quest Types
export interface Quest {
  questId: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  creatorId: string;
  checkpoints: Checkpoint[];
  rating?: number;
  totalRatings?: number;
  participants?: number;
  createdAt: string;
  distance?: number;
  estimatedDuration?: number;
}

export interface Checkpoint {
  checkpointId: string;
  order: number;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  radius: number;
  type: 'LOCATION' | 'PHOTO' | 'QR_CODE' | 'CHALLENGE';
}

// Gamification Types
export interface UserXP {
  userId: string;
  totalXp: number;
  currentLevel: number;
  xpThisWeek: number;
  xpThisMonth: number;
}

export interface Achievement {
  achievementId: string;
  name: string;
  description: string;
  category: string;
  xpReward: number;
  iconUrl?: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalXp: number;
  currentLevel: number;
  rank: number;
}

// Social Types
export interface Activity {
  activityId: string;
  userId: string;
  type: string;
  title: string;
  content: any;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export interface Notification {
  notificationId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Payment Types
export interface Subscription {
  subscriptionId: string;
  tier: 'BASIC' | 'STANDARD' | 'PREMIUM';
  amount: number;
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE';
  currentPeriodEnd: string;
}
