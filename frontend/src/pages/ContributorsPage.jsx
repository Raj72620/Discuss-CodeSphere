// frontend/src/pages/ContributorsPage.jsx

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Users, MessageCircle, Calendar, Filter, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import ChatInterface from '../components/Chat/ChatInterface'; 
import MessageIndicator from '../components/UI/MessageIndicator';
import { chatAPI } from '../services/chatAPI';
import { fetchUnreadCounts, setActiveConversation } from '../store/slices/chatSlice';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../config/api';

const ContributorsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { unreadCounts, isChatOpen, activeRecipient } = useSelector((state) => state.chat);
  const [contributors, setContributors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchContributors();
    dispatch(fetchUnreadCounts());
  }, []);

  const fetchContributors = async () => {
    try {
      setIsLoading(true);
      
      // OLD CODE - Commented out
      // const response = await fetch('http://localhost:5000/api/users/contributors');
      
      // NEW CODE - Using environment variable
      const response = await fetch(`${API_BASE_URL}/api/users/contributors`);
      const data = await response.json();
      
      // Filter out current user from the list
      const filteredUsers = data.users.filter(contributor => 
        contributor._id !== user?.id
      );
      
      setContributors(filteredUsers);
    } catch (error) {
      console.error('Error fetching contributors:', error);
      toast.error('Failed to load contributors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = async (recipient) => {
    try {
      console.log('Starting chat with:', recipient);
      
      const response = await chatAPI.getOrCreateConversation(recipient._id);
      
      console.log('Chat API response:', response);
      
      dispatch(setActiveConversation({
        conversation: response.conversation,
        recipient: recipient
      }));
    } catch (err) {
      console.error('Error starting chat:', err);
      console.error('Error response:', err.response?.data);
      
      const errorMessage = err.response?.data?.message || err?.message || 'Failed to start conversation';
      toast.error(errorMessage);
    }
  };

  const formatJoinDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getOnlineStatus = (contributor) => {
    if (contributor.isOnline) return 'Online';
    if (contributor.lastSeen) {
      const lastSeen = new Date(contributor.lastSeen);
      const now = new Date();
      const diffHours = (now - lastSeen) / (1000 * 60 * 60);
      
      if (diffHours < 1) return 'Recently online';
      if (diffHours < 24) return `Last seen ${Math.floor(diffHours)}h ago`;
      return `Last seen ${formatJoinDate(contributor.lastSeen)}`;
    }
    return 'Offline';
  };

  const filteredContributors = contributors.filter(contributor =>
    contributor.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contributor.bio && contributor.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Layout showSidebar={false}>
      <div className="max-w-7xl mx-auto h-screen flex bg-gray-50 dark:bg-gray-900">
        {/* Left Side - Contributors List */}
        <div className={`${isChatOpen ? 'w-1/3' : 'w-full'} flex flex-col border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg`}>
          {/* Header Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Community
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Connect with {contributors.length} developers
                </p>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or expertise..."
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm transition-all duration-200"
              />
            </div>
          </div>

          {/* Contributors List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {isLoading ? (
              // Enhanced loading skeletons
              [...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : filteredContributors.length > 0 ? (
              filteredContributors.map((contributor) => (
                <div 
                  key={contributor._id} 
                  className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-lg group ${
                    activeRecipient?._id === contributor._id 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                  onClick={() => handleStartChat(contributor)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            {contributor.username?.charAt(0).toUpperCase()}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm ${
                            contributor.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {contributor.username}
                            </h3>
                            <MessageIndicator 
                              count={unreadCounts[contributor._id]} 
                              isActive={activeRecipient?._id === contributor._id}
                            />
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              contributor.isOnline 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {getOnlineStatus(contributor)}
                            </span>
                          </div>
                          {contributor.bio && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2 leading-relaxed">
                              {contributor.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Users size={14} />
                            <span className="font-medium">{contributor.postCount || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>{formatJoinDate(contributor.joinDate)}</span>
                          </div>
                        </div>
                        
                        <ArrowRight 
                          size={16} 
                          className={`text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all duration-200 ${
                            activeRecipient?._id === contributor._id ? 'text-blue-500' : ''
                          }`} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No contributors found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                  {searchQuery ? 'Try adjusting your search terms to find what you\'re looking for.' : 'Be the first to join our growing community!'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Chat Interface */}
        {isChatOpen && (
          <div className="w-2/3 flex flex-col bg-white dark:bg-gray-800 shadow-inner">
            <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Messages
                  </h2>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <ChatInterface />
            </div>
          </div>
        )}

        {/* No Chat Selected State */}
        {!isChatOpen && (
          <div className="hidden lg:flex w-2/3 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 items-center justify-center border-l border-gray-200 dark:border-gray-700">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MessageCircle size={40} className="text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Start a Conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
                Select a contributor from the list to begin chatting, sharing code, and collaborating in real-time.
              </p>
              <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ContributorsPage;