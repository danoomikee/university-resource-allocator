"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, getCurrentUniversity, logout } from "@/lib/auth";
import type { UserAccount, University } from "@/lib/types";

export function useAuth(requireAuth = true) {
  const router = useRouter();
  const [user, setUser] = useState<UserAccount | null>(null);
  const [university, setUniversity] = useState<University | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    const currentUniversity = getCurrentUniversity();

    if (!currentUser && requireAuth) {
      router.push("/login");
      return;
    }

    if (
      currentUser?.role !== "SuperAdmin" &&
      currentUser &&
      (currentUser as any)?.mustChangePassword
    ) {
      router.push("/change-password");
      return;
    }

    setUser(currentUser);
    setUniversity(currentUniversity);
    setIsLoading(false);
  }, [requireAuth, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return {
    user,
    university,
    isLoading,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === "SuperAdmin",
    isEntityAdmin: user?.role === "EntityAdmin",
    logout: handleLogout,
  };
}
