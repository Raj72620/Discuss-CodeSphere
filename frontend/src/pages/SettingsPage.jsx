// frontend/src/pages/SettingsPage.jsx

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Moon, 
  Sun, 
  LogOut, 
  Share2,
  User
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { logout } from '../store/slices/authSlice';
import { toast } from 'react-hot-toast';

const SettingsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast.success(`Dark mode ${newDarkMode ? 'enabled' : 'disabled'}`);
  };

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${user.username}`;
    if (navigator.share) {
      navigator.share({
        title: `${user.username}'s Profile - CodeSphere`,
        text: `Check out ${user.username}'s profile on CodeSphere`,
        url: profileUrl,
      });
    } else {
      navigator.clipboard.writeText(profileUrl);
      toast.success('Profile link copied to clipboard!');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Settings
          </h1>

          {/* Appearance Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Appearance
            </h2>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Dark Mode
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Toggle dark/light theme
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Account Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Account
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleShareProfile}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Share2 size={20} />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Share Profile
                  </span>
                </div>
                <span className="text-blue-600 dark:text-blue-400 text-sm">
                  Share
                </span>
              </button>

              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <User size={20} />
                  <span className="font-medium text-gray-900 dark:text-white">
                    View Profile
                  </span>
                </div>
                <span className="text-blue-600 dark:text-blue-400 text-sm">
                  View
                </span>
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
              Danger Zone
            </h2>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;