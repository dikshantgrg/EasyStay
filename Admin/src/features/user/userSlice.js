import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null, // Holds the user information (if logged in)
  isAuthenticated: false, // Tracks whether the user is logged in
  error: null, // Holds any login/signup errors
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action)=>{
      state.user = action.payload;
      state.isAuthenticated = true
    },
    signUp: (state, action) => {
      const { Email, password } = action.payload;
      state.user = { email, password };
      state.error = null;
    },
    login: (state, action) => {
      const user = action.payload;
      if (user) {
        state.user = user;
        state.isAuthenticated = true;
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token")
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { signUp, login, logout, setError, setUser } = userSlice.actions;
export default userSlice.reducer;
