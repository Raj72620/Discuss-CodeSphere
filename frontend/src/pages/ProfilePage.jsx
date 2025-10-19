// frontend/src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { 
  User, 
  Bookmark, 
  Edit3,
  Calendar,
  Plus
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import PostList from '../components/Posts/PostList';
import { postsAPI } from '../services/postsAPI';
import { userAPI } from '../services/userAPI';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('posts');
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [username]);

  useEffect(() => {
    if (userData && isOwnProfile) {
      fetchTabData();
    }
  }, [activeTab, userData]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      if (username) {
        // Viewing another user's profile
        const response = await userAPI.getUserProfile(username);
        setUserData(response.user);
        setUserPosts(response.posts || []);
        setIsOwnProfile(false);
      } else if (currentUser) {
        // Viewing own profile
        const response = await userAPI.getUserProfile(currentUser.username);
        setUserData(response.user);
        setUserPosts(response.posts || []);
        setIsOwnProfile(true);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      toast.error(err?.response?.data?.message || 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTabData = async () => {
    try {
      if (activeTab === 'saved') {
        const savedResponse = await postsAPI.getSavedPosts();
        setSavedPosts(savedResponse.savedPosts || []);
      }
    } catch (err) {
      console.error('Tab data fetch error:', err);
      toast.error(err?.response?.data?.message || 'Failed to load data');
    }
  };

  const handleSaveUpdate = (postId, isSaved) => {
    // Update saved posts list
    if (!isSaved) {
      setSavedPosts(prev => prev.filter(post => post._id !== postId));
    }
    
    // Also update userPosts if the post is in there
    setUserPosts(prev => prev.map(post => 
      post._id === postId ? { ...post, isSaved } : post
    ));
  };

  const formatJoinDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (!currentUser && !username) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-red-500">Please login to view profile</div>
        </div>
      </Layout>
    );
  }

  if (isLoading && !userData) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!userData) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-red-500">User not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                {userData.avatarUrl ? (
                  <img 
                    src={userData.avatarUrl} 
                    alt={userData.username}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-2xl">
                    {userData.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userData.username}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {userData.email}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    <Edit3 size={16} />
                    <span>{userData.postCount || 0} Posts</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Bookmark size={16} />
                    <span>{userData.savedPostsCount || 0} Saved</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar size={16} />
                    <span>Joined {formatJoinDate(userData.joinDate)}</span>
                  </span>
                </div>
                {userData.bio && (
                  <p className="text-gray-600 dark:text-gray-300 mt-3 max-w-md">
                    {userData.bio}
                  </p>
                )}
              </div>
            </div>
            {isOwnProfile && (
              <Link
                to="/settings"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 size={16} />
                <span>Edit Profile</span>
              </Link>
            )}
          </div>
        </div>

        {/* Navigation Tabs - Only show for own profile */}
        {isOwnProfile && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'posts'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <User size={16} />
                    <span>My Posts</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'saved'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Bookmark size={16} />
                    <span>Saved Posts</span>
                  </div>
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'posts' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    My Discussions ({userPosts.length})
                  </h2>
                  <PostList 
                    posts={userPosts} 
                    isLoading={isLoading}
                    showSaveButton={true}
                    onSaveUpdate={handleSaveUpdate}
                    emptyMessage={{
                      title: "No posts yet",
                      description: "Start your first discussion!",
                      icon: "📝"
                    }}
                  />
                  {!isLoading && userPosts.length === 0 && (
                    <div className="text-center py-12">
                      <Link
                        to="/create-post"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus size={16} className="mr-2" />
                        Create Post
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'saved' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Saved Posts ({savedPosts.length})
                  </h2>
                  <PostList 
                    posts={savedPosts} 
                    isLoading={isLoading}
                    showSaveButton={true}
                    onSaveUpdate={handleSaveUpdate}
                    emptyMessage={{
                      title: "No saved posts",
                      description: "Save posts you want to read later by clicking the bookmark icon.",
                      icon: "🔖"
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other User's Posts */}
        {!isOwnProfile && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {userData.username}'s Posts ({userPosts.length})
            </h2>
            <PostList 
              posts={userPosts} 
              isLoading={isLoading}
              showSaveButton={true}
              onSaveUpdate={handleSaveUpdate}
              emptyMessage={{
                title: "No posts yet",
                description: `${userData.username} hasn't created any posts yet.`,
                icon: "📝"
              }}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;