import { combineReducers } from "redux";
import userSlice from "./userSlice";
import agentSlice from "./agentSlice";
import insuranceProviderSlice from "./insuranceProviderSlice";
import policySlice from "./policySlice";
import vehicleClassSlice from "./vehicleClassSlice";
import { USER, AGENT, INSURANCE_PROVIDER, POLICY_HOLDER, VEHICLE_CLASS } from "../constants";

export default combineReducers({
  [USER]: userSlice,
  [AGENT]: agentSlice,
  [INSURANCE_PROVIDER]: insuranceProviderSlice,
  [POLICY_HOLDER]: policySlice,
  [VEHICLE_CLASS]: vehicleClassSlice,
});


