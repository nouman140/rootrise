"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, selectIsAdmin, logout } from "../store/authSlice";
import { selectCartItemCount } from "../store/cartSlice";
import { useState } from "react";
import { ShoppingCart, Menu, X, LogOut } from "lucide-react";

export default function Navbar() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);
  const itemCount = useSelector(selectCartItemCount);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href={isAdmin ? "/admin/products" : "/"}
            className="flex-shrink-0"
          >
            <span className="text-2xl font-bold text-blue-600">
              Root<span className="text-black">&</span>Rise
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {!user ? (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {isAdmin ? (
                  <Link
                    href="/admin/products"
                    className="text-gray-700 hover:text-blue-600 transition"
                  >
                    Products
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/"
                      className="text-gray-700 hover:text-blue-600 transition"
                    >
                      Shop
                    </Link>
                    <Link
                      href="/cart"
                      className="relative text-gray-700 hover:text-blue-600 transition"
                    >
                      <ShoppingCart size={24} />
                      {itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {itemCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">
                    {user.email.slice(0, -10)}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-4">
            {!user ? (
              <>
                <Link
                  href="/auth/login"
                  className="block text-gray-700 hover:text-blue-600 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {isAdmin ? (
                  <Link
                    href="/admin/products"
                    className="block text-gray-700 hover:text-blue-600 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Products
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/"
                      className="block text-gray-700 hover:text-blue-600 transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Shop
                    </Link>
                    <Link
                      href="/cart"
                      className="block text-gray-700 hover:text-blue-600 transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Cart ({itemCount})
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-gray-700 hover:text-red-600 transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
