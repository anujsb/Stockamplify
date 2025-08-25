// components/Header.jsx
'use client'
import { useState } from "react";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  return (

    <header className="sticky top-0 z-50 bg-transparent backdrop-blur-xl backdrop-brightness-95 text-white shadow-lg">
      <nav className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        {/* Logo + Name */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-6">
            <Image
              src="/logo.png"
              alt="Logo"
              width={48}
              height={48}
              className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-1"
            />
            <span className="text-2xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              StockAmplify
            </span>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="#features" className="text-gray-100 hover:text-blue-600 font-medium">Features</Link>
          <Link href="#how-it-works" className="text-gray-100 hover:text-blue-600 font-medium">How it Works</Link>
          <Link href="/about" className="text-gray-100 hover:text-blue-600 font-medium">About Us</Link>
          <Link href="/sign-in" className="text-gray-100 hover:text-blue-600 font-medium">Sign In</Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white px-6 pb-4 space-y-3 shadow-md">
          <Link href="#features" className="block text-gray-700 hover:text-blue-600 font-medium">Features</Link>
          <Link href="#how-it-works" className="block text-gray-700 hover:text-blue-600 font-medium">How it Works</Link>
          <Link href="/about" className="block text-gray-700 hover:text-blue-600 font-medium">About Us</Link>
          <Link href="/sign-in" className="block text-gray-700 hover:text-blue-600 font-medium">Sign In</Link>
        </div>
      )}
    </header>
  );
}