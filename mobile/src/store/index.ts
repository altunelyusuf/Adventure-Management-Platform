/**
 * Redux Store Configuration
 *
 * Centralized state management for the mobile app
 */

import { configureStore } from '@reduxjs/toolkit';

// Import reducers (to be created)
// import authReducer from './slices/authSlice';
// import questReducer from './slices/questSlice';
// import locationReducer from './slices/locationSlice';

export const store = configureStore({
  reducer: {
    // auth: authReducer,
    // quest: questReducer,
    // location: locationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for non-serializable values
        ignoredActions: ['location/updatePosition'],
        // Ignore these paths in the state
        ignoredPaths: ['location.currentPosition'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
