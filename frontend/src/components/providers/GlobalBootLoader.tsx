'use client';
import api from "@/services/api";
import { useEffect, useState } from "react";
import ColdStartLoader from "../ui/coldstart";

export const GlobalBootLoader = () => {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const checkServerStatus = async () => {
      try {
        const response = await api.get("/health");
        
        // Ensure both the HTTP status is 200 AND the DB is fully connected
        // Note: response.data.data matches your ApiResponse nested structure
        if (response.status === 200 && response.data?.data?.database === "Connected") {
          if (isMounted) setIsBooting(false);
          return; // Exit the polling loop
        } else {
          // If status is 200 but DB is somehow not connected, retry
          if (isMounted) timeoutId = setTimeout(checkServerStatus, 2000);
        }
      } catch (err: any) {
        // If the server is asleep (network error) OR returns 503/500,
        // Axios/fetch will likely throw an error here. We catch it and retry.
        console.warn("Server booting or DB connecting, retrying...", err?.message || err);
        if (isMounted) timeoutId = setTimeout(checkServerStatus, 2000);
      }
    };

    checkServerStatus();

    // Cleanup function to prevent memory leaks if component unmounts
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Once booted, render nothing so the rest of the app shows
  if (!isBooting) return null;

  // Render the loader overlay while booting
  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center">
      <ColdStartLoader />
    </div>
  );
};