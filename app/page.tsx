import Navbar from '@/components/navbar';
import Hero from '@/components/hero';
import Features from '@/components/features';
import HowItWorks from '@/components/how-it-works';
import Testimonials from '@/components/testimonials';
import CTA from '@/components/cta';
import Footer from '@/components/footer';

export default function Home() {
  return (
    <main className="flex flex-col bg-[#F5F5F5] min-h-screen">
      {/* First Section: Navbar + Hero wrapped in h-screen overflow-hidden */}
      <div className="h-screen flex flex-col overflow-hidden w-full relative">
        <Navbar />
        <Hero />
      </div>
      
      {/* Features */}
      <Features />

      {/* How It Works */}
      <HowItWorks />

      {/* Testimonials */}
      <Testimonials />

      {/* CTA */}
      <CTA />

      {/* Footer */}
      <Footer />
    </main>
  );
}
