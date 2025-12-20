
"use client";

import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";
import { useEffect, useState } from "react";

type MessageBubbleProps = {
  message: Message & { isDisappearing?: boolean };
  isOwnMessage: boolean;
};

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {

  return (
    <div
      className={cn(
        "flex w-full transition-opacity duration-300",
        isOwnMessage ? "justify-end" : "justify-start",
        message.isDisappearing ? "animate-disappear" : "animate-in fade-in"
      )}
    >
      <div
        className={cn(
          "max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl break-words",
          isOwnMessage ? "bg-primary text-primary-foreground rounded-br-lg" : "bg-secondary text-secondary-foreground rounded-bl-lg"
        )}
      >
        <p className="text-sm">{message.text}</p>
      </div>
    </div>
  );
}
