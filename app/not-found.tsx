"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LogoIcon } from "@/components/logo";

export default function NotFound() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col relative bg-[#F5F5F5]">
      {/* Fixed Navbar replica */}
      <nav className="fixed top-0 w-full z-50 bg-[#F5F5F5]/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-[88rem] mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 no-underline">
              <LogoIcon className="w-7 h-7 text-black" />
              <span className="text-2xl font-medium tracking-tight text-black">
                TwinOS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/#features"
                className="text-base text-gray-600 hover:text-black font-medium transition-colors duration-200 no-underline"
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                className="text-base text-gray-600 hover:text-black font-medium transition-colors duration-200 no-underline"
              >
                How It Works
              </Link>
              <Link
                href="/#testimonials"
                className="text-base text-gray-600 hover:text-black font-medium transition-colors duration-200 no-underline"
              >
                Testimonials
              </Link>
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Link
                href="/dashboard"
                className="inline-block bg-black text-white text-base font-medium px-7 py-2.5 rounded-full hover:bg-gray-800 transition-colors duration-200 no-underline"
              >
                Start Simulating
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-200/50 rounded-full transition-colors text-black flex items-center justify-center border-none bg-transparent cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation Panel */}
          {mobileMenuOpen && (
            <div className="md:hidden pt-4 pb-2">
              <div className="flex flex-col gap-2">
                <Link
                  href="/#features"
                  className="px-4 py-2.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-colors no-underline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/#how-it-works"
                  className="px-4 py-2.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-colors no-underline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link
                  href="/#testimonials"
                  className="px-4 py-2.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-colors no-underline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Testimonials
                </Link>
                <Link
                  href="/dashboard"
                  className="mt-2 text-center bg-black text-white px-4 py-2.5 rounded-full font-medium no-underline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start Simulating
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Container */}
      <div
        className="h-screen w-screen overflow-hidden flex flex-col relative text-[#1a1a1a] pt-[96px]"
        style={{
          backgroundImage:
            "url('https://pub-e68758f43067417dba612b2371819aa1.r2.dev/viktor-components/alien-spaceship.png'), linear-gradient(to top left, #F5F5F5, #F7F7F7)",
          backgroundPosition: "center 40%",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col items-center justify-center text-center w-full max-w-[700px] mx-auto px-5 pb-10 z-10">
          <p className="text-[15px] text-[#888888] font-normal mb-3">
            Seems you've wandered off...
          </p>

          <div className="relative inline-block mb-3.5">
            {/* SVG Cloud Decoration */}
            <svg
              viewBox="0 0 24 24"
              className="absolute w-[42px] h-[42px] -top-[22px] -left-[28px] select-none drop-shadow-[0_2px_0_#fff] drop-shadow-[0_-2px_0_#fff] drop-shadow-[2px_0_0_#fff] drop-shadow-[-2px_0_0_#fff] animate-[floatSlow_5s_ease-in-out_infinite_0.3s]"
            >
              <defs>
                <linearGradient
                  id="cloud-grad"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="50%" stopColor="#F7B2FB" />
                  <stop offset="80%" stopColor="#786EF1" />
                  <stop offset="100%" stopColor="#5588FB" />
                </linearGradient>
              </defs>
              <path
                d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96z"
                fill="url(#cloud-grad)"
                stroke="white"
                strokeWidth="1.5"
              />
            </svg>

            <h1 className="text-gray-900 font-medium tracking-tighter leading-[1.08] text-[34px] sm:text-[44px] md:text-[52px] m-0">
              Whoops! Nothing here yet
            </h1>

            {/* SVG Heart/Favorite Decoration */}
            <svg
              viewBox="0 0 24 24"
              className="absolute w-[32px] h-[32px] -bottom-[15px] right-[20px] select-none drop-shadow-[0_2px_0_#fff] drop-shadow-[0_-2px_0_#fff] drop-shadow-[2px_0_0_#fff] drop-shadow-[-2px_0_0_#fff] animate-[floatSlow_4.5s_ease-in-out_infinite_1s]"
            >
              <defs>
                <linearGradient
                  id="heart-grad"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="50%" stopColor="#F7B2FB" />
                  <stop offset="80%" stopColor="#786EF1" />
                  <stop offset="100%" stopColor="#5588FB" />
                </linearGradient>
              </defs>
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="url(#heart-grad)"
                stroke="white"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <p className="text-[14px] text-[#888888] leading-relaxed max-w-[470px] mx-auto mb-7">
            Grab a 30-minute{" "}
            <span className="inline-flex items-center bg-[#E0E2E7] text-[12.5px] font-semibold px-3 py-0.5 rounded-[6px] mx-1 text-[#1a1a1a]">
              chat
            </span>{" "}
            to explore your ideas, scope, and vision. We'll find common ground,
            sync and{" "}
            <span className="inline-flex items-center bg-[#E0E2E7] text-[12.5px] font-semibold px-3 py-0.5 rounded-[6px] mx-1 text-[#1a1a1a]">
              define
            </span>{" "}
            a clear roadmap.
          </p>

          {/* Navigation Cards */}
          <div className="flex flex-col gap-3 w-full max-w-[460px] mt-auto">
            <Link
              href="/"
              className="group flex items-center justify-between bg-white rounded-[18px] p-[18px_22px] border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:-translate-y-[3px] hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] transition-all duration-200 no-underline"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-full bg-[#eaecf0] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                  >
                    <path
                      d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
                      fill="#eaecf0"
                    />
                    <path
                      d="M9 21V12h6v9"
                      stroke="white"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-semibold text-[#1a1a1a]">
                    Home
                  </span>
                  <span className="text-[12px] text-[#888888]">
                    Back where it all begins...
                  </span>
                </div>
              </div>
              <span className="text-[24px] text-[#888888] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1.5 ml-8 select-none">
                &rsaquo;
              </span>
            </Link>

            <Link
              href="/dashboard"
              className="group flex items-center justify-between bg-white rounded-[18px] p-[18px_22px] border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:-translate-y-[3px] hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] transition-all duration-200 no-underline"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-full bg-[#eaecf0] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                    <circle cx="12" cy="12" r="9" fill="#6366f1" />
                    <circle cx="12" cy="12" r="3.5" fill="white" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-semibold text-[#1a1a1a]">
                    Dashboard
                  </span>
                  <span className="text-[12px] text-[#888888]">
                    Simulate your business twins...
                  </span>
                </div>
              </div>
              <span className="text-[24px] text-[#888888] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1.5 ml-8 select-none">
                &rsaquo;
              </span>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
