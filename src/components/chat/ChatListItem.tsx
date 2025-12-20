"use client";

import { useMemo } from 'react';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import type { Chat, UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { doc } from 'firebase/firestore';

interface ChatListItemProps {
    chat: Chat;
    currentUserId: string;
}

export function ChatListItem({ chat, currentUserId }: ChatListItemProps) {
    const firestore = useFirestore();
    const otherUserId = chat.participants.find(uid => uid !== currentUserId);

    const otherUserRef = useMemoFirebase(() => {
        if (!firestore || !otherUserId) return null;
        return doc(firestore, 'users', otherUserId);
    }, [firestore, otherUserId]);

    const { data: otherUser, isLoading } = useDoc<UserProfile>(otherUserRef);

    const unreadCount = chat.userStatus?.[currentUserId]?.unreadCount || 0;

    if (isLoading) {
        return (
            <div className="flex items-center space-x-4 p-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        );
    }

    if (!otherUser) return null; // Or some fallback UI

    return (
        <div className="flex items-center p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors">
            <Avatar className="h-12 w-12 mr-4">
                <AvatarImage src={otherUser.photoURL} alt={otherUser.displayName} />
                <AvatarFallback>{otherUser.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
                <p className="font-semibold">{otherUser.displayName}</p>
                <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage?.text || 'No messages yet'}
                </p>
            </div>
            {unreadCount > 0 && (
                <div className="ml-4 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                </div>
            )}
        </div>
    );
}
