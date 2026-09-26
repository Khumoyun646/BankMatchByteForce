import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "bankmatch";

function load() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

const saved = load();

const defaultProfile = {
    purpose: "consumer",
    amount: 30_000_000,
    term: 24,
    income: 8_000_000,
    existingPayments: 0,
    age: 28,
    employment: "official",
    history: "good",
    collateral: false,
    downPayment: 30,
    hasReserve: false,
};

const appSlice = createSlice({
    name: "app",
    initialState: {
        quiz: saved.quiz || null, // { correct, total, score, passed, weakTopics, completedAt }
        profile: { ...defaultProfile, ...saved.profile },
        match: null,
    },
    reducers: {
        setQuizResult(state, action) {
            state.quiz = { ...action.payload, completedAt: new Date().toISOString() };
        },
        resetQuiz(state) {
            state.quiz = null;
        },
        updateProfile(state, action) {
            state.profile = { ...state.profile, ...action.payload };
        },
        setMatch(state, action) {
            state.match = action.payload;
        },
    },
});

export function persist(store) {
    store.subscribe(() => {
        const { quiz, profile } = store.getState().app;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ quiz, profile }));
        } catch {
        }
    });
}

export const { setQuizResult, resetQuiz, updateProfile, setMatch } = appSlice.actions;
export default appSlice.reducer;
