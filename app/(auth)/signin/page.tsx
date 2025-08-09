"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: searchParams.get("callbackUrl") || "/",
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else if (res?.ok) {
      router.push(res.url || "/");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#18181b] dark:bg-[#18181b]">
      <div className="flex flex-col items-center w-full">
        <img src="/VibeCheckTO Logo Design Skyline Alpha 256x256.png" alt="VibeCheckTO Logo" className="w-20 h-20 mb-6 rounded" />
        <Card className="w-full max-w-md p-8 space-y-6 bg-zinc-900 border-zinc-800">
          <h1 className="text-2xl font-bold text-center text-white">Sign In</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-zinc-800 text-white border-zinc-700"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="bg-zinc-800 text-white border-zinc-700"
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="flex items-center justify-center">
            <span className="text-gray-400 text-sm">or</span>
          </div>
          <Button
            variant="outline"
            className="w-full border-zinc-700 text-white hover:bg-zinc-800"
            onClick={() => signIn("google", { callbackUrl: searchParams.get("callbackUrl") || "/" })}
          >
            Sign in with Google
          </Button>
          <div className="text-center text-sm mt-4">
            <span className="text-gray-400">Don&apos;t have an account? </span>
            <Link href="/register" className="text-blue-400 hover:underline">
              Register
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
