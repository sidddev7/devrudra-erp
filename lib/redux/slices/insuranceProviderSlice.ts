import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { InsuranceProviderType, InsuranceTransactions } from "@/typescript/types";

type InsuranceProviderState = {
  insuranceProviders: Partial<InsuranceProviderType>[];
  count: number;
  transactions: Partial<InsuranceTransactions>;
};

const initialState: InsuranceProviderState = {
  insuranceProviders: [],
  count: 0,
  transactions: {},
};

const insuranceProviderSlice = createSlice({
  name: "insuranceProvider",
  initialState,
  reducers: {
    setInsuranceProviders: (
      state,
      action: PayloadAction<Partial<InsuranceProviderType>[]>
    ) => {
      state.insuranceProviders = action.payload;
    },
    setInsuranceProviderCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    addInsuranceProvider: (state, action: PayloadAction<InsuranceProviderType>) => {
      state.insuranceProviders.push(action.payload);
      state.count += 1;
    },
    updateInsuranceProvider: (state, action: PayloadAction<InsuranceProviderType>) => {
      const index = state.insuranceProviders.findIndex(
        (i) => i.id === action.payload.id
      );
      if (index !== -1) {
        state.insuranceProviders[index] = action.payload;
      }
    },
    removeInsuranceProvider: (state, action: PayloadAction<string>) => {
      state.insuranceProviders = state.insuranceProviders.filter(
        (i) => i.id !== action.payload
      );
      state.count -= 1;
    },
    setInsuranceTransactions: (
      state,
      action: PayloadAction<Partial<InsuranceTransactions>>
    ) => {
      state.transactions = action.payload;
    },
    clearInsuranceProviders: (state) => {
      state.insuranceProviders = [];
      state.count = 0;
      state.transactions = {};
    },
  },
});

export const {
  setInsuranceProviders,
  setInsuranceProviderCount,
  addInsuranceProvider,
  updateInsuranceProvider,
  removeInsuranceProvider,
  setInsuranceTransactions,
  clearInsuranceProviders,
} = insuranceProviderSlice.actions;

export default insuranceProviderSlice.reducer;


