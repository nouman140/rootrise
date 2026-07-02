"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { selectUser, selectAuthIsLoading } from "/store/authSlice";
import { useRouter } from "next/navigation";

export default function AuthLayout({ children }) {
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectAuthIsLoading);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        {children}
      </div>
    </div>
  );
}
