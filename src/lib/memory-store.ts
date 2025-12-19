import { ChatRoom, Message } from "./types";
import { randomUUID } from "crypto";

const MESSAGE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const ROOM_TTL = 5 * 60 * 1000; // 5 minutes for an empty room

class ChatStore {
  private rooms: Map<string, ChatRoom>;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.rooms = new Map();
    this.cleanupInterval = setInterval(() => this.purgeOldData(), 60 * 1000); // every minute
  }

  createChat(): string {
    const id = randomUUID();
    this.rooms.set(id, {
      id,
      users: new Set(),
      messages: [],
      typing: new Set(),
      createdAt: Date.now(),
    });
    return id;
  }
  
  getRoom(id: string): ChatRoom | undefined {
    return this.rooms.get(id);
  }

  joinChat(id: string, userId: string): boolean {
    const room = this.getRoom(id);
    if (!room) {
      return false; // Room doesn't exist
    }
    // Allow re-joining, but don't let a 3rd user in.
    if (room.users.size >= 2 && !room.users.has(userId)) {
      return false;
    }
    room.users.add(userId);
    return true;
  }
  
  leaveChat(id: string, userId: string) {
    const room = this.getRoom(id);
    if(room) {
      room.users.delete(userId);
      room.typing.delete(userId);
      if (room.users.size === 0) {
        // Instead of deleting immediately, let the cleanup job handle it
        // to allow for reconnections.
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

  purgeOldData() {
    const now = Date.now();
    this.rooms.forEach((room, id) => {
      // Purge old messages
      room.messages = room.messages.filter(
        (msg) => now - msg.timestamp < MESSAGE_TTL
      );
      
      // Purge empty, old rooms
      if (room.users.size === 0 && now - room.createdAt > ROOM_TTL) {
        this.rooms.delete(id);
      }
    });
  }
}

// Export a singleton instance
export const memoryStore = new ChatStore();
