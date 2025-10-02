import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: { userName:"",email:"",token:"",balance:0},
    reducers: {
        storeUser: (state, action) => { 
            state.userName = action.payload.userName;
            state.email = action.payload.email;
            state.token = action.payload.token;
            state.balance = action.payload.balance;
        },
        clearUser: (state) => {
            state.userName = "";
            state.email = "";
            state.token = "";
            state.balance = 0;
        },
        updateBalance: (state, action) => {
            state.balance = action.payload;
        },
    }
})
export const userAction = userSlice.actions;
export default userSlice;
