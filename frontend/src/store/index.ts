import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import questReducer from './slices/questSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    quests: questReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
