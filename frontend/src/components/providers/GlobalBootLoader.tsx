'use client';

import api from "@/services/api";
import { useEffect, useState } from "react";
import ColdStartLoader from "../ui/coldstart";
import { usePathname } from "next/navigation"; // 1. Import usePathname

export const GlobalBootLoader = () => {
  const [isBooting, setIsBooting] = useState(true);
  const pathname = usePathname(); // 2. Hook to get the current URL

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const checkServerStatus = async () => {
      try {
        const response = await api.get("/health");
        
        if (response.status === 200 && response.data?.data?.database === "Connected") {
          if (isMounted) setIsBooting(false);
          return; 
        } else {
          if (isMounted) timeoutId = setTimeout(checkServerStatus, 2000);
        }
      } catch (err: any) {
        console.warn("Server booting or DB connecting, retrying...", err?.message || err);
        if (isMounted) timeoutId = setTimeout(checkServerStatus, 2000);
      }
    };

    checkServerStatus();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // 3. Define the routes that should bypass the loading screen
  const unblockedRoutes = ['/features', '/upcoming'];

  // 4. Hide the loader if the server is awake OR if the user is on an unblocked route
  if (!isBooting || unblockedRoutes.includes(pathname)) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center">
      <ColdStartLoader />
    </div>
  );
};