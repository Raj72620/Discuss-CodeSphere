// frontend/src/components/Chat/ChatInterface.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Send, 
  X, 
  Edit, 
  Trash2, 
  Check, 
  X as CloseIcon,
  MoreVertical,
  User
} from 'lucide-react';
import { chatAPI } from '../../services/chatAPI';
import { closeChat, addMessage, fetchUnreadCounts } from '../../store/slices/chatSlice';
import { toast } from 'react-hot-toast';
import socketService from '../../services/socketService'; // ADD SOCKET SERVICE

const ChatInterface = () => {
  const dispatch = useDispatch();
  const { activeConversation, activeRecipient } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (activeConversation) {
      loadMessages();
      setupSocketListeners();
      joinConversationRoom();
    }

    return () => {
      // Cleanup socket listeners
      if (activeConversation) {
        socketService.leaveConversation(activeConversation._id);
        socketService.off('new-message');
        socketService.off('message-edited');
        socketService.off('message-deleted');
      }
    };
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const setupSocketListeners = () => {
    // Listen for new messages
    socketService.on('new-message', (message) => {
      if (message.conversation === activeConversation._id) {
        setMessages(prev => [...prev, message]);
        dispatch(fetchUnreadCounts()); // Refresh unread counts
      }
    });

    // Listen for edited messages
    socketService.on('message-edited', (updatedMessage) => {
      if (updatedMessage.conversation === activeConversation._id) {
        setMessages(prev => prev.map(msg => 
          msg._id === updatedMessage._id ? updatedMessage : msg
        ));
      }
    });

    // Listen for deleted messages
    socketService.on('message-deleted', (deletedMessage) => {
      if (deletedMessage.conversation === activeConversation._id) {
        setMessages(prev => prev.map(msg => 
          msg._id === deletedMessage._id ? deletedMessage : msg
        ));
      }
    });
  };

  const joinConversationRoom = () => {
    if (activeConversation) {
      socketService.joinConversation(activeConversation._id);
    }
  };

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await chatAPI.getConversationMessages(activeConversation._id);
      setMessages(response.messages || []);
      
      // Refresh unread counts after loading messages
      dispatch(fetchUnreadCounts());
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeConversation) return;

    try {
      setIsSending(true);
      
      // Use the response properly
      const response = await chatAPI.sendMessage({
        conversationId: activeConversation._id,
        content: newMessage.trim(),
        messageType: 'text'
      });

      // Add new message to the list
      setMessages(prev => [...prev, response.message]);
      setNewMessage('');
      
      // Dispatch to Redux for global state
      dispatch(addMessage(response.message));

      // Emit socket event for real-time
      socketService.sendMessage({
        ...response.message,
        participants: activeConversation.participants
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    try {
      // Use the response properly
      const response = await chatAPI.editMessage(messageId, newContent);
      
      // Update message in local state
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, content: newContent, isEdited: true, editedAt: new Date() } : msg
      ));

      // Emit socket event for real-time
      socketService.editMessage(response.updatedMessage);
      
      setEditingMessage(null);
      toast.success('Message updated');
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      // Use the response properly
      const response = await chatAPI.deleteMessage(messageId);
      
      // Update message in local state (soft delete)
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { 
          ...msg, 
          isDeleted: true, 
          content: 'This message was deleted', 
          deletedAt: new Date() 
        } : msg
      ));

      // Emit socket event for real-time
      socketService.deleteMessage(response.deletedMessage);
      
      setShowMenu(null);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleCloseChat = () => {
    dispatch(closeChat());
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMessageDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  if (!activeRecipient) {
    return (
      <div className="h-full bg-white dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <User size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No chat selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            {activeRecipient.username?.charAt(0).toUpperCase()}
          </div>
          
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {activeRecipient.username}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {activeRecipient.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCloseChat}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Start a conversation
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Send your first message to {activeRecipient.username}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(messageGroups).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex items-center justify-center my-6">
                  <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {formatMessageDate(date)}
                    </span>
                  </div>
                </div>

                {/* Messages for this date */}
                <div className="space-y-3">
                  {dateMessages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${message.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="relative group max-w-xs lg:max-w-md">
                        {/* Message Bubble */}
                        <div
                          className={`px-4 py-2 rounded-2xl relative ${
                            message.sender._id === user.id
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-700'
                          } ${message.isDeleted ? 'opacity-60' : ''}`}
                        >
                          {/* Message Content */}
                          {message.isDeleted ? (
                            <p className="text-sm italic">{message.content}</p>
                          ) : editingMessage === message._id ? (
                            <EditMessageForm
                              message={message}
                              onSave={handleEditMessage}
                              onCancel={() => setEditingMessage(null)}
                            />
                          ) : (
                            <>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              
                              {/* Message Meta */}
                              <div className={`flex items-center justify-end space-x-2 mt-1 ${
                                message.sender._id === user.id ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {message.isEdited && (
                                  <span className="text-xs italic">edited</span>
                                )}
                                <span className="text-xs">
                                  {formatMessageTime(message.createdAt)}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Message Actions Menu (only for user's messages that aren't deleted) */}
                        {message.sender._id === user.id && !message.isDeleted && !editingMessage && (
                          <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="relative" ref={menuRef}>
                              <button
                                onClick={() => setShowMenu(showMenu === message._id ? null : message._id)}
                                className="p-1 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                              >
                                <MoreVertical size={12} />
                              </button>

                              {showMenu === message._id && (
                                <div className="absolute right-0 top-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-32">
                                  <button
                                    onClick={() => {
                                      setEditingMessage(message._id);
                                      setShowMenu(null);
                                    }}
                                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  >
                                    <Edit size={14} />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMessage(message._id)}
                                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  >
                                    <Trash2 size={14} />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
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
          
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

// Edit Message Form Component
const EditMessageForm = ({ message, onSave, onCancel }) => {
  const [editContent, setEditContent] = useState(message.content);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editContent.trim() && editContent !== message.content) {
      onSave(message._id, editContent.trim());
    } else {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
        rows={3}
        autoFocus
      />
      <div className="flex items-center justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <CloseIcon size={14} />
        </button>
        <button
          type="submit"
          className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Check size={14} />
        </button>
      </div>
    </form>
  );
};

export default ChatInterface;