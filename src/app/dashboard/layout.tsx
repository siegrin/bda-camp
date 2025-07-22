
'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Package,
  Shapes,
  PanelLeft,
  LogOut,
  Layers3,
  User as UserIcon,
  FileClock,
  Settings,
  LineChart,
  Users,
  ListOrdered,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSettings } from "@/lib/actions";
import { getPendingRentalsCount } from '@/lib/products';
import type { SiteSettings } from "@/lib/types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LoadingScreen } from "@/components/loading-screen";
import { Badge } from "@/components/ui/badge";
import { createClient } from '@/lib/supabase/client';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [pendingRentalsCount, setPendingRentalsCount] = useState(0);
  const supabase = createClient();


  useEffect(() => {
    getSettings().then(setSettings);
  }, []);
  
  const loadPendingCount = async () => {
    const count = await getPendingRentalsCount();
    setPendingRentalsCount(count);
  }

  useEffect(() => {
    loadPendingCount();

    const channel = supabase.channel('rentals-count-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'rentals' }, loadPendingCount)
        .subscribe();
        
    return () => {
        supabase.removeChannel(channel);
    }
  }, [supabase]);


  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push("/login");
    }
  }, [user, loading, router]);
  
  if (loading || !user || user.role !== 'admin' || !settings) {
    return <LoadingScreen message="Memuat Dashboard..." />;
  }

  const navItems = [
    { href: "/dashboard", icon: LineChart, label: "Overview", exact: true },
    { href: "/dashboard/rentals", icon: ListOrdered, label: "Penyewaan", notificationCount: pendingRentalsCount },
    { href: "/dashboard/products", icon: Package, label: "Produk" },
    { href: "/dashboard/categories", icon: Shapes, label: "Kategori" },
    { href: "/dashboard/subcategories", icon: Layers3, label: "Subkategori" },
    { href: "/dashboard/users", icon: Users, label: "Pengguna" },
    { href: "/dashboard/settings", icon: Settings, label: "Pengaturan" },
    { href: "/dashboard/logs", icon: FileClock, label: "Log Aktivitas" },
  ];
  
  const getActiveLinkClass = (itemHref: string, exact: boolean = false) => {
    const isActive = exact ? pathname === itemHref : pathname.startsWith(itemHref);
    return isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground";
  }
  
  const getActiveMobileLinkClass = (itemHref: string, exact: boolean = false) => {
     const isActive = exact ? pathname === itemHref : pathname.startsWith(itemHref);
    return isActive ? "text-primary bg-muted" : "text-muted-foreground hover:text-foreground";
  }


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <TooltipProvider>
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
              href="/"
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
              <Logo className="h-5 w-5 transition-all group-hover:scale-110" logoUrl={settings.logo_url} />
              <span className="sr-only">BDA.Camp</span>
            </Link>
            {navItems.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 relative", 
                      getActiveLinkClass(item.href, item.exact)
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                     {item.notificationCount && item.notificationCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 justify-center rounded-full p-0">
                            {item.notificationCount}
                        </Badge>
                     )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ))}
          </nav>
          <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Home className="h-5 w-5" />
                  <span className="sr-only">Halaman Utama</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Halaman Utama</TooltipContent>
            </Tooltip>
          </nav>
        </aside>
      </TooltipProvider>

      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Buka menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <SheetHeader>
                <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
                <SheetDescription className="sr-only">Pilih halaman untuk dinavigasi di dalam dasbor.</SheetDescription>
              </SheetHeader>
              <nav className="grid gap-6 text-lg font-medium mt-4">
                <Link
                  href="/"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                   onClick={() => setSheetOpen(false)}
                >
                  <Logo className="h-6 w-6 transition-all group-hover:scale-110" logoUrl={settings.logo_url} />
                  <span className="sr-only">BDA.Camp</span>
                </Link>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn("-ml-2 flex items-center justify-between gap-4 rounded-md px-4 py-2", getActiveMobileLinkClass(item.href, item.exact))}
                    onClick={() => setSheetOpen(false)}
                  >
                    <div className="flex items-center gap-4">
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </div>
                     {item.notificationCount && item.notificationCount > 0 && (
                        <Badge variant="destructive" className="h-6 w-6 justify-center rounded-full p-0">
                            {item.notificationCount}
                        </Badge>
                     )}
                  </Link>
                ))}
                 <Link
                    href="/"
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                    onClick={() => setSheetOpen(false)}
                  >
                    <Home className="h-5 w-5" />
                    Halaman Utama
                  </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="overflow-hidden rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.photoURL || undefined}
                      alt={user.displayName || "Admin"}
                    />
                    <AvatarFallback>{user.displayName?.charAt(0) || "A"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/")}>Halaman Utama</DropdownMenuItem>
                 <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="flex-grow p-4 sm:px-6 sm:py-0 md:gap-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
