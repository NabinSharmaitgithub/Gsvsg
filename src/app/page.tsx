import { InviteCard } from "@/components/chat/InviteCard";
import { Logo } from "@/components/icons/Logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="items-center text-center">
            <Logo className="w-16 h-16 mb-4 text-primary" />
            <CardTitle className="font-headline text-3xl">
              Welcome to ShadowText
            </CardTitle>
            <p className="text-muted-foreground pt-2">
              The anonymous, ephemeral chat service.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <ul className="space-y-3 text-sm text-foreground/80 list-disc list-inside">
              <li>No accounts, no history, no traces.</li>
              <li>Messages are end-to-end encrypted.</li>
              <li>Messages are deleted forever after being read.</li>
              <li>Chat links are single-use for maximum privacy.</li>
            </ul>
            <InviteCard />
          </CardContent>
        </Card>
        <footer className="text-center mt-8 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ShadowText. Your privacy is paramount.</p>
        </footer>
      </div>
    </main>
  );
}
