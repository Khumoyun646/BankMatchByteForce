import { configureStore } from "@reduxjs/toolkit";
import appReducer, { persist } from "../redux/AppSlice";

export const store = configureStore({
    reducer: {
        app: appReducer,
    },
});

persist(store);
