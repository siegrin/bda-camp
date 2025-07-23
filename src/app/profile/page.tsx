
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, UserCog, Package } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { UserRentalHistory } from "@/components/user-rental-history";
import { LoadingScreen } from "@/components/loading-screen";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Profil Saya",
  description: "Kelola informasi profil, lihat riwayat penyewaan, dan akses pengaturan akun Anda di BDA.Camp.",
};

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <LoadingScreen message="Memuat Profil..." />;
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 md:py-12">
       <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold md:text-4xl">Akun Saya</h1>
        <p className="text-muted-foreground">Kelola informasi profil dan riwayat sewa Anda.</p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
            <Card>
                <CardHeader className="items-center text-center p-6">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'Pengguna'} />
                        <AvatarFallback className="text-4xl">{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-2xl font-headline">{user.displayName}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    <Separator className="mb-4" />
                    <div className="space-y-4">
                        {user.role === 'admin' && (
                             <Button onClick={() => router.push('/dashboard')} className="w-full">
                                <Package className="mr-2" />
                                Buka Dashboard
                            </Button>
                        )}
                        <Button variant="outline" onClick={signOut} className="w-full">
                            <LogOut className="mr-2" />
                            Keluar
                        </Button>
                    </div>
                </CardContent>
            </Card>
             <Card className="mt-8">
                <CardHeader>
                   <div className="flex items-center gap-4">
                         <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <UserCog className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="font-headline text-2xl">Pengaturan Akun</CardTitle>
                            <CardDescription>Perbarui informasi pribadi dan keamanan Anda.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                 <CardContent>
                    <Button asChild>
                        <Link href="/profile/settings">Kelola Akun</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
            <UserRentalHistory />
        </div>
      </div>
    </div>
  );
}
