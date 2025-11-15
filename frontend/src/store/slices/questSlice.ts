import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Quest } from '@/types';

interface QuestState {
  quests: Quest[];
  selectedQuest: Quest | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: QuestState = {
  quests: [],
  selectedQuest: null,
  isLoading: false,
  error: null,
};

const questSlice = createSlice({
  name: 'quests',
  initialState,
  reducers: {
    setQuests: (state, action: PayloadAction<Quest[]>) => {
      state.quests = action.payload;
    },
    setSelectedQuest: (state, action: PayloadAction<Quest | null>) => {
      state.selectedQuest = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setQuests, setSelectedQuest, setLoading, setError } = questSlice.actions;
export default questSlice.reducer;
