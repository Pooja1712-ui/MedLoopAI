import React from "react";
import { motion } from "framer-motion";
import {
  ScanSearch,
  Link2,
  MapPin,
  Recycle,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { fadeIn, staggerContainer } from "../../utils/animations";

const FeaturesSection = () => {
  const features = [
    {
      icon: ScanSearch,
      name: "AI-Powered Validation",
      description:
        "Our cutting-edge AI uses image recognition to rigorously check for expiry dates, signs of tampering, and product authenticity, ensuring every item is safe.",
    },
    {
      icon: Link2,
      name: "Dynamic Smart Matching",
      description:
        "An intelligent algorithm optimizes donation allocation, matching available items to recipients based on real-time needs, location, and critical criteria.",
    },
    {
      icon: MapPin,
      name: "Transparent Tracking System",
      description:
        "Experience complete peace of mind with end-to-end traceability. Monitor your donation's journey from its listing to its final, impactful delivery.",
    },
    {
      icon: Recycle,
      name: "Sustainable Recycling Pathways",
      description:
        "For items that cannot be reused, MedLoopAi provides recommendations for environmentally responsible disposal or advanced recycling options, minimizing waste.",
    },
    {
      icon: LayoutDashboard,
      name: "Intuitive User Dashboards",
      description:
        "Tailored dashboards for donors, NGOs, and patients provide a streamlined experience for listing, requesting, managing, and tracking medical supplies effortlessly.",
    },
    {
      icon: ShieldCheck,
      name: "Robust Security & Compliance",
      description:
        "Our platform is built with stringent security protocols and compliance checks, ensuring all redistributions are legal, safe, and protect user data.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-white sm:py-28">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="text-center">
          <motion.h2
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-base font-semibold tracking-wide uppercase text-indigo-600"
          >
            Core Capabilities
          </motion.h2>
          <motion.p
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl"
          >
            Innovation at the Heart of Healthcare Redistribution
          </motion.p>
          <motion.p
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="max-w-3xl mt-6 text-xl text-gray-600 lg:mx-auto"
          >
            We leverage cutting-edge technology to redefine how unused medical
            supplies create impact, ensuring safety, efficiency, and
            sustainability.
          </motion.p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 gap-12 mt-20 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              variants={fadeIn}
              key={feature.name}
              className="p-8 bg-gray-50 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col items-start"
            >
              <div className="flex items-center justify-center w-14 h-14 text-white rounded-full bg-linear-to-br from-indigo-500 to-emerald-500 shadow-md">
                <feature.icon className="w-7 h-7" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-xl font-bold leading-relaxed text-gray-900">
                {feature.name}
              </h3>
              <p className="mt-3 text-base text-gray-600 flex-wrap">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
export default FeaturesSection;
