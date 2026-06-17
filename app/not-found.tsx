"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function NotFound() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

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
        }

        .navbar {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 28px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .navbar::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 40px;
          right: 40px;
          height: 1px;
          background-image: linear-gradient(to right, rgba(0,0,0,0.08) 2px, transparent 2px);
          background-size: 6px 1px;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 9px;
          text-decoration: none;
        }

        .logo-img {
          height: 28px;
          filter: brightness(0);
        }

        .logo-text {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.3px;
          color: #111111;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 36px;
        }

        .nav-link {
          font-size: 14px;
          font-weight: 400;
          color: var(--text-main);
          opacity: 0.65;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }

        .nav-link:hover {
          opacity: 1;
        }

        .cta-button {
          display: flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(180deg, #2c2c2c 0%, #111111 100%);
          color: #ffffff;
          font-size: 13px;
          font-weight: 500;
          border-radius: 40px;
          padding: 5px 16px 5px 5px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
          text-decoration: none;
        }

        .cta-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.22);
          filter: brightness(1.1);
        }

        .arrow-circle {
          width: 24px;
          height: 24px;
          background-color: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .arrow-circle-large {
          width: 32px;
          height: 32px;
          background-color: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hamburger {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          width: 24px;
          height: 16px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          z-index: 100;
        }

        .hamburger span {
          width: 24px;
          height: 2px;
          background-color: var(--text-main);
          transition: all 0.3s ease;
          transform-origin: left center;
        }

        .hamburger.active span:nth-child(1) {
          transform: rotate(45deg) translate(2px, 0px);
        }

        .hamburger.active span:nth-child(2) {
          width: 0%;
          opacity: 0;
        }

        .hamburger.active span:nth-child(3) {
          transform: rotate(-45deg) translate(2px, 0px);
        }

        .mobile-nav-overlay {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background-color: #ffffff;
          z-index: 90;
          display: flex;
          flex-direction: column;
          padding: 80px 40px;
          transform: translateX(100%);
          transition: transform 0.5s cubic-bezier(0.77, 0, 0.175, 1);
        }

        .mobile-nav-overlay.open {
          transform: translateX(0);
        }

        .mobile-links {
          display: flex;
          flex-direction: column;
          margin-top: 40px;
        }

        .mobile-link {
          font-size: 38px;
          font-weight: 800;
          letter-spacing: -1.5px;
          color: var(--text-main);
          text-decoration: none;
          padding: 24px 0;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }

        .mobile-cta-wrapper {
          margin-top: auto;
          display: flex;
        }

        .mobile-cta {
          display: flex;
          align-items: center;
          gap: 16px;
          background: linear-gradient(180deg, #2c2c2c 0%, #111111 100%);
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          border-radius: 50px;
          padding: 8px 24px 8px 8px;
          text-decoration: none;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
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
          }

          .navbar {
            padding: 20px;
          }

          .navbar::after {
            left: 20px;
            right: 20px;
          }

          .nav-links {
            display: none;
          }

          .hamburger {
            display: flex;
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

      <div className="page-container">
        {/* Navbar */}
        <header className="navbar">
          <Link href="/" className="logo-container">
            <img 
              src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/Tests/logoipsum-415.svg" 
              alt="TwinOS Logo" 
              className="logo-img"
            />
            <span className="logo-text">TwinOS</span>
          </Link>

          <nav className="nav-links">
            <Link href="/dashboard" className="nav-link">Workspace</Link>
            <Link href="/scenario-builder" className="nav-link">Scenario Builder</Link>
            <Link href="/dashboard/optimize" className="nav-link">AI Projections</Link>
            <Link href="/admin" className="nav-link">Admin Portal</Link>
          </nav>

          <button 
            className={`hamburger ${mobileMenuOpen ? 'active' : ''}`} 
            onClick={toggleMobileMenu}
            aria-label="Toggle Navigation Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        <div className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-links">
            <Link href="/dashboard" className="mobile-link" onClick={toggleMobileMenu}>Workspace</Link>
            <Link href="/scenario-builder" className="mobile-link" onClick={toggleMobileMenu}>Scenario Builder</Link>
            <Link href="/dashboard/optimize" className="mobile-link" onClick={toggleMobileMenu}>AI Projections</Link>
            <Link href="/admin" className="mobile-link" onClick={toggleMobileMenu}>Admin Portal</Link>
          </div>
        </div>

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
            <Link href="/dashboard" className="nav-card">
              <div className="card-left">
                <div className="icon-container">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#6366f1" strokeWidth="2">
                    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" fill="#eaecf0" />
                    <path d="M9 21V12h6v9" stroke="white" strokeWidth="2" fill="none" />
                  </svg>
                </div>
                <div className="card-text">
                  <span className="card-title">Workspace Dashboard</span>
                  <span className="card-subtitle">Back where it all begins...</span>
                </div>
              </div>
              <span className="chevron-arrow">&rsaquo;</span>
            </Link>

            <Link href="/dashboard/optimize" className="nav-card">
              <div className="card-left">
                <div className="icon-container">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                    <circle cx="12" cy="12" r="9" fill="#6366f1" />
                    <circle cx="12" cy="12" r="3.5" fill="white" />
                  </svg>
                </div>
                <div className="card-text">
                  <span className="card-title">Scenario Optimizer</span>
                  <span className="card-subtitle">Where we optimize your twin</span>
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
