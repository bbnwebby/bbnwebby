"use client";

import React from "react";
import { Phone, Mail, Clock } from "lucide-react";
import { FaWhatsapp  } from "react-icons/fa";

const Contact: React.FC = () => {
  return (
    <section
      id="contact"
      className="relative max-w-7xl mx-auto px-6 py-20"
    >
      {/* Heading */}
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
          Contact Us
        </h2>
        <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
          Have questions or want to collaborate? Reach out to Beyond Beauty
          Network through any of the options below.
        </p>
      </div>

      {/* Contact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Phone */}
        <div className="rounded-2xl bg-white/40 backdrop-blur-xl border border-white/30 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Phone className="text-pink-500" />
            <h4 className="font-semibold text-gray-900">Call Us</h4>
          </div>
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <a href="tel:+917995514547" className="block hover:text-pink-600">
              +91 79955 14547
            </a>
            
          </div>
        </div>

        {/* WhatsApp */}
        <div className="rounded-2xl bg-white/40 backdrop-blur-xl border border-white/30 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <FaWhatsapp className="text-green-500" size={20} />
            <h4 className="font-semibold text-gray-900">WhatsApp</h4>
          </div>
          <div className="mt-4">
            <a
              href="https://wa.me/917995514547"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 rounded-lg bg-green-500 text-white text-sm hover:bg-green-600 transition"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Email */}
        <div className="rounded-2xl bg-white/40 backdrop-blur-xl border border-white/30 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Mail className="text-pink-500" />
            <h4 className="font-semibold text-gray-900">Email</h4>
          </div>
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <a
              href="mailto:infomultaigroup@gmail.com"
              className="block hover:text-pink-600"
            >
              infomultaigroup@gmail.com
            </a>
          </div>
        </div>

        {/* Hours */}
        <div className="rounded-2xl bg-white/40 backdrop-blur-xl border border-white/30 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="text-pink-500" />
            <h4 className="font-semibold text-gray-900">Working Hours</h4>
          </div>
          <div className="mt-4 text-sm text-gray-700 space-y-1">
            <div>Mon – Sat: 11:00 AM – 7:00 PM</div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="mt-14 rounded-2xl overflow-hidden border border-white/30 shadow-sm">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.921083441193!2d78.54100287516552!3d17.415574483476405!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb998e2623063f%3A0xe3f1464785e4ea45!2sSBMS!5e0!3m2!1sen!2sin!4v1756804469286!5m2!1sen!2sin"
          width="100%"
          height="350"
          loading="lazy"
          className="w-full"
        />
      </div>
    </section>
  );
};

export default Contact;
