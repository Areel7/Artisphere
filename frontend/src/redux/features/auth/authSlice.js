import { createSlice } from "@reduxjs/toolkit";
import secureLocalStorage from "react-secure-storage";

const initialState = {
    userInfo: secureLocalStorage.getItem("userInfo") 
    ? JSON.parse(secureLocalStorage.getItem("userInfo"))
    : null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.userInfo = action.payload;
            secureLocalStorage.setItem("userInfo", JSON.stringify(action.payload));

            const expirationTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
            secureLocalStorage.setItem("expirationTime", expirationTime);
        },

        logOut: (state) => {
            state.userInfo = null;
            secureLocalStorage.clear();
        },
    },
});

export const { setCredentials, logOut } =authSlice.actions;
export default authSlice.reducer;  