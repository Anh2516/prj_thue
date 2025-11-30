import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  total: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existingItem = state.items.find((i) => i.id === item.id);
      
      if (!existingItem) {
        state.items.push({ ...item, quantity: 1 });
      }
      
      state.total = state.items.reduce((sum, item) => sum + item.price, 0);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.total = state.items.reduce((sum, item) => sum + item.price, 0);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

