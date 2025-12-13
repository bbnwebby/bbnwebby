"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider"; // ✅ Full access to user + profile

const Navbar: React.FC = () => {
  const { user, profile, logout, loading } = useAuth(); // ✅ include profile
  const [mounted, setMounted] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const handleScroll = (): void => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) return null;

  return (
    <nav
      className={`fixed top-0 w-full z-50 border-b transition-all duration-500 font-sans ${
      scrolled
        ? "bg-[rgba(255,192,203,0.85)] backdrop-blur-xl border-[rgba(255,107,157,0.2)] text-black"
        : "bg-transparent border-transparent text-pink-700"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div></div>

          {/* Logo */}
          <div className="text-2xl px-10 font-semibold tracking-wide">BBN</div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            <ul className="flex flex-row items-center gap-10">
              {[
                { href: "#home", label: "Home" },
                { href: "#services", label: "Services" },
                { href: "#artists", label: "Artists" },
                { href: "#about", label: "About" },
                { href: "#contact", label: "Contact" },
                { href: "#join", label: "Join as an Artist" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="relative block text-[15px] font-medium tracking-wide group transition-colors duration-300"
                  >
                    {item.label}
                    <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-pink-400 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
              ))}
              <li>
                <button className="ml-6 h-10 px-6 py-2 text-[15px] font-medium rounded-full bg-pink-400 hover:bg-pink-500 text-white transition-transform duration-300 hover:scale-105">
                  Book Now
                </button>
              </li>
            </ul>
          </div>

          {/* Profile + Hamburger */}
          <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
            {/* Profile Icon */}
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className={`w-9 h-9 rounded-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 transition-all duration-300 ${
                profileOpen ? "rotate-12 scale-110" : "hover:scale-110"
              }`}
              aria-label="Profile"
            >
              <User className="w-5 h-5 text-gray-800" />
            </button>

            {/* Profile Dropdown */}
            <div
              className={`absolute top-12 right-12 lg:right-0 mt-2 w-60 rounded-2xl shadow-lg border border-[rgba(255,255,255,0.25)] backdrop-blur-2xl bg-[rgba(255,255,255,0.45)] transition-all duration-500 ease-in-out transform ${
                profileOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-3 pointer-events-none"
              }`}
            >
              <ul className="p-4 space-y-2 text-sm text-gray-800">
                {/* ✅ Show logged-in user info */}
                {!loading && user ? (
                  <>
                    <li className="text-gray-700 font-semibold text-[14px] border-b border-gray-300/30 pb-2 mb-2 truncate">
                      {profile?.full_name || user.user_metadata?.full_name || user.email}
                    </li>
                    <li>
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-pink-100/60 transition-all duration-300"
                      >
                        <Settings className="w-4 h-4" /> Edit Profile
                      </Link>
                    </li>
                    <li>

                    </li>
                    <li>
                      <button
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg hover:bg-pink-100/60 text-red-500 transition-all duration-300"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    {/* ✅ Show Login / Signup only if user not logged in */}
                    <li>
                      <Link
                        href="/login"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-pink-100/60 transition-all duration-300"
                      >
                        <LogIn className="w-4 h-4" /> Login / Sign Up
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-md hover:bg-pink-100 text-gray-800 transition-all duration-300"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 transition-transform duration-300 rotate-180" />
              ) : (
                <Menu className="w-6 h-6 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isMenuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-8 pointer-events-none"
        }`}
      >
        {/* Glassmorphic BG */}
        <div
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            isMenuOpen
              ? "bg-[rgba(255,182,193,0.35)] backdrop-blur-2xl backdrop-saturate-150 opacity-100"
              : "bg-[rgba(255,182,193,0.1)] backdrop-blur-none opacity-0"
          } border-t border-[rgba(255,255,255,0.25)] shadow-2xl`}
        ></div>

        {/* Menu Links */}
        <div className="relative flex flex-col justify-center items-center h-full px-8 space-y-14 text-center">
          {[
            { href: "#home", label: "Home" },
            { href: "#services", label: "Services" },
            { href: "#artists", label: "Artists" },
            { href: "#about", label: "About" },
            { href: "#contact", label: "Contact" },
            { href: "#join", label: "Join as an Artist" },
          ].map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className={`relative text-[1.5rem] font-semibold tracking-wide text-gray-800 hover:text-pink-600 transition-all duration-700 ease-out group transform ${
                isMenuOpen
                  ? `opacity-100 translate-y-0 delay-[${index * 120}ms]`
                  : "opacity-0 translate-y-6"
              }`}
            >
              {item.label}
              <span className="absolute left-1/2 -bottom-1 w-0 h-[2px] bg-pink-400 transition-all duration-500 ease-out group-hover:w-3/4 group-hover:left-1/8"></span>
            </Link>
          ))}

          {/* Book Now */}
          <button className="mt-16 px-10 py-3 text-lg font-medium rounded-full bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-lg hover:shadow-pink-200/70 hover:scale-105 transition-all duration-500 ease-out">
            Book Now
          </button>

          {/* Close Button */}
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute bottom-10 flex items-center justify-center w-12 h-12 rounded-full bg-[rgba(255,255,255,0.3)] backdrop-blur-md hover:bg-[rgba(255,255,255,0.5)] transition-all duration-700 shadow-md"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-gray-800" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
