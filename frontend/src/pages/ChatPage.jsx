// frontend/src/pages/ChatPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Send, 
  ArrowLeft, 
  Paperclip, 
  Image as ImageIcon,
  MoreVertical,
  User
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../config/api';

const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to start chatting');
      navigate('/login');
      return;
    }

    startConversation();
  }, [userId, isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startConversation = async () => {
    try {
      setIsLoading(true);
      
      // First, create or get conversation
      
      // OLD CODE - Commented out
      // const conversationResponse = await fetch('http://localhost:5000/api/chat/conversations', {
      
      // NEW CODE - Using environment variable
      const conversationResponse = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ participantId: userId })
      });

      const conversationData = await conversationResponse.json();

      if (!conversationResponse.ok) {
        // Handle specific error cases
        if (conversationResponse.status === 409) {
          // Conversation exists but had retrieval issues
          toast.error('Conversation issue detected. Please try again.');
          return;
        }
        throw new Error(conversationData.message || 'Failed to start conversation');
      }

      setConversation(conversationData.conversation);

      // Then load messages
      await loadMessages(conversationData.conversation._id);

    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error(error.message || 'Failed to start conversation');
      navigate('/contributors');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      
      // OLD CODE - Commented out
      // const response = await fetch(`http://localhost:5000/api/chat/conversations/${conversationId}/messages`, {
      
      // NEW CODE - Using environment variable
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const data = await response.json();
      setMessages(data.messages || []);

    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !conversation) return;

    try {
      setIsSending(true);
      
      // OLD CODE - Commented out
      // const response = await fetch('http://localhost:5000/api/chat/messages', {
      
      // NEW CODE - Using environment variable
      const response = await fetch(`${API_BASE_URL}/api/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          conversationId: conversation._id,
          content: newMessage.trim(),
          messageType: 'text'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Add new message to the list
      setMessages(prev => [...prev, data.message]);
      setNewMessage('');

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const getOtherParticipant = () => {
    if (!conversation) return null;
    return conversation.participants.find(p => p._id !== user.id);
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const otherParticipant = getOtherParticipant();

  if (isLoading) {
    return (
      <Layout showSidebar={false}>
        <div className="max-w-4xl mx-auto h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Starting conversation...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!conversation || !otherParticipant) {
    return (
      <Layout showSidebar={false}>
        <div className="max-w-4xl mx-auto h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Conversation not found</p>
            <button
              onClick={() => navigate('/contributors')}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Back to Contributors
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={false}>
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Chat Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/contributors')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {otherParticipant.username?.charAt(0).toUpperCase()}
            </div>
            
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {otherParticipant.username}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {otherParticipant.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <MoreVertical size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Send your first message to {otherParticipant.username}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.sender._id === user.id
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender._id === user.id
                        ? 'text-blue-100'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={sendMessage} className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isSending}
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                type="button"
                className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <Paperclip size={20} />
              </button>
              
              <button
                type="submit"
                disabled={!newMessage.trim() || isSending}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;