import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black fixed bottom-0 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 flex items-center justify-center">
          {/* Brand & Copyright */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">WiseLearn</h2>
            <p className="text-sm text-gray-300">
              © {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;