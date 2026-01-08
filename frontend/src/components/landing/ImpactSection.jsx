import React from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "../../utils/animations";

const ImpactSection = () => {
  const stats = [
    {
      label: "Donations Redirected",
      value: "50,000+",
      description:
        "Equivalent to millions in medical value given a new purpose.",
    },
    {
      label: "Lives Touched",
      value: "10,000+",
      description:
        "Patients and communities gaining access to critical healthcare resources.",
    },
    {
      label: "Waste Reduced",
      value: "200+ Tonnes",
      description:
        "Preventing valuable medical items from ending up in landfills.",
    },
  ];

  return (
    <section
      id="impact"
      className="py-20 bg-linear-to-br from-indigo-700 to-emerald-700 sm:py-28"
    >
      <div className="container px-4 mx-auto max-w-7xl">
        <motion.h2
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-4xl font-extrabold text-center text-white sm:text-5xl"
        >
          Our Tangible Impact
        </motion.h2>
        <motion.p
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto mt-6 text-xl text-center text-indigo-100"
        >
          MedLoopAi is more than a platform; it's a movement towards a
          healthier, more sustainable future for everyone.
        </motion.p>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 gap-12 mt-20 md:grid-cols-3"
        >
          {stats.map((stat) => (
            <motion.div
              variants={fadeIn}
              key={stat.label}
              className="p-8 bg-white rounded-2xl shadow-xl text-center flex flex-col items-center"
            >
              <p className="text-base font-semibold tracking-wide uppercase text-indigo-600">
                {stat.label}
              </p>
              <p className="mt-2 text-5xl font-extrabold text-gray-900 leading-none">
                {stat.value}
              </p>
              <p className="mt-4 text-lg text-gray-600">{stat.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
export default ImpactSection;
