
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { Eye, EyeOff, User as UserIcon, Lock, Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { getSettings, registerUser } from "@/lib/actions";
import type { SiteSettings } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useDebounce } from "use-debounce";
import { LoadingScreen } from "@/components/loading-screen";

// --- Validation Helpers ---

const validateUsername = (username: string): string => {
    if (username.length < 3) return "Username minimal 3 karakter.";
    if (username.length > 20) return "Username maksimal 20 karakter.";
    if (/\s/.test(username)) return "Username tidak boleh mengandung spasi.";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Username hanya boleh berisi huruf, angka, dan garis bawah (_).";
    return "";
};

const validatePassword = (password: string): string => {
    if (password.length < 6) return "Kata sandi minimal 6 karakter.";
    if (/\s/.test(password)) return "Kata sandi tidak boleh mengandung spasi.";
    return "";
};

const validateEmail = (email: string): string => {
    if (/\s/.test(email)) return "Email tidak boleh mengandung spasi.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Format email tidak valid.";
    return "";
}

// --- Availability Check Component ---

function AvailabilityStatus({ status, message }: { status: 'checking' | 'available' | 'unavailable' | 'idle', message: string }) {
    if (status === 'idle') return null;
    const baseClasses = "flex items-center gap-1.5 text-xs mt-1.5";
    if (status === 'checking') {
        return <div className={baseClasses + " text-muted-foreground"}><Loader2 className="h-3 w-3 animate-spin"/> Memeriksa...</div>
    }
    if (status === 'available') {
        return <div className={baseClasses + " text-green-600"}><CheckCircle className="h-3 w-3"/> Tersedia</div>
    }
    if (status === 'unavailable') {
        return <div className={baseClasses + " text-destructive"}><XCircle className="h-3 w-3"/> {message}</div>
    }
    return null;
}

// --- Main Register Component ---

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  
  // Form fields
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Validation state
  const [formErrors, setFormErrors] = useState({
      email: "",
      username: "",
      password: "",
      confirmPassword: ""
  });
  
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  
  const [debouncedUsername] = useDebounce(username, 500);

  // --- Real-time Validation and Availability Checks ---

  const checkUsernameAvailability = useCallback(async (name: string) => {
      const setStatus = setUsernameStatus;
      
      setStatus('checking');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', name.toLowerCase())
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means "exact one row not found", which is good.
          console.error(`Error checking username:`, error);
          setStatus('idle'); // Fallback on error
          return;
      }
      
      setStatus(data ? 'unavailable' : 'available');

  }, [supabase]);

  useEffect(() => {
    if (debouncedUsername) {
        const validationError = validateUsername(debouncedUsername);
        setFormErrors(prev => ({...prev, username: validationError}));
        if (!validationError) {
            checkUsernameAvailability(debouncedUsername);
        } else {
             setUsernameStatus('idle');
        }
    } else {
        setFormErrors(prev => ({...prev, username: ""}));
        setUsernameStatus('idle');
    }
  }, [debouncedUsername, checkUsernameAvailability]);
  
  useEffect(() => {
    if (email) {
      setFormErrors(prev => ({...prev, email: validateEmail(email)}));
    }
  }, [email]);

  useEffect(() => {
      if (password) {
        setFormErrors(prev => ({...prev, password: validatePassword(password)}));
      }
      if (confirmPassword || password) {
          if (password !== confirmPassword) {
              setFormErrors(prev => ({...prev, confirmPassword: "Kata sandi tidak cocok."}));
          } else {
              setFormErrors(prev => ({...prev, confirmPassword: ""}));
          }
      }
  }, [password, confirmPassword]);

  // --- Initial Setup ---

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  useEffect(() => {
    if (user) {
      router.push("/profile");
    }
  }, [user, router]);
  
  // --- Form Submission ---

  const isFormInvalid = useMemo(() => {
    return Object.values(formErrors).some(err => !!err) ||
           usernameStatus !== 'available' ||
           !email || !password || !displayName;
  }, [formErrors, usernameStatus, email, password, displayName]);


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormInvalid) {
        toast({ variant: "destructive", title: "Form Tidak Valid", description: "Harap periksa kembali semua isian Anda." });
        return;
    }
    
    setIsLoading(true);

    const result = await registerUser(email, password, displayName, username);
    
    if (result.success) {
      toast({
        title: "Pendaftaran Berhasil",
        description: result.message,
      });
      router.push("/login");
    } else {
      toast({
        variant: "destructive",
        title: "Pendaftaran Gagal",
        description: result.message,
      });
    }
    
    setIsLoading(false);
  };

  if (authLoading || user || !settings) {
    return <LoadingScreen message="Mengarahkan..." />;
  }

  return (
    <div className="relative flex min-h-[calc(100vh-theme(spacing.16))] items-center justify-center p-4">
       <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-[#1a110a] via-[#26120A] to-[#402316] dark:from-black dark:to-[#26120A]" />
       <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <Card className="w-full max-w-sm z-10 bg-card/80 border-border/50">
         <CardHeader className="text-center">
            <Link href="/" className="flex justify-center items-center space-x-2 mb-4">
                <Logo className="h-10 w-10 text-primary" logoUrl={settings.logo_url} />
                <span className="font-bold font-headline text-xl">BDA.Camp</span>
            </Link>
            <CardTitle className="font-headline text-2xl">Buat Akun Baru</CardTitle>
            <CardDescription>
                Isi formulir di bawah untuk memulai petualangan Anda.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nama Lengkap</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="displayName" type="text" placeholder="Nama Anda" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={isLoading} className="pl-9" />
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="anda@email.com" required value={email} onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))} disabled={isLoading} className="pl-9" />
              </div>
              {formErrors.email && <p className="text-xs text-destructive mt-1.5">{formErrors.email}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="username" type="text" placeholder="Username unik tanpa spasi" required value={username} onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))} disabled={isLoading} className="pl-9" />
              </div>
              <AvailabilityStatus status={usernameStatus} message="Username ini sudah digunakan" />
              {formErrors.username && <p className="text-xs text-destructive mt-1.5">{formErrors.username}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} required placeholder="Minimal 6 karakter, tanpa spasi" value={password} onChange={(e) => setPassword(e.target.value.replace(/\s/g, ''))} disabled={isLoading} className="pl-9 pr-10" />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
               {formErrors.password && <p className="text-xs text-destructive mt-1.5">{formErrors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} required placeholder="Ulangi kata sandi" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value.replace(/\s/g, ''))} disabled={isLoading} className="pl-9 pr-10" />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
               {formErrors.confirmPassword && <p className="text-xs text-destructive mt-1.5">{formErrors.confirmPassword}</p>}
            </div>
            <Button type="submit" className="w-full font-bold !mt-6" disabled={isLoading || isFormInvalid}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Mendaftarkan...</> : "Daftar"}
            </Button>
          </form>

           <div className="mt-4 text-center text-sm">
            Sudah punya akun?{" "}
            <Link href="/login" className="underline font-semibold hover:text-primary">
              Login di sini
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
