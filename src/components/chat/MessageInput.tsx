"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { SendHorizonal } from "lucide-react";
import { collection, doc, serverTimestamp, writeBatch, increment } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { arrayRemove, arrayUnion, updateDoc } from "firebase/firestore";

type MessageInputProps = {
  chatId: string;
  userId: string;
  otherUserId: string | undefined;
  onMessageSent: () => void;
};

let typingTimeout: NodeJS.Timeout | null = null;

export function MessageInput({ chatId, userId, otherUserId, onMessageSent }: MessageInputProps) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const firestore = useFirestore();

  const chatRef = doc(firestore, 'chats', chatId);

  const handleTyping = (isTyping: boolean) => {
    updateDoc(chatRef, {
        typing: isTyping ? arrayUnion(userId) : arrayRemove(userId)
    }).catch(err => console.error("Error updating typing status: ", err));
  };

  useEffect(() => {
    return () => {
        if(typingTimeout) clearTimeout(typingTimeout);
        handleTyping(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    
    if (typingTimeout) clearTimeout(typingTimeout);
    else handleTyping(true);

    typingTimeout = setTimeout(() => {
      handleTyping(false);
      typingTimeout = null;
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
    if(textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }

    startTransition(async () => {
      try {
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
      } finally {
        if (typingTimeout) clearTimeout(typingTimeout);
        handleTyping(false);
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
