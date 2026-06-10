"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && role === "company") {
      router.replace("/empresa");
    } else if (isAuthenticated && role === "lead_manager") {
      router.replace("/lead");
    } else {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, role, router]);

  return null;
}
