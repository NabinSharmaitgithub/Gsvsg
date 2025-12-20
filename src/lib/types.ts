import type { Timestamp } from "firebase/firestore";

export type UserProfile = {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string;
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp | any;
};

export type Chat = {
  id: string;
  participants: string[];
  createdAt: Timestamp;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: Timestamp;
  };
  typing?: string[];
  userStatus?: {
    [key: string]: {
      unreadCount: number;
      isOnline: boolean;
    }
  }
};
