import { configureStore } from '@reduxjs/toolkit';
import jsonDataReducer from './data'; // Adjust the path to where your jsonDataSlice is located

const store = configureStore({
  reducer: {
    jsonData: jsonDataReducer,
  },
  // If you need to customize the middleware, you can do it within configureStore
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable checks if you have large state objects
    }),
});

export default store;
