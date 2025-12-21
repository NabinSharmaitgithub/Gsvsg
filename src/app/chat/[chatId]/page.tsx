
"use client";

import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { useRouter, useParams } from "next/navigation";
import { doc } from 'firebase/firestore';
import ChatLayout from '@/components/chat/ChatLayout';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Chat } from '@/lib/types';


export default function ChatPage() {
  const { chatId } = useParams();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const chatRef = useMemoFirebase(() => {
    if (!firestore || !chatId) return null;
    return doc(firestore, 'chats', chatId as string);
  }, [firestore, chatId]);

  const { data: chatData, isLoading: isChatLoading, error: chatError } = useDoc<Chat>(chatRef);

  if (isUserLoading || isChatLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4">Loading Chat...</p>
      </div>
    );
  }
  
  if (!user) {
    // This should ideally not happen if routing is protected, but as a fallback
    router.push('/');
    return null;
  }

  if (chatError || !chatData) {
      return (
        <div className="flex flex-col h-screen items-center justify-center text-center p-4">
            <h2 className="text-2xl font-bold text-destructive">Chat Not Found</h2>
            <p className="text-muted-foreground mt-2">Could not load chat data or you don't have permission.</p>
            <Button onClick={() => router.push('/')} className="mt-6">Go to Homepage</Button>
        </div>
      );
  }
  
  // Ensure the current user is part of the chat
  if (!chatData.participants.includes(user.uid)) {
    return (
        <div className="flex flex-col h-screen items-center justify-center text-center p-4">
            <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
            <p className="text-muted-foreground mt-2">You are not a participant in this chat.</p>
            <Button onClick={() => router.push('/')} className="mt-6">Go to Homepage</Button>
        </div>
    );
  }

  const otherUserId = chatData.participants.find(p => p !== user.uid);

  return <ChatLayout chatId={chatId as string} currentUser={user} otherUserId={otherUserId} />;
}
