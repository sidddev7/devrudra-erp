import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AgentType, AgentTransactions } from "@/typescript/types";

type AgentState = {
  agents: Partial<AgentType>[];
  count: number;
  transactions: Partial<AgentTransactions>;
};

const initialState: AgentState = {
  agents: [],
  count: 0,
  transactions: {},
};

const agentSlice = createSlice({
  name: "agent",
  initialState,
  reducers: {
    setAgents: (state, action: PayloadAction<Partial<AgentType>[]>) => {
      state.agents = action.payload;
    },
    setAgentCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    addAgent: (state, action: PayloadAction<AgentType>) => {
      state.agents.push(action.payload);
      state.count += 1;
    },
    updateAgent: (state, action: PayloadAction<AgentType>) => {
      const index = state.agents.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.agents[index] = action.payload;
      }
    },
    removeAgent: (state, action: PayloadAction<string>) => {
      state.agents = state.agents.filter((a) => a.id !== action.payload);
      state.count -= 1;
    },
    setAgentTransactions: (state, action: PayloadAction<Partial<AgentTransactions>>) => {
      state.transactions = action.payload;
    },
    clearAgents: (state) => {
      state.agents = [];
      state.count = 0;
      state.transactions = {};
    },
  },
});

export const {
  setAgents,
  setAgentCount,
  addAgent,
  updateAgent,
  removeAgent,
  setAgentTransactions,
  clearAgents,
} = agentSlice.actions;

export default agentSlice.reducer;


