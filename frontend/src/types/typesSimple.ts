// Simplified types for file manager application
export interface User {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  user_name?: string;
  user_profile_picture?: string | null;
  created_at?: string;
}

export interface PostDetails extends Post {
  user_id: string;
  status: string;
  likes_count: number;
  saves_count: number;
  shares_count: number;
  updated_at: string;
  user_bio?: string | null;
  media: any[];
}

export interface PostDetailProps {
  post: PostDetails;
  loading?: boolean;
  onClose: () => void;
}

// File upload related types
export interface FileUpload {
  id: string;
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
  upload_date: string;
  user_id: string;
}

// Auth related types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message: string;
}
