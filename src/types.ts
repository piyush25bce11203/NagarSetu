// Shared types — no circular imports

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

export interface Comment {
  id: string;
  text: string;
  timestamp: Date;
  author: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  media?: MediaItem[];
  district: string;
  ward: string;
  street: string;
  coordinates: { lat: number; lng: number };
  distance: number;
  timestamp: Date;
  aiTag: string;
  aiConfidence: number;
  // AI suggested department based on image/description analysis
  aiSuggestedDept?: string;
  status: 'pending' | 'acknowledged' | 'submitted' | 'resolved';
  upvotes: number;
  comments: Comment[];
  severity: number;
  type: string;
  userId?: string;
  hasUserUpvoted?: boolean;
  isTamperDetected?: boolean;
  priority?: 'high' | 'medium' | 'low';
  assignedDept?: string;
  // Deadline set by admin — if missed and not resolved, city loses ranking points
  deadline?: string; // ISO string
  deadlinePenaltyApplied?: boolean;
  // Photo proof submitted by staff when marking resolved
  resolutionProofUrl?: string;
}
