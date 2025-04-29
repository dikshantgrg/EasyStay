import React from "react";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-200 px-13 py-8">
      <div className="container mx-auto px-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Column 1 */}
        <div>
          <h5 className="text-4xl font-semibold mb-4">EasyStay</h5>
          <p className="text-sm">
            Find and book unique accommodations
          </p>
        </div>
        {/* Column 2 */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Discover</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:underline">
                How it works
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Cancellation Options
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Travel Guides
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:underline">
                Help Center
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Safety Information
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Contact Us
              </a>
            </li>
          </ul>
        </div>
        {/* Column 4 */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          <ul className="flex space-x-4">
            <li>
              <a href="#" className="hover:text-gray-400 flex items-center gap-2">
                <FaFacebook className="text-xl" />
                <span>Facebook</span>
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400 flex items-center gap-2">
                <FaTwitter className="text-xl" />
                <span>Twitter</span>
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400 flex items-center gap-2">
                <FaInstagram className="text-xl" />
                <span>Instagram</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="text-center text-sm text-gray-500 mt-8">
        &copy; {new Date().getFullYear()} Your Company. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;