"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { decryptMessage } from "@/lib/crypto";
import type { Message } from "@/lib/types";

type MessageBubbleProps = {
  message: Message & { isDisappearing?: boolean };
  isOwnMessage: boolean;
  cryptoKey: CryptoKey | null;
  onDisappeared: (messageId: string) => void;
};

export function MessageBubble({ message, isOwnMessage, cryptoKey, onDisappeared }: MessageBubbleProps) {
  const [decryptedText, setDecryptedText] = useState("...");

  useEffect(() => {
    const decrypt = async () => {
      if (cryptoKey && message.text) {
        const text = await decryptMessage(message.text, cryptoKey);
        setDecryptedText(text);
      }
    };
    decrypt();
  }, [message.text, cryptoKey]);

  return (
    <div
      className={cn(
        "flex w-full",
        isOwnMessage ? "justify-end" : "justify-start",
        message.isDisappearing && "animate-disappear pointer-events-none"
      )}
      onAnimationEnd={() => {
        if (message.isDisappearing) {
          onDisappeared(message.id);
        }
      }}
    >
      <div
        className={cn(
          "max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl break-words",
          isOwnMessage ? "bg-primary text-primary-foreground rounded-br-lg" : "bg-secondary text-secondary-foreground rounded-bl-lg"
        )}
      >
        <p className="text-sm">{decryptedText}</p>
      </div>
    </div>
  );
}
