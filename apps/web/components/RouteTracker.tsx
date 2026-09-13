"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function RouteTracker() {
  const pathname = usePathname();
  const prevRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    try {
      if (pathname !== "/scan") {
        sessionStorage.setItem("honeychain_last_page", pathname);
        if (pathname.startsWith("/dashboard")) {
          sessionStorage.setItem("honeychain_last_dashboard", pathname);
        }
      } else if (prevRef.current && prevRef.current !== "/scan") {
        sessionStorage.setItem("honeychain_last_page", prevRef.current);
      }
    } catch {
      // Ignore storage errors (private browsing / disabled cookies)
    }

    prevRef.current = pathname;
  }, [pathname]);

  return null;
}
