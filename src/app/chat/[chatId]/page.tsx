import ChatLayout from '@/components/chat/ChatLayout';

export default function ChatPage({ params }: { params: { chatId: string } }) {
  // This is a server component that renders the main client component for the chat
  return <ChatLayout chatId={params.chatId} />;
}
