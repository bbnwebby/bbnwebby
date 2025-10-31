"use client";
import React from "react";
import Link from "next/link";

const Navbar: React.FC = () => {
  return (
    <nav className="navbar" id="navbar">
      <div className="logo">BBN</div>
      <div className="nav-links">
        <Link href="#home">Home</Link>
        <Link href="#services">Services</Link>
        <Link href="#artists">Artists</Link>
        <Link href="#about">About</Link>
        <Link href="#contact">Contact</Link>
        <Link href="#join">Join as an Artist</Link>
        <button className="book-btn">Book Now</button>
      </div>
    </nav>
  );
};

export default Navbar;
