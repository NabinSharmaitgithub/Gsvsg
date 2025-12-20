
"use client";

import { useEffect, useState } from "react";
import { useAuth, useFirestore, setDocumentNonBlocking } from "@/firebase";
import { type AuthProvider, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons/Logo";
import { useToast } from "@/hooks/use-toast";
import { Chrome, Github, Facebook } from 'lucide-react';


export function AuthScreen() {
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [year, setYear] = useState<number | null>(null);

    useEffect(() => {
        // This ensures the year is only calculated on the client, preventing hydration errors.
        setYear(new Date().getFullYear());
    }, []);


    const handleSignIn = async (provider: AuthProvider) => {
        if (!auth || !firestore) {
             toast({
                variant: "destructive",
                title: "Firebase not initialized",
                description: "The application is not connected to Firebase.",
            });
            return;
        }
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Create a user profile in Firestore if it's a new user
            const userRef = doc(firestore, "users", user.uid);
            
            // Use non-blocking setDoc with merge:true to create or update user profile
            setDocumentNonBlocking(userRef, {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                lastLogin: serverTimestamp()
            }, { merge: true });

            toast({
                title: "Signed In",
                description: `Welcome, ${user.displayName}!`,
            });
        } catch (error: any) {
            // Don't show error toast if user simply closes the popup
            if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
                return;
            }
             // Handle specific account exists with different credential error
            if (error.code === 'auth/account-exists-with-different-credential') {
                toast({
                    variant: "destructive",
                    title: "Authentication Failed",
                    description: "An account already exists with the same email address but different sign-in credentials.",
                });
                return;
            }
            console.error("Authentication error:", error);
            toast({
                variant: "destructive",
                title: "Authentication Failed",
                description: error.message || "An unexpected error occurred.",
            });
        }
    };

    return (
        <div className="w-full max-w-md text-center">
            <div className="bg-card/80 backdrop-blur-sm p-8 rounded-lg">
                <Logo className="w-16 h-16 mb-4 text-primary mx-auto" />
                <h1 className="font-headline text-3xl mb-2">Welcome to ShadowText</h1>
                <p className="text-muted-foreground mb-6">Secure and private messaging.</p>
                <div className="space-y-3">
                    <Button onClick={() => handleSignIn(new GoogleAuthProvider())} className="w-full" size="lg">
                        <Chrome className="mr-2 h-5 w-5" />
                        Sign in with Google
                    </Button>
                    <Button onClick={() => handleSignIn(new GithubAuthProvider())} className="w-full bg-[#333] hover:bg-[#444] text-white" size="lg">
                        <Github className="mr-2 h-5 w-5" />
                        Sign in with GitHub
                    </Button>
                    <Button onClick={() => handleSignIn(new FacebookAuthProvider())} className="w-full bg-[#1877F2] hover:bg-[#166e_e1] text-white" size="lg">
                        <Facebook className="mr-2 h-5 w-5" />
                        Sign in with Facebook
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-6">
                    By signing in, you agree to our terms of service (which don't exist yet).
                </p>
            </div>
             <footer className="text-center mt-8 text-xs text-muted-foreground">
                {year && <p>&copy; {year} ShadowText. Your privacy is paramount.</p>}
            </footer>
        </div>
    );
}
