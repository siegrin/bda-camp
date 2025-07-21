
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ShoppingCart, User, LogOut, Search, X, Package, HelpCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { SiteSettings } from "@/lib/types";

export function Header({ settings }: { settings: SiteSettings }) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const { cart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || "");

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      router.push(`/equipment?q=${encodeURIComponent(trimmedQuery)}`);
    } else {
      router.push('/equipment');
    }
    setSheetOpen(false);
  };
  
  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/equipment", label: "Katalog" },
    { href: "/about", label: "Cara Pesan" },
    { href: "/contact", label: "Hubungi Kami" },
  ];

  const closeSheet = () => setSheetOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Buka Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
               <SheetHeader>
                <SheetTitle className="sr-only">Menu Utama</SheetTitle>
                <SheetDescription className="sr-only">Navigasi utama situs dan pencarian.</SheetDescription>
              </SheetHeader>
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                  onClick={closeSheet}
                >
                  <Logo className="h-8 w-8 text-primary" logoUrl={settings.logo_url} />
                  <span className="font-headline">BDA.Camp</span>
                </Link>

                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search"
                    placeholder="Cari peralatan..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Cari peralatan"
                  />
                </form>

                {navLinks.map((link) => (
                    <Link
                    key={link.href}
                    href={link.href}
                    className="hover:text-primary"
                    onClick={closeSheet}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
           <Link href="/" className="flex items-center space-x-2">
              <Logo className="h-8 w-8 text-primary" logoUrl={settings.logo_url} />
              <span className="font-bold font-headline text-lg whitespace-nowrap sm:hidden">BDA</span>
               <span className="hidden font-bold font-headline text-lg whitespace-nowrap sm:inline-block">BDA.Camp</span>
            </Link>
        </div>

        <div className="mr-6 hidden md:flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="h-8 w-8 text-primary" logoUrl={settings.logo_url} />
              <span className="hidden font-bold sm:inline-block font-headline">
                BDA.Camp
              </span>
            </Link>
        </div>
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex flex-1 items-center justify-end space-x-2">
          <div className="flex items-center gap-1 md:gap-2">
              <form onSubmit={handleSearch} className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search"
                  placeholder="Cari peralatan..."
                  className="pl-9 w-40 lg:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Cari peralatan"
                />
              </form>
              
              {user?.role !== 'admin' && (
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/cart" className="relative" aria-label={`Keranjang, ${cart.length} item`}>
                        <ShoppingCart className="h-5 w-5" />
                        {cart.length > 0 && (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                                {cart.length}
                            </Badge>
                        )}
                        <span className="sr-only">Keranjang</span>
                    </Link>
                </Button>
              )}
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            {loading ? (
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'Pengguna'} />
                                <AvatarFallback>{user.displayName?.charAt(0) || 'A'}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{user.displayName || 'Akun Saya'}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                           <Link href="/profile"><User className="mr-2 h-4 w-4" />Profil</Link>
                        </DropdownMenuItem>
                        {user.role === 'admin' && (
                            <DropdownMenuItem asChild>
                               <Link href="/dashboard"><Package className="mr-2 h-4 w-4" />Dashboard</Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={signOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Keluar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/login" aria-label="Login">
                        <User className="h-5 w-5" />
                        <span className="sr-only">Login</span>
                    </Link>
                </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
