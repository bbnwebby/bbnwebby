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
          {/* Logo */}
          <div className="text-2xl font-semibold tracking-wide">BBN</div>

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
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 rounded-md hover:bg-gray-800 transition"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className={`${
            scrolled
              ? "bg-[rgba(255,192,203,0.95)] text-gray-900"
              : "bg-[rgba(10,10,10,0.95)] text-white"
          } backdrop-blur-xl border-t border-[rgba(255,107,157,0.2)] px-4 py-4`}
        >
          <ul className="flex flex-col space-y-3">
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
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 px-3 rounded-md transition-all duration-200 hover:bg-pink-200 hover:text-gray-900"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <button className="w-full py-2 rounded-full bg-pink-400 hover:bg-pink-500 transition hover:scale-105 text-white">
                Book Now
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
