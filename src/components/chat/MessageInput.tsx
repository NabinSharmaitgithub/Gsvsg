"use client";

import { useRef, useState, useTransition, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { SendHorizonal } from "lucide-react";
import { collection, doc, serverTimestamp, writeBatch, increment, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useFirestore } from "@/firebase";

type MessageInputProps = {
  chatId: string;
  userId: string;
  otherUserId: string | undefined;
  onMessageSent: () => void;
};

export function MessageInput({ chatId, userId, otherUserId, onMessageSent }: MessageInputProps) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const firestore = useFirestore();

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setTypingStatus = useCallback((isTyping: boolean) => {
    if (!chatId) return;
    const chatRef = doc(firestore, 'chats', chatId);
    const operation = isTyping ? arrayUnion(userId) : arrayRemove(userId);
    updateDoc(chatRef, { typing: operation })
      .catch(err => console.error("Error updating typing status: ", err));
  }, [firestore, chatId, userId]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setTypingStatus(false);
    };
  }, [setTypingStatus]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    if (!typingTimeoutRef.current) {
      setTypingStatus(true);
    } else {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(false);
      typingTimeoutRef.current = null;
    }, 2000);

    // Auto-resize textarea
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isPending || !otherUserId) return;

    const originalText = text;
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    // Clear typing timeout and set status to false immediately
    if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
    }
    setTypingStatus(false);


    startTransition(async () => {
      try {
        const chatRef = doc(firestore, 'chats', chatId);
        const messagesColRef = collection(firestore, 'chats', chatId, 'messages');
        
        const newMessage = {
            senderId: userId,
            text: originalText,
            timestamp: serverTimestamp(),
        }

        const batch = writeBatch(firestore);

        const messageRef = doc(messagesColRef);
        batch.set(messageRef, newMessage);

        batch.update(chatRef, {
            lastMessage: {
                text: originalText,
                timestamp: serverTimestamp(),
                senderId: userId,
            },
            [`userStatus.${otherUserId}.unreadCount`]: increment(1),
        });
        
        await batch.commit();

        onMessageSent();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error sending message",
          description: error instanceof Error ? error.message : "An unknown error occurred",
        });
        setText(originalText); // Restore text if sending failed
      }
    });
  };

  return (
    <div className="p-4 border-t border-white/10 bg-background/80 backdrop-blur-sm sticky bottom-0">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          placeholder="Type a message..."
          rows={1}
          className="max-h-32"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={isPending}
        />
        <Button type="submit" size="icon" disabled={!text.trim() || isPending} aria-label="Send message">
          <SendHorizonal />
        </Button>
      </form>
    </div>
  );
}
