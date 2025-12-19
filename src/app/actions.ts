"use server";

import { memoryStore } from "@/lib/memory-store";

export async function createChat() {
  try {
    const chatId = memoryStore.createChat();
    return { success: true, chatId };
  } catch (error) {
    return { success: false, error: "Failed to create chat." };
  }
}

export async function joinChat(chatId: string, userId: string) {
    const success = memoryStore.joinChat(chatId, userId);
    if(!success) {
      return { success: false, error: "Chat room is full or does not exist." };
    }
    return { success: true };
}

export async function leaveChat(chatId: string, userId: string) {
  memoryStore.leaveChat(chatId, userId);
  return { success: true };
}

export async function sendMessage(chatId: string, senderId: string, text: string) {
  try {
    const message = memoryStore.addMessage(chatId, senderId, text);
    if (!message) {
      return { success: false, error: "Chat room not found." };
    }
    return { success: true, message };
  } catch (error) {
    return { success: false, error: "Failed to send message." };
  }
}

export async function getEvents(chatId: string, userId: string) {
  try {
    const events = memoryStore.getEvents(chatId, userId);
    if (events === null) {
      return { success: false, error: "Chat room not found." };
    }
    return { success: true, events };
  } catch (error) {
    console.error("GetEvents error:", error);
    return { success: false, error: "Failed to fetch events." };
  }
}

export async function markMessagesAsRead(chatId: string, messageIds: string[]) {
  try {
    memoryStore.markMessagesAsRead(chatId, messageIds);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to mark messages as read." };
  }
}

export async function setTyping(chatId: string, userId: string, isTyping: boolean) {
  try {
    memoryStore.setTyping(chatId, userId, isTyping);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to set typing status." };
  }
}
