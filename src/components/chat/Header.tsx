
"use client";

import { Logo } from "@/components/icons/Logo";
import { UserProfile } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

type HeaderProps = {
  otherUser: UserProfile | null | undefined;
};

export function Header({ otherUser }: HeaderProps) {

  return (
    <header className="flex items-center p-2 md:p-4 border-b border-white/10 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/dashboard" className="mr-2">
            <Button variant="ghost" size="icon" aria-label="Back to dashboard">
                <ArrowLeft />
            </Button>
        </Link>
        {otherUser ? (
            <>
                <Avatar className="w-10 h-10">
                    <AvatarImage src={otherUser.photoURL} alt={otherUser.displayName} />
                    <AvatarFallback>{otherUser.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                    <h1 className="text-lg font-bold font-headline">{otherUser.displayName}</h1>
                    <p className="text-xs text-muted-foreground">{otherUser.email}</p>
                </div>
            </>
        ) : (
             <div className="flex items-center">
                <Logo className="w-8 h-8 text-primary" />
                <h1 className="text-lg font-bold font-headline ml-4">ShadowText</h1>
             </div>
        )}
    </header>
  );
}
