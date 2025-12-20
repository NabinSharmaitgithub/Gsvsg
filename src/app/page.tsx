"use client";

import { useUser } from "@/firebase";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { UserDashboard } from "@/components/chat/UserDashboard";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      {user ? <UserDashboard /> : <AuthScreen />}
    </main>
  );
}
