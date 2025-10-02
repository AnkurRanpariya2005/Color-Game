import { createSlice } from "@reduxjs/toolkit";

const eventSlice = createSlice({
  name: "event",
  initialState: { Event: null },
  reducers: {
    StorageEvent: (state, action) => {
      state.Event = action.payload;
    },
    clearEvent: (state) => {
      state.Event = null;
    },
    setStatus: (state, action) => {
      if (state.Event) {
        state.Event.status = action.payload;
      }
    },
  },
});

export const eventAction = eventSlice.actions;
export default eventSlice;
