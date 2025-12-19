"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getEvents, joinChat, leaveChat, markMessagesAsRead } from "@/app/actions";
import { importKey } from "@/lib/crypto";
import type { Message, ServerEvent } from "@/lib/types";
import { Header } from "./Header";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ExtendedMessage = Message & { isDisappearing?: boolean };

export default function ChatLayout({ chatId }: { chatId: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isPolling = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDisappeared = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
  }, []);

  useEffect(() => {
    // Generate or retrieve user ID
    let sessionUserId = sessionStorage.getItem("shadow-user-id");
    if (!sessionUserId) {
      sessionUserId = crypto.randomUUID();
      sessionStorage.setItem("shadow-user-id", sessionUserId);
    }
    setUserId(sessionUserId);

    // Get crypto key from URL hash
    const keyData = window.location.hash.substring(1);
    if (!keyData) {
      setError("Encryption key not found. This link may be invalid or expired.");
      return;
    }
    
    importKey(keyData)
      .then(key => {
        setCryptoKey(key);
        return joinChat(chatId, sessionUserId!);
      })
      .then(joinResult => {
        if (!joinResult.success) {
           setError(joinResult.error || "Could not join chat. The room might be full.");
           router.push('/');
        }
      })
      .catch(() => setError("Invalid encryption key."));
      
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if(userId) {
           leaveChat(chatId, userId);
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        if(sessionUserId) {
           leaveChat(chatId, sessionUserId);
        }
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };

  }, [chatId, router]);


  const pollEvents = useCallback(async () => {
    if (isPolling.current || !userId) return;
    isPolling.current = true;

    try {
      const result = await getEvents(chatId, userId);

      if (result.success && result.events) {
        const { messages: serverMessages, typing, activeUsers: numActive } = result.events;
        
        setTypingUsers(typing);
        setActiveUsers(numActive);

        setMessages(prev => {
          const serverMessageIds = new Set(serverMessages.map(m => m.id));
          const updatedMessages = prev
            .map(localMsg => {
              if (!serverMessageIds.has(localMsg.id) && !localMsg.isDisappearing) {
                return { ...localMsg, isDisappearing: true };
              }
              return localMsg;
            })
            .filter(m => serverMessageIds.has(m.id) || m.isDisappearing);

          serverMessages.forEach(serverMsg => {
            if (!updatedMessages.some(local => local.id === serverMsg.id)) {
              updatedMessages.push(serverMsg);
            }
          });
          
          updatedMessages.sort((a,b) => a.timestamp - b.timestamp);
          return updatedMessages;
        });

      } else if (!result.success) {
        console.error("Polling failed:", result.error);
      }
    } catch (e) {
      console.error("Error during polling:", e);
    } finally {
      isPolling.current = false;
    }
  }, [chatId, userId]);

  useEffect(() => {
    if (userId && cryptoKey && !error) {
      const interval = setInterval(pollEvents, 1500);
      return () => clearInterval(interval);
    }
  }, [userId, cryptoKey, error, pollEvents]);


  useEffect(() => {
    scrollToBottom();

    const unreadMessages = messages.filter(m => m.senderId !== userId);
    if (unreadMessages.length > 0) {
      const unreadIds = unreadMessages.map(m => m.id);
      setTimeout(() => {
          markMessagesAsRead(chatId, unreadIds);
      }, 1000); // give user a second to see the message
    }

  }, [messages, chatId, userId]);

  if (error) {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-center p-4">
        <h2 className="text-2xl font-bold text-destructive">Chat Unavailable</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={() => router.push('/')} className="mt-6">Go to Homepage</Button>
      </div>
    );
  }
  
  if (!userId || !cryptoKey) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4">Establishing secure connection...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header activeUsers={activeUsers} />
      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map(msg => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwnMessage={msg.senderId === userId}
              cryptoKey={cryptoKey}
              onDisappeared={handleDisappeared}
            />
          ))}
          {typingUsers.length > 0 && <TypingIndicator />}
        </div>
        <div ref={messagesEndRef} />
      </main>
      <MessageInput chatId={chatId} userId={userId} cryptoKey={cryptoKey} onMessageSent={scrollToBottom} />
    </div>
  );
}
