"use client";

import { useAuth, auth } from "@/lib/instant-client";
import { useEffect, useState } from "react";

export default function Home() {
  const { isLoading, user } = useAuth();
  const [isInitializing, setIsInitializing] = useState(false);
  const [googleAuthUrl, setGoogleAuthUrl] = useState("");

  // Initialize user on first login
  useEffect(() => {
    if (user && !isInitializing) {
      setIsInitializing(true);
      fetch("/api/auth/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      })
        .then(() => setIsInitializing(false))
        .catch((err) => {
          console.error("Failed to initialize user:", err);
          setIsInitializing(false);
        });
    }
  }, [user, isInitializing]);

  // Create Google OAuth URL (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = auth.createAuthorizationURL({
        clientName: "google-web",
        redirectURL: window.location.href,
      });
      setGoogleAuthUrl(url);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen flex flex-col items-center justify-center p-8">
      <main className="flex flex-col gap-8 items-center max-w-2xl">
        <h1 className="text-4xl font-bold text-center">
          Welcome to DrBadge
        </h1>

        <p className="text-lg text-center text-gray-600 dark:text-gray-400">
          Track your Domain Rating and watch your SEO grow
        </p>

        {user ? (
          <div className="flex flex-col gap-4 items-center">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-semibold mb-2">User Info:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Email: {user.email}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ID: {user.id}
              </p>
              <pre className="text-xs mt-2 overflow-auto max-w-md">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            <button
              onClick={() => auth.signOut()}
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm h-12 px-6"
            >
              Sign Out
            </button>
            <a
              href="/dashboard"
              className="rounded-full bg-foreground text-background transition-colors flex items-center justify-center hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm h-12 px-6"
            >
              Go to Dashboard
            </a>
          </div>
        ) : (
          <a
            href={googleAuthUrl}
            className="rounded-full bg-foreground text-background transition-colors flex items-center justify-center hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm h-12 px-6 gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </a>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Built with Next.js 15 + InstantDB
          </p>
        </div>
      </main>
    </div>
  );
}
