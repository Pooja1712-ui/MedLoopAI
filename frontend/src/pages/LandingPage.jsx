import React from "react";
// Import all your sections
import HeroSection from "../components/landing/HeroSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import ImpactSection from "../components/landing/ImpactSection";
import CallToActionSection from "../components/landing/CallToActionSection";

// This page just assembles the sections
const LandingPage = () => {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ImpactSection />
      <CallToActionSection />
    </>
  );
};

export default LandingPage;
