
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

const AD_SCRIPT_LOADED_KEY = 'ad_script_loaded_session';

export function AdLoader() {
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const isDashboard = pathname.startsWith('/dashboard');
    const isAdmin = user?.role === 'admin';
    
    // Check if the ad has already been loaded in this session to prevent re-insertion
    const adScriptLoaded = sessionStorage.getItem(AD_SCRIPT_LOADED_KEY);

    // Don't load the script if user is on dashboard, is an admin, or script has already run
    if (adScriptLoaded || isAdmin || isDashboard) {
      return;
    }
    
    try {
        const script = document.createElement('script');
        script.innerHTML = `(function(d,z,s){s.src='https://'+d+'/400/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('vemtoutcheeg.com',9612662,document.createElement('script'))`;
        document.body.appendChild(script);

        // Mark that the script has been loaded for this session
        sessionStorage.setItem(AD_SCRIPT_LOADED_KEY, 'true');

        // Cleanup function to remove the script if the component unmounts
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    } catch (error) {
        console.error("Failed to load ad script:", error);
    }
    
  }, [pathname, user]);

  return null; // This component does not render anything
}
