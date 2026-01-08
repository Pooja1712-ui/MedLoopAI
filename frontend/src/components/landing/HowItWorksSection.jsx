import React from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, ShieldCheck, Link2, Truck } from "lucide-react";
import { fadeIn, staggerContainer } from "../../utils/animations";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: LayoutDashboard,
      title: "1. Create & List",
      description:
        "Donors (individuals, pharmacies, hospitals) register and easily list unused medicines or devices on their personalized dashboard.",
    },
    {
      icon: ShieldCheck,
      title: "2. AI Validation",
      description:
        "Our advanced AI module scans images and data to instantly verify expiry dates, product integrity, and authenticity, ensuring safety.",
    },
    {
      icon: Link2,
      title: "3. Smart Matching",
      description:
        "An intelligent algorithm precisely matches validated donations with urgent needs from NGOs, healthcare facilities, and patients based on location and specific requirements.",
    },
    {
      icon: Truck,
      title: "4. Deliver & Impact",
      description:
        "Coordinated logistics ensure secure and traceable pickup and delivery of vital medical supplies, completing the loop of care.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50 sm:py-28" id="how-it-works">
      <div className="container px-4 mx-auto max-w-7xl">
        <motion.h2
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-4xl font-extrabold tracking-tight text-center text-gray-900 sm:text-5xl"
        >
          The MedLoopAi Process
        </motion.h2>
        <motion.p
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto mt-6 text-xl text-center text-gray-600"
        >
          A seamless, transparent, and secure journey from donation to a
          dignified second life.
        </motion.p>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 gap-12 mt-20 md:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((step, index) => (
            <motion.div
              variants={fadeIn}
              key={index}
              className="p-8 text-center bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2 relative group"
            >
              <div className="inline-flex items-center justify-center w-18 h-18 rounded-full bg-linear-to-br from-indigo-100 to-emerald-100 p-3 mb-6">
                <step.icon className="w-9 h-9 text-indigo-600 group-hover:text-emerald-600 transition-colors duration-300" />
              </div>
              <h3 className="mt-4 text-2xl font-bold text-gray-900 leading-snug">
                {step.title}
              </h3>
              <p className="mt-3 text-lg text-gray-600">{step.description}</p>
              {/* Step number as a subtle badge */}
              <div className="absolute top-4 left-4 text-3xl font-extrabold text-gray-200 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                {index + 1}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
export default HowItWorksSection;
