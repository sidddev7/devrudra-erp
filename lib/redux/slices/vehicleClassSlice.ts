import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { VehicleType } from "@/typescript/types";

type VehicleClassState = {
  vehicleClasses: Partial<VehicleType>[];
  count: number;
};

const initialState: VehicleClassState = {
  vehicleClasses: [],
  count: 0,
};

const vehicleClassSlice = createSlice({
  name: "vehicleClass",
  initialState,
  reducers: {
    setVehicleClasses: (state, action: PayloadAction<Partial<VehicleType>[]>) => {
      state.vehicleClasses = action.payload;
    },
    setVehicleClassCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    addVehicleClass: (state, action: PayloadAction<VehicleType>) => {
      state.vehicleClasses.push(action.payload);
      state.count += 1;
    },
    updateVehicleClass: (state, action: PayloadAction<VehicleType>) => {
      const index = state.vehicleClasses.findIndex(
        (v) => v.id === action.payload.id
      );
      if (index !== -1) {
        state.vehicleClasses[index] = action.payload;
      }
    },
    removeVehicleClass: (state, action: PayloadAction<string>) => {
      state.vehicleClasses = state.vehicleClasses.filter(
        (v) => v.id !== action.payload
      );
      state.count -= 1;
    },
    clearVehicleClasses: (state) => {
      state.vehicleClasses = [];
      state.count = 0;
    },
  },
});

export const {
  setVehicleClasses,
  setVehicleClassCount,
  addVehicleClass,
  updateVehicleClass,
  removeVehicleClass,
  clearVehicleClasses,
} = vehicleClassSlice.actions;

export default vehicleClassSlice.reducer;


