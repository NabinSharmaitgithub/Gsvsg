
"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import type { User } from "firebase/auth";
import { collection, orderBy, query, updateDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useDoc, useMemoFirebase } from "@/firebase/firestore/use-doc";
import { doc } from 'firebase/firestore';
import type { Message, UserProfile } from "@/lib/types";
import { Header } from "./Header";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

type ChatLayoutProps = {
  chatId: string;
  currentUser: User;
  otherUserId: string | undefined;
};

type ExtendedMessage = Message & { isDisappearing?: boolean };

export default function ChatLayout({ chatId, currentUser, otherUserId }: ChatLayoutProps) {
  const firestore = useFirestore();
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const lastSeenMessageId = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Memoize Firestore references
  const otherUserRef = useMemoFirebase(() => otherUserId ? doc(firestore, 'users', otherUserId) : null, [firestore, otherUserId]);
  const messagesColRef = useMemoFirebase(() => collection(firestore, 'chats', chatId, 'messages'), [firestore, chatId]);
  const messagesQuery = useMemoFirebase(() => query(messagesColRef, orderBy("timestamp", "asc")),[messagesColRef]);
  const chatRef = useMemoFirebase(() => doc(firestore, 'chats', chatId), [firestore, chatId]);

  const { data: otherUserData } = useDoc<UserProfile>(otherUserRef);
  const { data: serverMessages } = useCollection<Message>(messagesQuery);
  const { data: chatData } = useDoc(chatRef);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    if (serverMessages) {
        // Find new messages that have arrived since the last update
        const lastSeenIndex = lastSeenMessageId.current ? serverMessages.findIndex(m => m.id === lastSeenMessageId.current) : -1;
        const newMessages = serverMessages.slice(lastSeenIndex + 1);

        if (newMessages.length > 0) {
            // Update the last seen message ID to the latest one
            lastSeenMessageId.current = newMessages[newMessages.length - 1].id;

            // Add new messages to the current state
            setMessages(prevMessages => [...prevMessages, ...newMessages.map(m => ({ ...m, isDisappearing: false }))]);
            
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
                    prevMessages.filter(msg => !newMessages.some(nm => nm.id === msg.id && msg.isDisappearing))
                );
            }, 3300); // Remove from DOM after animation

            return () => {
                clearTimeout(timer);
                clearTimeout(removalTimer);
            };
        } else if (messages.length === 0 && serverMessages.length > 0) {
            // Initial load case
            setMessages(serverMessages.map(m => ({ ...m, isDisappearing: false })));
            if (serverMessages.length > 0) {
                lastSeenMessageId.current = serverMessages[serverMessages.length - 1].id;
            }
        }
    }
  }, [serverMessages, messages.length]);


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
