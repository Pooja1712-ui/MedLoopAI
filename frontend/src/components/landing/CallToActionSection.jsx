import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { fadeIn, staggerContainer } from "../../utils/animations";

const CallToActionSection = () => {
  return (
    <section className="py-20 bg-white sm:py-28">
      <div className="container px-4 mx-auto max-w-7xl">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="p-10 bg-linear-to-r from-indigo-500 to-emerald-500 rounded-3xl text-center shadow-2xl relative overflow-hidden"
        >
          {/* Background shapes */}
          <div className="absolute top-0 left-0 w-full h-full bg-pattern-dots opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl leading-tight">
              Ready to Make a Difference?
            </h2>
            <p className="max-w-2xl mx-auto mt-6 text-xl text-indigo-100">
              Join the MedLoopAi community today and be a part of transforming
              healthcare access and sustainability.
            </p>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              className="flex flex-col justify-center mt-12 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4"
            >
              <motion.button
                variants={fadeIn}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 8px 25px -5px rgba(0,0,0,0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-indigo-700 transition-all duration-300 rounded-full bg-white hover:bg-gray-100 shadow-lg"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
              <motion.button
                variants={fadeIn}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 8px 25px -5px rgba(0,0,0,0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white transition-all duration-300 rounded-full border border-white hover:bg-white hover:text-indigo-700 shadow-lg"
              >
                Learn More
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
export default CallToActionSection;
