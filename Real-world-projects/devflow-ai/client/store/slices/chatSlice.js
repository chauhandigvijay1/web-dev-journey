import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: [],
    activeChat: null,
    streamText: "",
  },
  reducers: {
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    setStreamText: (state, action) => {
      state.streamText = action.payload;
    },
  },
});

export const { setChats, setActiveChat, setStreamText } = chatSlice.actions;
export default chatSlice.reducer;
