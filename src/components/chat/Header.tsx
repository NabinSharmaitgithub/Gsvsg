"use client";

import { Logo } from "@/components/icons/Logo";
import { Users } from "lucide-react";

type HeaderProps = {
  activeUsers: number;
};

export function Header({ activeUsers }: HeaderProps) {
  const getStatus = () => {
    if(activeUsers === 0) return { text: "Connecting...", color: "text-amber-500" };
    if(activeUsers === 1) return { text: "Waiting for other user...", color: "text-amber-500" };
    if(activeUsers === 2) return { text: "Connected", color: "text-green-500" };
    return { text: "Room is full", color: "text-red-500" };
  }

  const status = getStatus();

  return (
    <header className="flex items-center p-4 border-b border-white/10 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <Logo className="w-8 h-8 text-primary" />
      <div className="ml-4">
        <h1 className="text-lg font-bold font-headline">ShadowText</h1>
        <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${status.color.replace('text-','bg-')}`}></div>
            <p className={`text-xs ${status.color}`}>{status.text}</p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="w-4 h-4" />
        <span>{activeUsers}/2</span>
      </div>
    </header>
  );
}
