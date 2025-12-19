"use client";

import { useRef, useState, useTransition } from "react";
import { Send } from "lucide-radix";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { setTyping, sendMessage } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { SendHorizonal } from "lucide-react";

type MessageInputProps = {
  chatId: string;
  userId: string;
  cryptoKey: CryptoKey | null;
  onMessageSent: () => void;
};

let typingTimeout: NodeJS.Timeout | null = null;

export function MessageInput({ chatId, userId, cryptoKey, onMessageSent }: MessageInputProps) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTyping = (isTyping: boolean) => {
    startTransition(() => {
      setTyping(chatId, userId, isTyping);
    });
  };

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
    if (!text.trim() || !cryptoKey || isPending) return;

    const originalText = text;
    setText("");
    if(textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }

    startTransition(async () => {
      try {
        const { encryptMessage } = await import("@/lib/crypto");
        const encryptedText = await encryptMessage(originalText, cryptoKey);
        const result = await sendMessage(chatId, userId, encryptedText);
        if (!result.success) {
          throw new Error(result.error || "Failed to send message.");
        }
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
          placeholder="Type an ephemeral message..."
          rows={1}
          className="max-h-32"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={!cryptoKey || isPending}
        />
        <Button type="submit" size="icon" disabled={!text.trim() || !cryptoKey || isPending} aria-label="Send message">
          <SendHorizonal />
        </Button>
      </form>
    </div>
  );
}
