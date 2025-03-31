import React from "react";
import { Link } from "react-router-dom";

const UserNavbar = () => {
  return (
    <div>
      <nav className="bg-gray-100 border-b border-gray-300 px-4 py-2">
        <ul className="flex justify-center space-x-6">
          <li>
            <a
              href="/dashboard"
              className="text-gray-700 font-semibold hover:text-red-500"
            >
              Dashboard
            </a>
          </li>
          <li>
            <a
              href="/inbox"
              className="text-gray-700 font-semibold hover:text-red-500"
            >
              Inbox
            </a>
          </li>
          <li>
            <Link
              to="/hosting"
              className="text-gray-700 font-semibold hover:text-red-500"
            >
              Hosting
            </Link>
          </li>
          <li>
            <a
              href="/travelling"
              className="text-gray-700 font-semibold hover:text-red-500"
            >
              Travelling
            </a>
          </li>
          <li>
            <a
              href="/profile"
              className="text-gray-700 font-semibold hover:text-red-500"
            >
              Profile
            </a>
          </li>
          <li>
            <a
              href="/account"
              className="text-gray-700 font-semibold hover:text-red-500"
            >
              Account
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default UserNavbar;
