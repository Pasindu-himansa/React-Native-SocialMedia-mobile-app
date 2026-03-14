export interface User {
  uid: string;
  email: string;
  username: string;
  avatarUrl?: string;
  createdAt: number;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  imageUrl: string;
  caption?: string;
  likes: string[];
  commentCount: number;
  createdAt: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  text: string;
  createdAt: number;
}
