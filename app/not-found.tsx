"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { LogoIcon } from '@/components/logo';

export default function NotFound() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="not-found-page-wrapper">
      <style jsx global>{`
        html, body, #__next, .not-found-page-wrapper {
          height: 100vh !important;
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
          font-family: 'DM Sans', sans-serif !important;
        }
        
        :root {
          --text-main: #1a1a1a;
          --text-secondary: #888888;
          --bg-page: #F5F5F5;
          --card-bg: #ffffff;
        }
      `}</style>

      <style jsx>{`
        .page-container {
          height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
          background-image: 
            url('https://pub-e68758f43067417dba612b2371819aa1.r2.dev/viktor-components/alien-spaceship.png'),
            linear-gradient(to top left, #F5F5F5, #F7F7F7);
          background-position: center 40%;
          background-repeat: no-repeat;
          background-size: contain;
          background-attachment: fixed;
          color: var(--text-main);
          padding-top: 80px; /* Offset for fixed navbar */
        }

        .decor-icon {
          position: absolute;
          user-select: none;
          filter: drop-shadow(0 2px 0 #ffffff) drop-shadow(0 -2px 0 #ffffff) drop-shadow(2px 0 0 #ffffff) drop-shadow(-2px 0 0 #ffffff);
          animation: floatSlow 5s ease-in-out infinite;
        }

        .cloud-decor {
          width: 42px;
          height: 42px;
          top: -22px;
          left: -28px;
          animation-duration: 5s;
          animation-delay: 0.3s;
        }

        .heart-decor {
          width: 32px;
          height: 32px;
          bottom: -15px;
          right: 20px;
          animation-duration: 4.5s;
          animation-delay: 1s;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          width: 100%;
          max-width: 700px;
          margin: 0 auto;
          padding: 20px 20px 40px;
          z-index: 10;
        }

        .lost-text {
          font-size: 15px;
          color: var(--text-secondary);
          font-weight: 400;
          margin-bottom: 12px;
        }

        .title-wrapper {
          position: relative;
          display: inline-block;
          margin-bottom: 14px;
        }

        .title {
          font-size: clamp(34px, 5vw, 52px);
          font-weight: 500;
          letter-spacing: -1.5px;
          line-height: 1.08;
          color: #0f0f0f;
          margin: 0;
        }

        .subtext {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.7;
          max-width: 470px;
          margin: 0 auto 28px;
        }

        .highlight-tag {
          display: inline-flex;
          align-items: center;
          background-color: #E0E2E7;
          font-size: 12.5px;
          font-weight: 600;
          padding: 2px 12px;
          border-radius: 6px;
          margin: 0 4px;
          color: #1a1a1a;
        }

        .cards-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          max-width: 460px;
          margin-top: auto;
        }

        .nav-card {
          background-color: var(--card-bg);
          border-radius: 18px;
          padding: 18px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .nav-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.08);
        }

        .card-left {
          display: flex;
          align-items: center;
          gap: 16px;
          text-align: left;
        }

        .icon-container {
          width: 48px;
          height: 48px;
          background-color: #eaecf0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        .nav-card:hover .icon-container {
          transform: scale(1.05);
        }

        .card-text {
          display: flex;
          flex-direction: column;
        }

        .card-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-main);
        }

        .card-subtitle {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .chevron-arrow {
          font-size: 21px;
          color: var(--text-secondary);
          transition: transform 0.2s ease;
        }

        .nav-card:hover .chevron-arrow {
          transform: translateX(6px);
        }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }

        @media (max-width: 768px) {
          .page-container {
            background-size: 90%;
            background-position: center 45%;
            padding-top: 70px;
          }

          .title {
            font-size: 30px;
          }

          .cloud-decor {
            width: 32px;
            height: 32px;
            top: -16px;
            left: -18px;
          }

          .heart-decor {
            width: 24px;
            height: 24px;
            bottom: -10px;
            right: 15px;
          }

          .cards-container {
            max-width: 100%;
            gap: 10px;
          }

          .nav-card {
            padding: 14px 18px;
          }

          .icon-container {
            width: 40px;
            height: 40px;
          }
        }

        @media (max-width: 480px) {
          .page-container {
            background-size: 100%;
          }

          .title {
            font-size: 26px;
          }

          .cloud-decor {
            width: 26px;
            height: 26px;
            top: -12px;
            left: -14px;
          }

          .heart-decor {
            width: 20px;
            height: 20px;
            bottom: -8px;
            right: 12px;
          }
        }
      `}</style>

      {/* Shared Header/Navbar integration */}
      <nav className="fixed top-0 w-full z-50 bg-[#F5F5F5]/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-[88rem] mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 text-decoration-none">
              <LogoIcon className="w-7 h-7 text-black" />
              <span className="text-2xl font-medium tracking-tight text-black">TwinOS</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/#features" className="text-base text-gray-600 hover:text-black font-medium transition-colors duration-200">
                Features
              </Link>
              <Link href="/#how-it-works" className="text-base text-gray-600 hover:text-black font-medium transition-colors duration-200">
                How It Works
              </Link>
              <Link href="/#testimonials" className="text-base text-gray-600 hover:text-black font-medium transition-colors duration-200">
                Testimonials
              </Link>
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Link
                href="/dashboard"
                className="inline-block bg-black text-white text-base font-medium px-7 py-2.5 rounded-full hover:bg-gray-800 transition-colors duration-200 text-decoration-none"
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
                  className="px-4 py-2.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-colors text-decoration-none"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/#how-it-works"
                  className="px-4 py-2.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-colors text-decoration-none"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link
                  href="/#testimonials"
                  className="px-4 py-2.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-colors text-decoration-none"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Testimonials
                </Link>
                <Link
                  href="/dashboard"
                  className="mt-2 text-center bg-black text-white px-4 py-2.5 rounded-full font-medium text-decoration-none"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start Simulating
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="page-container">
        {/* Main Content Area */}
        <main className="main-content">
          <p className="lost-text">Seems you've wandered off...</p>
          
          <div className="title-wrapper">
            {/* SVG Cloud Decoration */}
            <svg viewBox="0 0 24 24" className="decor-icon cloud-decor">
              <defs>
                <linearGradient id="cloud-grad" x1="0%" y1="0%" x2="0%" y2="100%">
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

            <h1 className="title">Whoops! Nothing here yet</h1>

            {/* SVG Heart/Favorite Decoration */}
            <svg viewBox="0 0 24 24" className="decor-icon heart-decor">
              <defs>
                <linearGradient id="heart-grad" x1="0%" y1="0%" x2="0%" y2="100%">
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

          <p className="subtext">
            Grab a 30-minute <span className="highlight-tag">chat</span> to explore your ideas, scope, and vision. We'll find common ground, sync and <span className="highlight-tag">define</span> a clear roadmap.
          </p>

          {/* Navigation Cards */}
          <div className="cards-container">
            <Link href="/" className="nav-card">
              <div className="card-left">
                <div className="icon-container">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#6366f1" strokeWidth="2">
                    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" fill="#eaecf0" />
                    <path d="M9 21V12h6v9" stroke="white" strokeWidth="2" fill="none" />
                  </svg>
                </div>
                <div className="card-text">
                  <span className="card-title">Home</span>
                  <span className="card-subtitle">Back where it all begins...</span>
                </div>
              </div>
              <span className="chevron-arrow">&rsaquo;</span>
            </Link>

            <Link href="/dashboard" className="nav-card">
              <div className="card-left">
                <div className="icon-container">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                    <circle cx="12" cy="12" r="9" fill="#6366f1" />
                    <circle cx="12" cy="12" r="3.5" fill="white" />
                  </svg>
                </div>
                <div className="card-text">
                  <span className="card-title">Dashboard</span>
                  <span className="card-subtitle">Simulate your business twins...</span>
                </div>
              </div>
              <span className="chevron-arrow">&rsaquo;</span>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
