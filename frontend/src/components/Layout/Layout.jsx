// frontend/src/components/Layout/Layout.jsx

import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useSelector } from 'react-redux';

const Layout = ({ children, showSidebar = true }) => {
  const { sidebarOpen } = useSelector((state) => state.ui);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className={`flex gap-8 ${showSidebar ? 'flex-col lg:flex-row' : ''}`}>
          {/* Main Content */}
          <div className={`${showSidebar ? 'flex-1' : 'w-full'}`}>
            {children}
          </div>

          {/* Sidebar */}
          {showSidebar && sidebarOpen && (
            <div className="lg:w-80 flex-shrink-0">
              <Sidebar />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Layout;