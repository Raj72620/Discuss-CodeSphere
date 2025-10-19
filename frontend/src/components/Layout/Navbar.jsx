// frontend/src/components/Layout/Navbar.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Moon, 
  Sun, 
  Menu, 
  X, 
  Plus, 
  User, 
  LogOut, 
  Settings, 
  Bookmark,
  ChevronDown,
  MessageCircle,
  Users,
  Home,
  MessageSquare
} from 'lucide-react';
import { setTheme } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useSelector((state) => state.ui);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  
  const userDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeToggle = () => {
    dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
    navigate('/');
  };

  const formatJoinDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/discussions', label: 'Discussions', icon: MessageSquare },
    { path: '/contributors', label: 'Community', icon: Users },
  ];

  const userMenuItems = [
    { icon: User, label: 'My Profile', path: '/profile' },
    { icon: Bookmark, label: 'Saved Posts', path: '/saved-posts' },
    { icon: MessageCircle, label: 'Messages', path: '/contributors' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <nav className="bg-white/95 dark:bg-gray-900/95 border-b border-gray-200/50 dark:border-gray-800/50 backdrop-blur-lg sticky top-0 z-50 supports-backdrop-blur:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <span className="text-white font-bold text-sm">CS</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  CodeSphere
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1 font-medium">
                  Developer Hub
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                      isActive 
                        ? 'text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-900/30 shadow-sm' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/80'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-blue-600 dark:text-blue-400' : ''} />
                    <span>{link.label}</span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                    )}
                    
                    {/* Hover effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="p-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-3">
                {/* New Post Button */}
                <Link
                  to="/create-post"
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  <Plus size={16} />
                  <span>Create Post</span>
                </Link>
                
                {/* User Dropdown */}
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                  >
                    <div className="relative">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg group-hover:shadow-xl transition-all duration-300">
                        {user?.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></div>
                    </div>
                    <ChevronDown 
                      size={16} 
                      className={`text-gray-500 transition-transform duration-300 ${
                        isUserDropdownOpen ? 'rotate-180 text-blue-500' : 'group-hover:text-gray-700 dark:group-hover:text-gray-300'
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-lg overflow-hidden z-50">
                      {/* User Info Header */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 px-4 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                            {user?.username?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 dark:text-white text-sm truncate">
                              {user?.username}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 text-xs truncate mt-1">
                              {user?.email}
                            </div>
                            <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
                                {user?.postCount || 0} posts
                              </span>
                              <span>•</span>
                              <span>Joined {user?.joinDate ? formatJoinDate(user.joinDate) : '2024'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {userMenuItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.label}
                              to={item.path}
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
                              onClick={() => setIsUserDropdownOpen(false)}
                            >
                              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                                <Icon size={16} className="text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                              </div>
                              <span className="font-medium">{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Logout Section */}
                      <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                        >
                          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/40 transition-colors">
                            <LogOut size={16} />
                          </div>
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 text-sm font-semibold border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200/50 dark:border-gray-800/50 py-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg">
            {/* Mobile Navigation Links */}
            <div className="space-y-2 mb-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? 'text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon size={18} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-gray-200/50 dark:border-gray-800/50 space-y-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/create-post"
                    className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Plus size={16} />
                    <span>Create Post</span>
                  </Link>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          to={item.path}
                          className="flex items-center space-x-2 py-2.5 px-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm text-center justify-center"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon size={16} />
                          <span className="text-xs">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-2 w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 py-3 px-4 rounded-xl transition-colors text-sm font-semibold border border-red-200 dark:border-red-800"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block py-3 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-sm font-semibold text-center border border-gray-200 dark:border-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Join Community
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;