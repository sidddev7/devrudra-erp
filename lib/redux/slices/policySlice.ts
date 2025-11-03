import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PolicyHoldersType } from "@/typescript/types";

type TotalSum = {
  ourProfit: number;
  agentCommission: number;
  profitAfterTDS: number;
  tdsAmount: number;
  gstAmount: number;
  commission: number;
  grossAmount: number;
  premiumAmount: number;
  totalCommission: number;
};

type PolicyState = {
  policyHolderList: Partial<PolicyHoldersType>[];
  count: number;
  sum: Partial<TotalSum>;
  expiringPolicies: Partial<PolicyHoldersType>[];
};

const initialState: PolicyState = {
  policyHolderList: [],
  count: 0,
  sum: {},
  expiringPolicies: [],
};

const policySlice = createSlice({
  name: "policyHolder",
  initialState,
  reducers: {
    setPolicies: (state, action: PayloadAction<Partial<PolicyHoldersType>[]>) => {
      state.policyHolderList = action.payload;
    },
    setPolicyCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    addPolicy: (state, action: PayloadAction<PolicyHoldersType>) => {
      state.policyHolderList.push(action.payload);
      state.count += 1;
    },
    updatePolicy: (state, action: PayloadAction<PolicyHoldersType>) => {
      const index = state.policyHolderList.findIndex(
        (p) => p.id === action.payload.id
      );
      if (index !== -1) {
        state.policyHolderList[index] = action.payload;
      }
    },
    removePolicy: (state, action: PayloadAction<string>) => {
      state.policyHolderList = state.policyHolderList.filter(
        (p) => p.id !== action.payload
      );
      state.count -= 1;
    },
    setPolicySum: (state, action: PayloadAction<Partial<TotalSum>>) => {
      state.sum = action.payload;
    },
    setExpiringPolicies: (
      state,
      action: PayloadAction<Partial<PolicyHoldersType>[]>
    ) => {
      state.expiringPolicies = action.payload;
    },
    clearPolicies: (state) => {
      state.policyHolderList = [];
      state.count = 0;
      state.sum = {};
      state.expiringPolicies = [];
    },
  },
});

export const {
  setPolicies,
  setPolicyCount,
  addPolicy,
  updatePolicy,
  removePolicy,
  setPolicySum,
  setExpiringPolicies,
  clearPolicies,
} = policySlice.actions;

export default policySlice.reducer;


