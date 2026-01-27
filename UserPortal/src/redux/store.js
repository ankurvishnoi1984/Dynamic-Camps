import { configureStore } from "@reduxjs/toolkit";
import permissionReducer from "./slices/permissionSlice";

export const store = configureStore({
  reducer: {
    permissions: permissionReducer
  }
});
