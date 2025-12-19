import { ChatRoom, Message } from "./types";
import { randomUUID } from "crypto";

const MESSAGE_TTL = 24 * 60 * 60 * 1000; // 24 hours

class ChatStore {
  private rooms: Map<string, ChatRoom>;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.rooms = new Map();
    this.cleanupInterval = setInterval(() => this.purgeOldMessages(), 60 * 60 * 1000); // every hour
  }

  createChat(): string {
    const id = randomUUID();
    this.rooms.set(id, {
      id,
      users: new Set(),
      messages: [],
      typing: new Set(),
      userLeft: new Set(),
    });
    return id;
  }
  
  getRoom(id: string): ChatRoom | undefined {
    return this.rooms.get(id);
  }

  joinChat(id: string, userId: string): boolean {
    const room = this.getRoom(id);
    if (!room || room.users.size >= 2) {
      if(room && !room.users.has(userId)) return false;
    }
    room.users.add(userId);
    room.userLeft.delete(userId);
    return true;
  }
  
  leaveChat(id: string, userId: string) {
    const room = this.getRoom(id);
    if(room) {
      room.users.delete(userId);
      room.typing.delete(userId);
      room.userLeft.add(userId);
      if (room.users.size === 0) {
        // Delete room if both users have left
        this.rooms.delete(id);
      }
    }
  }

  addMessage(id: string, senderId: string, text: string): Message | null {
    const room = this.getRoom(id);
    if (!room) return null;

    const message: Message = {
      id: randomUUID(),
      senderId,
      text,
      timestamp: Date.now(),
    };
    room.messages.push(message);
    return message;
  }

  getEvents(id: string, userId: string) {
    const room = this.getRoom(id);
    if (!room) return null;

    const otherTypingUsers = Array.from(room.typing).filter(uid => uid !== userId);
    
    return {
      messages: room.messages,
      typing: otherTypingUsers,
      activeUsers: room.users.size
    };
  }

  markMessagesAsRead(id: string, messageIds: string[]) {
    const room = this.getRoom(id);
    if (!room) return;
    room.messages = room.messages.filter((msg) => !messageIds.includes(msg.id));
  }

  setTyping(id: string, userId: string, isTyping: boolean) {
    const room = this.getRoom(id);
    if (!room) return;
    if (isTyping) {
      room.typing.add(userId);
    } else {
      room.typing.delete(userId);
    }
  }

  purgeOldMessages() {
    const now = Date.now();
    this.rooms.forEach((room) => {
      room.messages = room.messages.filter(
        (msg) => now - msg.timestamp < MESSAGE_TTL
      );
      if(room.users.size === 0 && room.messages.length === 0){
        this.rooms.delete(room.id);
      }
    });
  }
}

// Export a singleton instance
export const memoryStore = new ChatStore();
