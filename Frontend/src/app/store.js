import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/user/userSlice";
import hostModeReducer from "../features/user/hostModeSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    hostMode: hostModeReducer,
  },
});
