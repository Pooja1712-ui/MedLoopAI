import React from "react";
import { HeartHandshake } from "lucide-react";

// This file is just your original Footer component, unchanged.
const Footer = () => {
  return (
    <footer className="bg-gray-900">
      <div className="container px-4 py-16 mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-5">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center space-x-2 mb-4">
              <HeartHandshake className="w-8 h-8 text-indigo-400" />
              <span className="text-2xl font-bold text-white">MedLoopAi</span>
            </a>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering communities through sustainable healthcare.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-300 uppercase">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="#"
                  className="text-base text-gray-400 hover:text-white transition-colors duration-200"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-base text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Our Mission
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-base text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-base text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-300 uppercase">
              Platform
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="#"
                  className="text-base text-gray-400 hover:text-white transition-colors duration-200"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-base text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Donate Medicines
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-base text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Find Devices
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-base text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Security
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-300 uppercase">
              Resources
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="#"
                  className="text-base text-gray-400 hover:text-white transition-colors duration-200"
                >
                  FAQs
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-base text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Support
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-base text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Partnerships
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-300 uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="#"
                  className="text-base text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-base text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-base text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Disclaimer
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-10 mt-12 border-t border-gray-700">
          <p className="text-base text-center text-gray-500">
            &copy; {new Date().getFullYear()} MedLoopAi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
