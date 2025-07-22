
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Eye, EyeOff, Lock, Mail, Chrome, Loader2 } from "lucide-react";
import { LoadingScreen } from "@/components/loading-screen";
import type { SiteSettings } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, loginWithEmail, signInWithGoogle, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const redirectUrl = searchParams.get('redirect');

  useEffect(() => {
    // This is a client component, so we can't use the server-side getSettings.
    // We'll just hide the logo part or show a placeholder if settings are not loaded.
    // For this case, since the logo is removed, we don't need to fetch settings anymore.
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      const targetUrl = redirectUrl || (user.role === 'admin' ? "/dashboard" : "/equipment");
      router.replace(targetUrl);
    }
  }, [user, authLoading, router, redirectUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginWithEmail(email, password);
      toast({
        title: "Login Berhasil",
        description: "Selamat datang kembali! Mengarahkan...",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Gagal",
        description: error.message || "Email atau kata sandi salah.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
        await signInWithGoogle(redirectUrl);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Login Gagal",
            description: error.message || "Terjadi kesalahan saat login dengan Google.",
        });
        setIsLoading(false);
    }
  }


  if (authLoading || user) {
    return <LoadingScreen message="Mengarahkan..." />;
  }

  return (
    <div className="relative flex min-h-[calc(100vh-theme(spacing.16))] items-center justify-center p-4">
       <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-[#1a110a] via-[#26120A] to-[#402316] dark:from-black dark:to-[#26120A]" />
       <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <Card className="w-full max-w-sm z-10 bg-card/80 border-border/50">
         <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Login Akun</CardTitle>
          <CardDescription>
            Masukkan email dan kata sandi Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
             <Button variant="outline" onClick={handleGoogleSignIn} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Chrome className="mr-2 h-4 w-4" />}
               Masuk dengan Google
            </Button>
          </div>
          <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-muted-foreground/20"></div>
            <span className="mx-2 text-xs text-muted-foreground">ATAU</span>
            <div className="flex-grow border-t border-muted-foreground/20"></div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email Anda"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
                  disabled={isLoading}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Kata sandi Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\s/g, ''))}
                  disabled={isLoading}
                  className="pl-9 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full font-bold" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Memproses...</> : "Login"}
            </Button>
          </form>

           <div className="mt-4 text-center text-sm">
            Belum punya akun?{" "}
            <Link href="/register" className="underline font-semibold hover:text-primary">
              Daftar di sini
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
