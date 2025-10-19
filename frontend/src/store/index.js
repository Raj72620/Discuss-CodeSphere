// frontend/src/store/index.js

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import chatReducer from './slices/chatSlice'; // ADD THIS

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    chat: chatReducer, // ADD THIS
  },
});

export default store;