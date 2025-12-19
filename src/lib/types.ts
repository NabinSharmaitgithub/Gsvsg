export type Message = {
  id: string;
  senderId: string;
  text: string; // This will be the encrypted content
  timestamp: number;
};

export type ChatRoom = {
  id:string;
  users: Set<string>;
  messages: Message[];
  typing: Set<string>;
  createdAt: number;
};

export type ServerEvent = {
  messages: Message[];
  typing: string[];
  activeUsers: number;
};
