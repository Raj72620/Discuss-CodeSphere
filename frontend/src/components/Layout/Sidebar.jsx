// frontend/src/components/Layout/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Tag, MessageSquare, Award } from 'lucide-react';
import { trendingAPI } from '../../services/trendingAPI';

const Sidebar = () => {
  const [trendingData, setTrendingData] = useState({
    topContributors: [],
    trendingTags: [],
    recentPopularPosts: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTrendingData = async () => {
      try {
        const data = await trendingAPI.getTrendingData();
        if (isMounted) {
          setTrendingData(data || {
            topContributors: [],
            trendingTags: [],
            recentPopularPosts: []
          });
        }
      } catch (error) {
        // Silently fail for UI, just log warning
        console.warn('Trending data could not be loaded:', error);
        if (isMounted) {
          setTrendingData({
            topContributors: [],
            trendingTags: [],
            recentPopularPosts: []
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTrendingData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <aside className="w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 h-fit space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 h-fit space-y-8">
      {/* Top Contributors */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Users size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-base">Top Contributors</h3>
        </div>
        <div className="space-y-3">
          {trendingData.topContributors?.slice(0, 5).map((contributor, index) => (
            <div key={contributor._id || index} className="flex items-center justify-between group">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center text-white ${index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-amber-600' :
                      'bg-blue-600'
                  }`}>
                  {index + 1}
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  {contributor.username?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/profile/${contributor.username}`}
                    className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block text-sm"
                  >
                    {contributor.username}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {contributor.postCount} contributions
                  </p>
                </div>
              </div>
              <Award size={14} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Trending Tags */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Tag size={18} className="text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-base">Trending Tags</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingData.trendingTags?.slice(0, 10).map((tag, index) => (
            <Link
              key={tag.name || index}
              to={`/search?tag=${tag.name}`}
              className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
            >
              <span>#{tag.name}</span>
              <span className="ml-1.5 px-1 bg-white dark:bg-gray-700 rounded text-xs font-normal">
                {tag.count}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Discussions */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <TrendingUp size={18} className="text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-base">Popular Discussions</h3>
        </div>
        <div className="space-y-3">
          {trendingData.recentPopularPosts?.slice(0, 3).map((post, index) => (
            <Link
              key={post._id || index}
              to={`/discussion/${post._id}`}
              className="block p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1 pr-2">
                  {post.title}
                </h4>
                <div className={`w-5 h-5 rounded text-xs font-medium flex items-center justify-center text-white flex-shrink-0 ${index === 0 ? 'bg-orange-500' :
                  index === 1 ? 'bg-blue-500' :
                    'bg-green-500'
                  }`}>
                  {index + 1}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <TrendingUp size={10} />
                    <span>{post.likes?.length || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare size={10} />
                    <span>{post.commentCount}</span>
                  </div>
                </div>
                <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                  Trending
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;