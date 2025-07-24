
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

const AD_LAST_LOADED_TIMESTAMP_KEY = 'ad_last_loaded_timestamp';
const AD_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

export function AdLoader() {
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const isDashboard = pathname.startsWith('/dashboard');
    const isAdmin = user?.role === 'admin';

    // Don't load ads for admins or on dashboard pages
    if (isAdmin || isDashboard) {
      return;
    }

    try {
      const now = new Date().getTime();
      const lastLoadedStr = localStorage.getItem(AD_LAST_LOADED_TIMESTAMP_KEY);
      const lastLoaded = lastLoadedStr ? parseInt(lastLoadedStr, 10) : 0;

      // Check if the cooldown period has passed
      if (now - lastLoaded < AD_COOLDOWN_MS) {
        return; // Still in cooldown, do nothing
      }

      const script = document.createElement('script');
      // A unique key is added to the src to bypass potential browser caching if needed,
      // though the external service likely handles this.
      script.innerHTML = `(function(d,z,s){s.src='https://'+d+'/400/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('vemtoutcheeg.com',9612662,document.createElement('script'))`;
      document.body.appendChild(script);

      // Update the timestamp in localStorage after loading the script
      localStorage.setItem(AD_LAST_LOADED_TIMESTAMP_KEY, now.toString());
      
      // Cleanup function to remove the script if the component unmounts
      return () => {
          if (document.body.contains(script)) {
              document.body.removeChild(script);
          }
      };

    } catch (error) {
        console.error("Failed to load ad script:", error);
    }
    
  }, [pathname, user]); // Rerun effect if path or user changes

  return null; // This component does not render anything
}
