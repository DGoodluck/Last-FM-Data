import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchJsonData = createAsyncThunk(
  'jsonData/fetchJsonData',
  async (url, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 20000));
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const jsonDataSlice = createSlice({
    name: 'jsonData',
    initialState: {
      data: [],
      status: 'idle',
      error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
      .addCase(fetchJsonData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchJsonData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchJsonData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.error('Fetch failed:', action.payload);
      });
    },
  });
  
export default jsonDataSlice.reducer;
