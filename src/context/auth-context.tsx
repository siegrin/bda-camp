
"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { MockUser } from '@/lib/types';
import { signOutUser } from '@/lib/actions';
import { createClient } from '@/lib/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: MockUser | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: (redirectUrl?: string | null) => Promise<void>;
  updateUserClient: (updatedUser: MockUser) => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithEmail: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
  updateUserClient: () => {},
  refreshSession: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { toast } = useToast();

  const getProfileFromSession = useCallback(async (session: Session | null) => {
    if (!session?.user) {
        setUser(null);
        return;
    }
    const sessionUser = session.user;

    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .single();
        
        const meta = sessionUser.user_metadata;
        
        if (error || !profile) {
            // This case can happen if the profile isn't created yet for a new sign-up (e.g. via OAuth).
            // It's not a critical error, just means we can't fully populate the user object yet.
            // We'll create a user object with a default role of 'user'.
            if (error && error.code !== 'PGRST116') { // PGRST116: "exact one row not found"
                 console.error("Error fetching profile, using default:", error?.message);
            }
           
            setUser({
                uid: sessionUser.id,
                username: meta?.username || '', 
                displayName: meta?.display_name || meta?.full_name || sessionUser.email || '',
                role: 'user', // Default role for new users or if profile is missing
                email: sessionUser.email || null, 
                photoURL: meta?.avatar_url || meta?.picture || null,
            });
            return;
        }

        setUser({
            uid: profile.id,
            username: profile.username || '', 
            displayName: profile.display_name || meta?.display_name || sessionUser.email || '',
            role: profile.role as 'admin' | 'user',
            email: sessionUser.email || null, 
            photoURL: profile.avatar_url || meta?.avatar_url || meta?.picture || null,
        });

    } catch (e: any) {
        console.error("Catastrophic error in getProfileFromSession:", e.message);
        setUser(null);
    }
  }, [supabase]);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    try {
        const { data: { session } } = await supabase.auth.getSession();
        await getProfileFromSession(session);
    } catch(e) {
        console.error("Failed to refresh session:", e);
        setUser(null);
    } finally {
        setLoading(false);
    }
  }, [supabase.auth, getProfileFromSession]);


  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        await getProfileFromSession(session);
        setLoading(false);
    });
    
    // Initial load
    refreshSession();

    return () => subscription.unsubscribe();
  }, [refreshSession, supabase.auth, getProfileFromSession]);
  
  const handleLogin = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
    });
    
    if (error) {
        if (error.message.includes("Invalid login credentials")) {
            throw new Error('Email atau kata sandi salah. Harap periksa kembali.');
        }
        throw new Error(`Login Gagal: ${error.message}`);
    }
    // Auth state change will trigger profile fetching and page redirection
  };
  
  const handleSignInWithGoogle = async (redirectUrl?: string | null) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback${redirectUrl ? `?next=${encodeURIComponent(redirectUrl)}` : ''}`,
      },
    });
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Login Gagal',
        description: `Gagal login dengan Google: ${error.message}`,
      });
    }
  };


  const signOut = async () => {
    await signOutUser();
    setUser(null);
    // Force a full page reload to the homepage to ensure all server/client states are cleared.
    // This is more robust for Vercel deployment.
    window.location.href = '/';
  };

  const updateUserClient = (updatedUser: MockUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    loginWithEmail: handleLogin,
    signOut,
    signInWithGoogle: handleSignInWithGoogle,
    updateUserClient,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
