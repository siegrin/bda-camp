
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { AnimatePresence, motion } from 'framer-motion';

const PROMO_BANNER_DISMISSED_KEY = 'promo_banner_dismissed';

export function PromoBanner() {
  // Default to false, assuming the banner should be shown initially.
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // This effect runs on the client after hydration.
    // Check if the banner was already dismissed in this session.
    const dismissedInSession = sessionStorage.getItem(PROMO_BANNER_DISMISSED_KEY);
    if (dismissedInSession === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    // When the user clicks dismiss, set the flag in sessionStorage and update state.
    sessionStorage.setItem(PROMO_BANNER_DISMISSED_KEY, 'true');
    setIsDismissed(true);
  };
  
  // If the banner is dismissed, render nothing.
  if (isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="sticky top-16 z-30 w-full overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary/80 to-accent/80 text-primary-foreground">
            <div className="container mx-auto flex items-center justify-center px-4 py-2 text-center text-sm relative">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">
                  Situs ini adalah karya saya. Mari wujudkan website impian untuk bisnis Anda.
                  <Button asChild variant="link" className="p-0 h-auto ml-1 text-white font-bold underline">
                     <Link href="https://wa.me/62895602592430" target="_blank" rel="noopener noreferrer">
                        Hubungi Saya
                     </Link>
                  </Button>
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-white hover:bg-white/20 hover:text-white"
                onClick={handleDismiss}
                aria-label="Tutup banner"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
