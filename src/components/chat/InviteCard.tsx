"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useUser, useFirestore } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Send } from "lucide-react";
import type { UserProfile } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";

async function findOrCreateChat(firestore: any, currentUserUid: string, otherUserUid: string): Promise<string> {
    const chatsRef = collection(firestore, "chats");
    
    // Query for existing chat with both participants
    const q1 = query(chatsRef, where("participants", "==", [currentUserUid, otherUserUid]));
    const q2 = query(chatsRef, where("participants", "==", [otherUserUid, currentUserUid]));

    const [querySnapshot1, querySnapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    
    if (!querySnapshot1.empty) {
        return querySnapshot1.docs[0].id;
    }
    if (!querySnapshot2.empty) {
        return querySnapshot2.docs[0].id;
    }

    // No existing chat, so create a new one
    const newChatRef = await addDoc(chatsRef, {
        participants: [currentUserUid, otherUserUid],
        createdAt: serverTimestamp(),
        lastMessage: null,
        typing: [],
        userStatus: {
            [currentUserUid]: { unreadCount: 0, isOnline: true },
            [otherUserUid]: { unreadCount: 0, isOnline: false },
        }
    });

    return newChatRef.id;
}


export function InviteCard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState<string | null>(null);
  
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !user) return;
    setIsLoading(true);
    try {
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("email", "==", searchQuery.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);
      const results: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        // Exclude current user from search results
        if (doc.id !== user.uid) {
            results.push({ uid: doc.id, ...doc.data() } as UserProfile);
        }
      });
      setSearchResults(results);
      if (results.length === 0) {
        toast({
            title: "No users found",
            description: "No user found with that email address.",
        })
      }
    } catch (error) {
      console.error("Error searching for users:", error);
      toast({
        variant: "destructive",
        title: "Search Error",
        description: "Failed to search for users.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (otherUser: UserProfile) => {
    if (!user) return;
    setIsCreatingChat(otherUser.uid);
    try {
        const chatId = await findOrCreateChat(firestore, user.uid, otherUser.uid);
        router.push(`/chat/${chatId}`);
    } catch (error) {
         console.error("Error creating or finding chat:", error);
         toast({
            variant: "destructive",
            title: "Chat Error",
            description: "Could not start the chat.",
         });
    } finally {
        setIsCreatingChat(null);
    }
  }

  return (
    <div className="w-full">
        <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
            <Input
            type="email"
            placeholder="Search by user email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
            </Button>
      </form>

      <div className="space-y-2">
        {searchResults.map((foundUser) => (
            <Card key={foundUser.uid}>
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={foundUser.photoURL} alt={foundUser.displayName} />
                            <AvatarFallback>{foundUser.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{foundUser.displayName}</p>
                            <p className="text-sm text-muted-foreground">{foundUser.email}</p>
                        </div>
                    </div>
                    <Button 
                        size="sm" 
                        onClick={() => handleInvite(foundUser)}
                        disabled={isCreatingChat === foundUser.uid}
                    >
                         {isCreatingChat === foundUser.uid ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                         ) : (
                            <Send className="mr-2 h-4 w-4" />
                         )}
                        Chat
                    </Button>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
