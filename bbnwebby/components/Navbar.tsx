"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Menu, X, User, LogOut, Settings, LogIn } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Navigation item definition
 */
interface NavItem {
  href: string;
  label: string;
}

/**
 * Centralized navigation config
 * - Home → index page
 * - Services → services page
 * - Others → index page + hash
 */
const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/#artists", label: "Artists" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
  { href: "/#join", label: "Join as an Artist" },
];

const Navbar: React.FC = () => {
  const { user, profile, logout, loading } = useAuth();

  const [mounted, setMounted] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);


  /**
   * Navbar background on scroll
   */
  useEffect((): (() => void) => {
    const handleScroll = (): void => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return (): void => window.removeEventListener("scroll", handleScroll);
  }, []);

  /**
   * Close profile dropdown when clicking outside
   */
  useEffect((): (() => void) => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return (): void =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  

  return (
    <nav
      className={`fixed top-0 w-full z-50 border-b transition-all duration-500 ${
        scrolled
          ? "bg-[rgba(255,192,203,0.85)] backdrop-blur-xl border-pink-300/30 text-black"
          : "bg-transparent border-transparent text-pink-700"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center h-16 px-6">
            <Link href="/" className="relative h-10 w-36">
              <Image
                src="/images/logo.jpeg"
                alt="Beyond Beauty Network Logo"
                fill
                priority
                className="object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            <ul className="flex items-center gap-10">
              {NAV_ITEMS.map((item: NavItem) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="relative text-[15px] font-medium group"
                  >
                    {item.label}
                    <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-pink-400 transition-all group-hover:w-full" />
                  </Link>
                </li>
              ))}

              {/* Book Now → services page */}
              <li>
                <Link
                  href="/services"
                  className="ml-6 h-10 px-6 py-2 flex items-center rounded-full bg-pink-400 hover:bg-pink-500 text-white transition-transform hover:scale-105"
                >
                  Book Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Profile + Hamburger */}
          <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
            {/* Profile Button */}
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
            >
              <User className="w-5 h-5 text-gray-800" />
            </button>

            {/* Profile Dropdown */}
            <div
              className={`absolute top-12 right-0 w-60 rounded-2xl shadow-lg bg-white/70 backdrop-blur-xl border transition-all ${
                profileOpen
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-3 pointer-events-none"
              }`}
            >
              <ul className="p-4 space-y-2 text-sm">
                {!loading && user ? (
                  <>
                    <li className="font-semibold truncate border-b pb-2">
                      {profile?.full_name ??
                        user.user_metadata?.full_name ??
                        user.email}
                    </li>
                    <li>
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-pink-100"
                      >
                        <Settings className="w-4 h-4" /> Edit Profile
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg hover:bg-pink-100 text-red-500"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link
                      href="/login"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-pink-100"
                    >
                      <LogIn className="w-4 h-4" /> Login / Sign Up
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="lg:hidden w-10 h-10 flex items-center justify-center"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-pink-200/40 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-10">
          {NAV_ITEMS.map((item: NavItem) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="text-2xl font-semibold"
            >
              {item.label}
            </Link>
          ))}

          {/* Mobile Book Now */}
          <Link
            href="/services"
            onClick={() => setIsMenuOpen(false)}
            className="mt-6 px-10 py-3 rounded-full bg-pink-500 text-white"
          >
            Book Now
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
