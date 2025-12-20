"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { type User } from "firebase/auth";
import { doc, collection, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import type { Message, UserProfile } from "@/lib/types";
import { Header } from "./Header";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

type ChatLayoutProps = {
  chatId: string;
  currentUser: User;
  otherUserId: string | undefined;
};

type ExtendedMessage = Message & { isDisappearing?: boolean };

export default function ChatLayout({ chatId, currentUser, otherUserId }: ChatLayoutProps) {
  const firestore = useFirestore();
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Memoize Firestore references
  const otherUserRef = useMemoFirebase(() => otherUserId ? doc(firestore, 'users', otherUserId) : null, [firestore, otherUserId]);
  const messagesColRef = useMemoFirebase(() => collection(firestore, 'chats', chatId, 'messages'), [firestore, chatId]);
  const messagesQuery = useMemoFirebase(() => query(messagesColRef, orderBy("timestamp", "asc")),[messagesColRef]);
  const chatRef = useMemoFirebase(() => doc(firestore, 'chats', chatId), [firestore, chatId]);

  const { data: otherUserData } = useDoc<UserProfile>(otherUserRef);
  const { data: serverMessages, isLoading: messagesLoading } = useCollection<Message>(messagesQuery);
  const { data: chatData } = useDoc(chatRef);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    if (serverMessages) {
        // Map server messages and set a timeout to mark them for disappearing
        const extendedMessages = serverMessages.map(msg => ({ ...msg, isDisappearing: false }));
        setMessages(extendedMessages);
        
        // When new messages arrive, make them disappear after a delay
        // This simulates the ephemeral nature of the chat
        const newMessages = serverMessages.filter(
            (sm) => !messages.some((m) => m.id === sm.id)
        );

        if(newMessages.length > 0) {
            scrollToBottom();
            const timer = setTimeout(() => {
                setMessages(prevMessages => 
                    prevMessages.map(msg => 
                        newMessages.some(nm => nm.id === msg.id) ? { ...msg, isDisappearing: true } : msg
                    )
                );
            }, 3000); // Start disappearing after 3 seconds

            const removalTimer = setTimeout(() => {
                setMessages(prevMessages => 
                    prevMessages.filter(msg => !newMessages.some(nm => nm.id === msg.id))
                );
            }, 3300); // Remove from DOM after animation

            return () => {
                clearTimeout(timer);
                clearTimeout(removalTimer);
            }
        }
    }
  }, [serverMessages]);


  useEffect(() => {
    // When the chat is opened or messages are loaded, mark them as read
    if (currentUser && chatData) {
        const userStatus = chatData.userStatus?.[currentUser.uid];
        if (userStatus && userStatus.unreadCount > 0) {
            updateDocumentNonBlocking(chatRef, {
                [`userStatus.${currentUser.uid}.unreadCount`]: 0
            });
        }
    }
  }, [chatData, currentUser, chatRef]);

  const typingUsers = useMemo(() => {
    if (!chatData?.typing || !otherUserData || !otherUserId) return [];
    return chatData.typing.includes(otherUserId) ? [otherUserData.displayName] : []
  }, [chatData, otherUserData, otherUserId]);


  return (
    <div className="flex flex-col h-screen bg-background">
      <Header otherUser={otherUserData} />
      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map(msg => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwnMessage={msg.senderId === currentUser.uid}
            />
          ))}
          {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}
        </div>
        <div ref={messagesEndRef} />
      </main>
      <MessageInput chatId={chatId} userId={currentUser.uid} onMessageSent={scrollToBottom} otherUserId={otherUserId} />
    </div>
  );
}
