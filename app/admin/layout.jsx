"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, selectIsAdmin, selectAuthIsLoading, logout } from "/store/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Package, ShoppingBag } from "lucide-react";

export default function AdminLayout({ children }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);
  const isLoading = useSelector(selectAuthIsLoading);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push("/auth/login");
    }
  }, [user, isLoading, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleLogout = async () => {
    await dispatch(logout());
    router.push("/auth/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">RootRise Admin</h1>

        <nav className="space-y-4">
          <Link
            href="/admin/products"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            <Package size={20} />
            <span>Products</span>
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            <ShoppingBag size={20} />
            <span>Orders</span>
          </Link>
          {/* <Link
            href="/admin/chat"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            <span className="text-lg font-bold">💬</span>
            <span>Chat</span>
          </Link> */}
        </nav>

        <div className="mt-auto pt-8 border-t border-gray-700">
          <div className="mb-4">
            <p className="text-sm text-gray-400">Admin</p>
            <p className="font-semibold">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
