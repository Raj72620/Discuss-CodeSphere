// frontend/src/pages/HomePage.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, Users, MessageSquare, Code, Rocket, ArrowRight, Sparkles, Zap } from 'lucide-react';
import Layout from '../components/Layout/Layout';

const HomePage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  const features = [
    {
      icon: MessageSquare,
      title: 'Technical Discussions',
      description: 'Engage in meaningful conversations about programming challenges and solutions with developers worldwide.',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
    },
    {
      icon: Code,
      title: 'Code Collaboration',
      description: 'Share code snippets, review implementations, and learn from fellow developers in real-time.',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
    },
    {
      icon: Users,
      title: 'Developer Community',
      description: 'Connect with experienced developers and industry professionals across the globe.',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
    },
    {
      icon: Zap,
      title: 'Real-time Chat',
      description: 'Instant messaging with fellow developers for quick help and collaboration.',
      gradient: 'from-yellow-500 to-amber-500',
      bgGradient: 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20'
    }
  ];

  return (
    <Layout showSidebar={false}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent dark:from-blue-900/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16 lg:py-20">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-full px-4 py-2 mb-6 shadow-lg">
              <Sparkles size={14} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Welcome to CodeSphere
              </span>
            </div>

            {/* Main Heading */}
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Build. Share. Grow.
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
                The ultimate platform for developers to collaborate, learn from peers, 
                and accelerate their career through real-time code discussions and expert insights.
              </p>
              
              {/* CTA Buttons */}
              {isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Link
                    to="/create-post"
                    className="group inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
                  >
                    <Plus size={18} />
                    <span>Start Discussion</span>
                    <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/discussions"
                    className="group inline-flex items-center space-x-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 font-semibold hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                  >
                    <MessageSquare size={18} />
                    <span>Browse Feed</span>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Link
                    to="/register"
                    className="group inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
                  >
                    <Rocket size={18} />
                    <span>Join Free</span>
                    <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/discussions"
                    className="group inline-flex items-center space-x-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 font-semibold hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                  >
                    <MessageSquare size={18} />
                    <span>Explore Now</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Level Up
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              A complete ecosystem designed for modern developers
            </p>
          </div>
          
          {/* Features Grid - 4 columns for desktop, 2 for tablet, 1 for mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="group relative bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-transparent transition-all duration-300 hover:shadow-xl flex flex-col h-full"
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Icon */}
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-300`}>
                      <Icon className="text-white" size={22} />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex-grow">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Ready to accelerate your growth?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Join developers who are already building the future
              </p>
              <Link
                to={isAuthenticated ? "/create-post" : "/register"}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                <Rocket size={16} />
                <span>{isAuthenticated ? 'Create First Post' : 'Start Your Journey'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;