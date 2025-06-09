import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Extract first name from user.name
  const getFirstName = (fullName) => {
    if (!fullName) return '';
    return fullName.split(' ')[0];
  };

  return (
    <>
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">WiseLearn</h1>
            </Link>
          </div>

          {/* Center - Welcome Message */}
          <div className="hidden md:flex items-center">
            {user && (
              <span className="text-gray-700 font-medium">
                Welcome Back, {getFirstName(user.name)}
              </span>
            )}
          </div>

          {/* Right Side - My Courses and User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user?.role === 'student' && (
              <>
              <Link to="/enrolled-courses" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md">
                My Courses
              </Link>

              <Link to="/courses" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md">
                All Courses
              </Link>
              </>
              
            )}
            {user?.role === 'instructor' && (
              <>
              <Link to="/courses" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md">
                My Courses
              </Link>
              </>
              
            )}
            {user ? (
              <button
                onClick={handleLogout}
                className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Logout
              </button>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user && (
              <div className="px-3 py-2 text-gray-700 font-medium border-b border-gray-200 mb-2">
                Welcome Back, {getFirstName(user.name)}
              </div>
            )}
            
            {user?.role === 'student' && (
              <>
              <Link
               to="/enrolled-courses"
               className="block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
               onClick={() => setIsOpen(false)}
             >
               My Courses
             </Link>

             <Link
               to="/courses"
               className="block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
               onClick={() => setIsOpen(false)}
             >
               All Courses
             </Link>
              </>
               
            )}
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            ) : (
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="block w-full text-left text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
    
    </>
  );
};

export default NavBar;