import React from "react";
import { motion } from "framer-motion";
import { HeartHandshake, ScanSearch, ArrowRight } from "lucide-react";
import { fadeIn, staggerContainer } from "../../utils/animations";

const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-linear-to-br from-indigo-50 to-emerald-50 py-20 sm:py-24 lg:py-32"
    >
      <div className="container px-4 mx-auto text-center max-w-7xl">
        <motion.h1
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-tight"
        >
          <span className="block">Give Unused Medicine a</span>
          <span className="block text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-emerald-600">
            Second Life
          </span>
        </motion.h1>
        <motion.p
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-3xl mx-auto mt-6 text-xl text-gray-600 sm:text-2xl"
        >
          MedLoopAi connects donors of surplus medical supplies with NGOs and
          patients in need, powered by smart validation and matching.
        </motion.p>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col justify-center mt-12 space-y-5 sm:flex-row sm:space-y-0 sm:space-x-5"
        >
          <motion.button
            variants={fadeIn}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 25px -5px rgba(99,102,241,0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white transition-all duration-300 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700"
          >
            <HeartHandshake className="w-6 h-6 mr-3" />
            Donate Now
          </motion.button>
          <motion.button
            variants={fadeIn}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 25px -5px rgba(5,150,105,0.2)",
            }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold transition-all duration-300 rounded-full shadow-lg text-indigo-700 bg-white hover:bg-gray-50 border border-gray-200"
          >
            <ScanSearch className="w-6 h-6 mr-3" />
            Find Supplies
            <ArrowRight className="w-5 h-5 ml-2" />
          </motion.button>
        </motion.div>
      </div>
      {/* Background blobs for modern look */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
    </section>
  );
};
export default HeroSection;
