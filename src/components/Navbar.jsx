import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Navbar = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, isAdmin } = useAuth();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              {/* Bike Logo SVG */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-indigo-600" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="5.5" cy="17.5" r="3.5"/>
                <circle cx="18.5" cy="17.5" r="3.5"/>
                <path d="M15 6a1 1 0 100-2h-2a1 1 0 000 2h2zm-2 0L8.5 17.5m5-10.5l2 4.5-3 3m0 0h-4.5"/>
              </svg>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                DevSync BikeRental
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {currentUser && (
              <>
                {isAdmin() ? (
                  // Admin navigation
                  <>
                    <Link 
                      to="/admin" 
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-indigo-600 transition-colors duration-200"
                    >
                      Admin Panel
                    </Link>
                  </>
                ) : (
                  // Customer navigation
                  <>
                    <Link 
                      to="/dashboard" 
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-indigo-600 transition-colors duration-200"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/bikes" 
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-indigo-600 hover:text-gray-900 transition-colors duration-200"
                    >
                      Rent a Bike
                    </Link>
                    <Link 
                      to="/reviews" 
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-indigo-600 hover:text-gray-900 transition-colors duration-200"
                    >
                      Reviews
                    </Link>
                  </>
                )}
                
                {/* User profile and logout */}
                <div className="flex items-center ml-4">
                  <Link to="/profile">
                    <div className="relative group">
                      <div className="flex items-center space-x-3 cursor-pointer">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-medium text-gray-900">{currentUser.name}</span>
                          <span className="text-xs text-gray-500">{currentUser.role}</span>
                        </div>
                        <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-transparent group-hover:border-indigo-500 transition-all duration-200">
                          <img
                            className="h-full w-full rounded-full object-cover"
                            src={currentUser.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`}
                            alt={currentUser.name}
                          />
                        </div>
                      </div>
                      <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></div>
                    </div>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onLogout}
                    className="ml-4 px-3 py-1 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                  >
                    Logout
                  </motion.button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-white border-b border-gray-100`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {currentUser && (
            <>
              {isAdmin() ? (
                // Admin mobile navigation
                <Link
                  to="/admin"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-200"
                >
                  Admin Panel
                </Link>
              ) : (
                // Customer mobile navigation
                <>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/bikes"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-200"
                  >
                    Rent a Bike
                  </Link>
                </>
              )}
              
              {/* Profile link in mobile menu */}
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-200"
              >
                My Profile
              </Link>
              
              {/* User info and logout button */}
              <div className="px-3 py-3 border-t border-gray-100 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={currentUser.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`}
                      alt={currentUser.name}
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">{currentUser.name}</span>
                      <span className="block text-xs text-gray-500">{currentUser.role}</span>
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="px-3 py-1 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
