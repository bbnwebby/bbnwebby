"use client";
import React, { useState, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import Link from "next/link";

/**
 * Clean, responsive Navbar with subtle animations.
 * - Keeps the original minimalist font and text color aesthetic.
 * - Transparent at start, gains soft pink background on scroll.
 * - Smooth hover underline animation for nav links.
 * - Profile icon and Book button with gentle scale animations.
 */
const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  // Handle scroll for dynamic background
  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = (): void => setIsMenuOpen((prev) => !prev);

  return (
    <nav
      className={`fixed top-0 w-full z-50 border-b transition-all duration-500 font-sans ${
        scrolled
          ? "bg-[rgba(255,192,203,0.85)] backdrop-blur-xl border-[rgba(255,107,157,0.2)] text-gray-900"
          : "bg-transparent border-transparent text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
            <div className=""></div>
          {/* Logo */}
          <div className="text-2xl px-10 font-semibold tracking-wide">BBN</div>

          {/* Desktop Nav */}
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
                    {/* Animated underline */}
                    <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-pink-400 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
              ))}

              {/* Book Now Button */}
              <li>
                <button className="ml-6 h-10 w-30 px-6 py-2 text-[15px] font-medium rounded-full bg-pink-400 hover:bg-pink-500 text-white transition-transform duration-300 hover:scale-105">
                  Book Now
                </button>
              </li>
            </ul>
          </div>

          {/* Right side - Profile + Menu */}
          <div className="flex items-center space-x-4">
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 hover:scale-110 transition-transform duration-300 ease-out"
              aria-label="Profile"
            >
              <User className="w-5 h-5 text-gray-800" />
            </button>

            {/* Hamburger menu (mobile) */}
             {/* Hamburger (Mobile only) */}
            <button
              onClick={toggleMenu}
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

{/* Mobile Dropdown - Full Screen Glassmorphic Menu */}
<div
  className={`lg:hidden fixed inset-0 z-40 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
    isMenuOpen
      ? "opacity-100 translate-y-0 pointer-events-auto"
      : "opacity-0 -translate-y-8 pointer-events-none"
  }`}
>
  {/* Smooth glass background with fade + blur ease-in */}
  <div
    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
      isMenuOpen
        ? "bg-[rgba(255,182,193,0.35)] backdrop-blur-2xl backdrop-saturate-150 opacity-100"
        : "bg-[rgba(255,182,193,0.1)] backdrop-blur-none opacity-0"
    } border-t border-[rgba(255,255,255,0.25)] shadow-2xl`}
  ></div>

  {/* Menu Content */}
  <div className="relative flex flex-col justify-center items-center h-full px-8 space-y-20 gap-10 text-center">
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
        {/* Soft hover underline */}
        <span className="absolute left-1/2 -bottom-1 w-0 h-[2px] bg-pink-400 transition-all duration-500 ease-out group-hover:w-3/4 group-hover:left-1/8"></span>
      </Link>
    ))}

    {/* Book Now Button */}
    <button className="mt-16 px-10 py-3 text-lg h-10 w-30 font-medium rounded-full bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-lg hover:shadow-pink-200/70 hover:scale-105 transition-all duration-500 ease-out">
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
