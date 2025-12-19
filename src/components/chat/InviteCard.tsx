"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { createChat } from "@/app/actions";
import { generateKey, exportKey } from "@/lib/crypto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function InviteCard() {
  const [inviteLink, setInviteLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCreateChat = async () => {
    setIsLoading(true);
    try {
      const chatAction = await createChat();
      if (!chatAction.success || !chatAction.chatId) {
        throw new Error(chatAction.error || "Failed to create chat.");
      }

      const key = await generateKey();
      const exportedKey = await exportKey(key);
      const url = `${window.location.origin}/chat/${chatAction.chatId}#${exportedKey}`;
      setInviteLink(url);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inviteLink) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">Share this one-time link to start your chat:</p>
        <div className="relative">
          <Input readOnly value={inviteLink} className="pr-10 text-xs" />
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8"
            onClick={handleCopy}
            aria-label="Copy link"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-amber-500/80">
          Warning: This link is for one person and will expire after use.
        </p>
      </div>
    );
  }

  return (
    <Button onClick={handleCreateChat} disabled={isLoading} className="w-full" size="lg">
      {isLoading ? "Generating Secure Chat..." : "Create New Chat"}
    </Button>
  );
}
