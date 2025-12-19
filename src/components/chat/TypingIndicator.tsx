export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1.5 p-3 rounded-2xl bg-muted w-fit">
      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-pulse"></div>
    </div>
  );
}
