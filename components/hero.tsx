'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="flex-1 px-6 pt-20 pb-6 flex items-end">
      {/* Rounded card with video background */}
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{ height: 'calc(100vh - 96px)' }}
      >
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4"
        />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col items-start justify-start h-full p-8 md:p-12 pt-28 md:pt-36">
          {/* Headline */}
          <h1
            className="text-black text-5xl md:text-6xl font-medium leading-tight max-w-xl mb-4"
            style={{ letterSpacing: '-0.04em' }}
          >
            Stop Guessing.
            <br />
            Simulate First.
          </h1>

          {/* Subtitle */}
          <p
            className="text-black/70 text-base md:text-lg max-w-md mb-8 leading-relaxed"
            style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
          >
            Model your business decisions before they cost money. TwinOS creates
            a digital replica of your operations with real-time AI-powered insights.
          </p>

          {/* Pill button with arrow circle */}
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-3 bg-black text-white text-base md:text-lg font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
          >
            Start Simulating
            <span className="bg-white rounded-full p-2 group-hover:bg-gray-100 transition-colors">
              <ArrowRight className="w-5 h-5 text-black" />
            </span>
          </Link>

          {/* Brand Marquee */}
          <div className="mt-24 w-full max-w-md overflow-hidden">
            <div className="marquee-track">
              {[0, 1].map((dup) => (
                <div key={dup} className="flex">
                  <span className="mx-7 shrink-0 text-black/60 whitespace-nowrap" style={{ fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '-0.02em', fontSize: 15 }}>McKinsey</span>
                  <span className="mx-7 shrink-0 text-black/60 whitespace-nowrap" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: 13, textTransform: 'uppercase' }}>Deloitte</span>
                  <span className="mx-7 shrink-0 text-black/60 whitespace-nowrap" style={{ fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 600, letterSpacing: '0.01em', fontSize: 15, fontStyle: 'italic' }}>Accenture</span>
                  <span className="mx-7 shrink-0 text-black/60 whitespace-nowrap" style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, letterSpacing: '0.12em', fontSize: 13, textTransform: 'uppercase' }}>Bain</span>
                  <span className="mx-7 shrink-0 text-black/60 whitespace-nowrap" style={{ fontFamily: "Palatino, 'Book Antiqua', serif", fontWeight: 400, letterSpacing: '-0.01em', fontSize: 16 }}>Goldman Sachs</span>
                  <span className="mx-7 shrink-0 text-black/60 whitespace-nowrap" style={{ fontFamily: "Impact, 'Arial Narrow', sans-serif", fontWeight: 400, letterSpacing: '0.04em', fontSize: 14 }}>Bloomberg</span>
                  <span className="mx-7 shrink-0 text-black/60 whitespace-nowrap" style={{ fontFamily: 'Verdana, sans-serif', fontWeight: 700, letterSpacing: '-0.03em', fontSize: 13 }}>Gartner</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
