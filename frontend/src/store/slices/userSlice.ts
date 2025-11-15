import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserXP, Achievement } from '@/types';
import { gamificationAPI } from '@/services/api';

interface UserState {
  xp: UserXP | null;
  achievements: Achievement[];
  unreadNotifications: number;
}

const initialState: UserState = {
  xp: null,
  achievements: [],
  unreadNotifications: 0,
};

// Async thunk to fetch user XP
export const fetchUserXP = createAsyncThunk(
  'user/fetchUserXP',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gamificationAPI.getUserXP();
      return response.data as UserXP;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user XP');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserXP: (state, action: PayloadAction<UserXP>) => {
      state.xp = action.payload;
    },
    setAchievements: (state, action: PayloadAction<Achievement[]>) => {
      state.achievements = action.payload;
    },
    setUnreadNotifications: (state, action: PayloadAction<number>) => {
      state.unreadNotifications = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUserXP.fulfilled, (state, action) => {
      state.xp = action.payload;
    });
  },
});

export const { setUserXP, setAchievements, setUnreadNotifications } = userSlice.actions;
export default userSlice.reducer;
