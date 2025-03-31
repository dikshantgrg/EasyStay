import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isHostMode: localStorage.getItem("isHostMode") === "true" // Retrieve from local storage
};

const hostModeSlice = createSlice({
  name: "hostMode",
  initialState,
  reducers: {
    toggleHostMode: (state) => {
      state.isHostMode = !state.isHostMode;
      localStorage.setItem("isHostMode", state.isHostMode); // Store in local storage
    },
    resetHostMode: (state) => {
      state.isHostMode = false;
      localStorage.removeItem("isHostMode"); // Clear storage on logout
    },
  },
});

export const { toggleHostMode, resetHostMode } = hostModeSlice.actions;
export default hostModeSlice.reducer;
