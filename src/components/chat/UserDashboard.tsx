
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/firebase/provider";
import { useUser } from "@/firebase/auth/use-user";
import { useFirestore } from "@/firebase/provider";
import { useCollection, useMemoFirebase } from "@/firebase/firestore/use-collection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InviteCard } from "./InviteCard";
import { collection, query, where, orderBy } from "firebase/firestore";
import type { Chat } from "@/lib/types";
import { Loader2, MessageSquarePlus, LogOut } from "lucide-react";
import Link from "next/link";
import { ChatListItem } from "./ChatListItem";
import { signOut } from "firebase/auth";

export function UserDashboard() {
    const auth = useAuth();
    const { user } = useUser();
    const firestore = useFirestore();
    const [year, setYear] = useState<number | null>(null);

    useEffect(() => {
        // This ensures the year is only calculated on the client, preventing hydration errors.
        setYear(new Date().getFullYear());
    }, []);

    const chatsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'chats'),
            where('participants', 'array-contains', user.uid),
            orderBy('lastMessage.timestamp', 'desc')
        );
    }, [firestore, user]);

    const { data: chats, isLoading: chatsLoading } = useCollection<Chat>(chatsQuery);

    const handleSignOut = () => {
        if (auth) {
            signOut(auth);
        }
    };

    if (!user) return null;

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                            <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-xl">{user.displayName}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2 flex items-center"><MessageSquarePlus className="mr-2" /> Start a new chat</h3>
                        <InviteCard />
                    </div>

                    <h3 className="text-lg font-semibold mb-2">Your Conversations</h3>
                    <div className="space-y-2">
                        {chatsLoading && (
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        )}
                        {chats && chats.length > 0 ? (
                            chats.map((chat) => (
                                <Link href={`/chat/${chat.id}`} key={chat.id}>
                                    <ChatListItem chat={chat} currentUserId={user.uid} />
                                </Link>
                            ))
                        ) : (
                            !chatsLoading && <p className="text-muted-foreground text-sm text-center p-4">You have no active conversations. Start one above!</p>
                        )}
                    </div>
                </CardContent>
            </Card>
            <footer className="text-center mt-8 text-xs text-muted-foreground">
                {year && <p>&copy; {year} ShadowText. Your privacy is paramount.</p>}
            </footer>
        </div>
    );
}
