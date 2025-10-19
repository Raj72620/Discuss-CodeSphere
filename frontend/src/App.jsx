// frontend/src/App.jsx

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DiscussionsPage from './pages/DiscussionsPage'; 
import ContributorsPage from './pages/ContributorsPage'; // Add this import
import PostPage from './pages/PostPage';
import CreatePostPage from './pages/CreatePostPage';
import ChatPage from './pages/ChatPage';
import EditPostPage from './pages/EditPostPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import SavedPostsPage from './pages/SavedPostsPage';

// Components
import LoadingSpinner from './components/UI/LoadingSpinner';
import { fetchCurrentUser } from './store/slices/authSlice';

function App() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.ui);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    // Fetch current user if token exists
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/discussions" element={<DiscussionsPage />} />
          <Route path="/contributors" element={<ContributorsPage />} /> {/* Add this line */}
          <Route path="/chat/:userId" element={<ChatPage />} />
          <Route path="/discussion/:postId" element={<PostPage />} />
          <Route path="/create-post" element={<CreatePostPage />} />
          <Route path="/edit-post/:postId" element={<EditPostPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/saved-posts" element={<SavedPostsPage />} />
        </Routes>

        {/* Global Loading Spinner */}
        {loading && <LoadingSpinner />}

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: 'green',
                secondary: 'black',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;