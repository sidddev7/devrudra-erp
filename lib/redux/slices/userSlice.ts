import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserType } from "@/typescript/types";

type UserState = {
  user: Partial<UserType>;
  saveLoader: boolean;
  userList: UserType[];
  count: number;
};

const initialState: UserState = {
  user: {},
  saveLoader: false,
  userList: [],
  count: 0,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserType>>) => {
      state.user = action.payload;
    },
    setSaveLoader: (state, action: PayloadAction<boolean>) => {
      state.saveLoader = action.payload;
    },
    setUserList: (state, action: PayloadAction<UserType[]>) => {
      state.userList = action.payload;
    },
    setUserCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    addUser: (state, action: PayloadAction<UserType>) => {
      state.userList.push(action.payload);
      state.count += 1;
    },
    updateUser: (state, action: PayloadAction<UserType>) => {
      const index = state.userList.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.userList[index] = action.payload;
      }
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.userList = state.userList.filter((u) => u.id !== action.payload);
      state.count -= 1;
    },
    clearUser: (state) => {
      state.user = {};
      state.userList = [];
      state.count = 0;
    },
  },
});

export const {
  setUser,
  setSaveLoader,
  setUserList,
  setUserCount,
  addUser,
  updateUser,
  removeUser,
  clearUser,
} = userSlice.actions;

export default userSlice.reducer;


