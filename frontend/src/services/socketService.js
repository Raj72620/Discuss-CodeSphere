// frontend/src/services/socketService.js

import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (!this.socket) {
      // OLD CODE - Commented out
      // this.socket = io('http://localhost:5000', {
      
      const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      this.socket = io(serverUrl, {
        transports: ['websocket']
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnected = false;
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinUser(userId) {
    if (this.socket && userId) {
      this.socket.emit('join-user', userId);
    }
  }

  joinConversation(conversationId) {
    if (this.socket && conversationId) {
      this.socket.emit('join-conversation', conversationId);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket && conversationId) {
      this.socket.emit('leave-conversation', conversationId);
    }
  }

  sendMessage(messageData) {
    if (this.socket) {
      this.socket.emit('send-message', messageData);
    }
  }

  editMessage(updatedMessage) {
    if (this.socket) {
      this.socket.emit('edit-message', updatedMessage);
    }
  }

  deleteMessage(deletedMessage) {
    if (this.socket) {
      this.socket.emit('delete-message', deletedMessage);
    }
  }

  startTyping(data) {
    if (this.socket) {
      this.socket.emit('typing-start', data);
    }
  }

  stopTyping(data) {
    if (this.socket) {
      this.socket.emit('typing-stop', data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();