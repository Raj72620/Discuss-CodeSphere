// frontend/src/components/Layout/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Github, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Platform',
      links: [
        { path: '/', label: 'Home' },
        { path: '/discussions', label: 'Discussions' },
        { path: '/contributors', label: 'Contributors' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { path: '#documentation', label: 'Documentation' },
        { path: '#guidelines', label: 'Guidelines' },
        { path: '#help', label: 'Help Center' },
      ],
    },
  ];

  const socialLinks = [
    { 
      icon: Github, 
      href: 'https://github.com/Raj72620', 
      label: 'GitHub' 
    },
    { 
      icon: Linkedin, 
      href: 'http://www.linkedin.com/in/nishanth-singh', 
      label: 'LinkedIn' 
    },
    { 
      icon: Mail, 
      href: 'mailto:nishanthraj9618@gmail.com', 
      label: 'Email' 
    },
  ];

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start space-y-8 md:space-y-0">
          
          {/* Brand Section */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Code2 className="text-white" size={16} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  CodeSphere
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Developer Community
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
              Connect, collaborate, and grow with developers worldwide.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Section */}
          <div className="flex flex-col sm:flex-row space-y-8 sm:space-y-0 sm:space-x-16">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-4 uppercase tracking-wider">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      {link.path.startsWith('/') ? (
                        <Link 
                          to={link.path} 
                          className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm hover:underline"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a 
                          href={link.path} 
                          className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm hover:underline"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © {currentYear} CodeSphere. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <a href="#privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:underline">
              Privacy
            </a>
            <a href="#terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:underline">
              Terms
            </a>
            <a href="#cookies" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:underline">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;