// frontend/src/components/UI/MessageIndicator.jsx

import React from 'react';
import { MessageCircle } from 'lucide-react';

const MessageIndicator = ({ count, isActive = false }) => {
  if (!count || count === 0) return null;

  return (
    <div className="relative">
      <MessageCircle 
        size={16} 
        className={isActive ? "text-blue-600" : "text-gray-400"} 
      />
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
        {count > 9 ? '9+' : count}
      </span>
    </div>
  );
};

export default MessageIndicator;