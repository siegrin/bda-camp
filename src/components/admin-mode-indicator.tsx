
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";

export function AdminModeIndicator() {
  const { user } = useAuth();
  const pathname = usePathname();

  const isAdmin = user?.role === 'admin';
  const isDashboardPage = pathname.startsWith('/dashboard');

  if (!isAdmin || isDashboardPage) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed bottom-4 left-4 z-50"
      >
        <div className="flex items-center gap-3 rounded-full border bg-background/80 p-2 pr-4 text-sm font-medium shadow-lg backdrop-blur-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">Mode Admin</span>
            <span className="text-xs text-muted-foreground leading-tight">Anda memiliki akses penuh</span>
          </div>
          <Button asChild size="sm" variant="ghost" className="ml-2 h-8">
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
