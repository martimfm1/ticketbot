import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { FeatureGrid } from "@/components/feature-grid";
import { HowItWorks } from "@/components/how-it-works";
import { SecuritySection } from "@/components/security-section";
import { OpenSourceSection } from "@/components/open-source-section";
import { Testimonials } from "@/components/testimonials";
import { FAQ } from "@/components/faq";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Separator className="bg-white/05" />
        <FeatureGrid />
        <Separator className="bg-white/05" />
        <HowItWorks />
        <Separator className="bg-white/05" />
        <SecuritySection />
        <Separator className="bg-white/05" />
        <OpenSourceSection />
        <Separator className="bg-white/05" />
        <Testimonials />
        <Separator className="bg-white/05" />
        <FAQ />
        <Separator className="bg-white/05" />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
