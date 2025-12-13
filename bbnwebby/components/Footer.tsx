"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { Mail, Phone } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-gray-900 text-gray-300 px-6 py-14">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <Image
            src="/images/logo.jpeg"
            alt="Beyond Beauty Network Logo"
            width={160}
            height={50}
            className="object-contain"
          />
          <p className="text-sm text-gray-700">
            Connecting clients with verified makeup artists across India.
          </p>
          <p className="text-xs text-gray-800">
            © {new Date().getFullYear()} Beyond Beauty Network
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link href="/artists" className="hover:text-white">
                Artists
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-white">
                Services
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-white mb-4">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Mail size={16} />             
              <a
              href="mailto:infomultaigroup@gmail.com"
              className="block hover:text-pink-600"
              >
              infomultaigroup@gmail.com
            </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="text-pink-500" />
              <a href="tel:+917995514547" className="block hover:text-pink-600">
                +91 79955 14547
              </a>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="font-semibold text-white mb-4">Follow Us</h4>
          <div className="flex flex-col gap-3 text-sm">
            <a
              href="https://instagram.com/beyond_beauty_network"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white"
            >
              <FaInstagram className="text-pink-500" /> Instagram
            </a>
            <a
              href="https://wa.me/918897955253"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white"
            >
              <FaWhatsapp className="text-green-500" /> WhatsApp
            </a>
          </div>
          
        </div>
      </div>
              {/* Google Map */}
        <div className="flex flex-col col-span-5 h-48 rounded-lg w-full overflow-hidden border border-white/20">
            <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.921083441193!2d78.54100287516552!3d17.415574483476405!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb998e2623063f%3A0xe3f1464785e4ea45!2sSBMS!5e0!3m2!1sen!2sin!4v1756804469286!5m2!1sen!2sin"
            width="100%"
            height="100%"
            allowFullScreen
            loading="lazy"
            className="rounded-lg"
            ></iframe>
        </div>
    </footer>
  );
};

export default Footer;
