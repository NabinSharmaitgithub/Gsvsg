
"use client";

import { useUser } from "@/firebase";
import { UserDashboard } from "@/components/chat/UserDashboard";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login page.
    if (!isUserLoading && !user) {
      router.replace("/");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    // Show a loader while we are verifying the user or redirecting.
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </main>
    );
  }

  // If the user is logged in, show the dashboard.
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <UserDashboard />
    </main>
  );
}
