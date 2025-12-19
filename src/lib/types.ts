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
  userLeft: Set<string>;
};

export type ServerEvent = {
  messages: Message[];
  typing: string[];
  activeUsers: number;
};
