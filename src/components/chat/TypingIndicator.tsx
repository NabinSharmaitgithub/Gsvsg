type TypingIndicatorProps = {
    users: string[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const typingText = `${users.join(', ')} is typing...`

  return (
    <div className="flex items-center space-x-2 p-2">
      <div className="flex items-center space-x-1.5 rounded-2xl bg-muted w-fit px-3 py-2">
        <div className="w-2 h-2 bg-foreground/50 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-foreground/50 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-foreground/50 rounded-full animate-pulse"></div>
      </div>
      <span className="text-xs text-muted-foreground">{typingText}</span>
    </div>
  );
}
