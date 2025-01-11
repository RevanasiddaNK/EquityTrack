import { createSlice } from '@reduxjs/toolkit';

const stocksSlice = createSlice({
  name: 'stocks',
  initialState: {
    stocks: [],  // Array to store stocks
    loading: false,
    error: null,
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setStocks: (state, action) => {
      state.stocks = action.payload; // Assign the array of stocks to state
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setLoading, setStocks, setError } = stocksSlice.actions;

export default stocksSlice.reducer;
