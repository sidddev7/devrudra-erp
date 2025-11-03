import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  QueryConstraint,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/client/utils/firebase/firebase";
import { COLLECTIONS, AgentType, PolicyHoldersType, QueryParamType } from "@/typescript/types";
import dayjs from "dayjs";

/**
 * Dedicated service class for Agent-related operations
 * Provides comprehensive CRUD operations, search, pagination, and commission calculations
 */
export class AgentService {
  private static collectionName = COLLECTIONS.AGENTS;

  /**
   * Create a new agent
   * @param agentData - Agent data to create
   * @param userId - ID of the user creating the agent
   * @returns Result object with success status and created agent data
   */
  static async createAgent(
    agentData: Omit<AgentType, "id" | "createdAt" | "updatedAt" | "isDeleted">,
    userId?: string
  ) {
    try {
      const timestamp = new Date().toISOString();
      
      // Validate phone number uniqueness
      const existingAgent = await this.getAgentByPhoneNumber(agentData.phoneNumber);
      if (existingAgent) {
        return {
          success: false,
          error: "An agent with this phone number already exists",
        };
      }

      const newAgent = {
        ...agentData,
        isActive: true,
        isDeleted: false,
        createdAt: timestamp,
        updatedAt: timestamp,
        ...(userId && { createdBy: userId, updatedBy: userId }),
      };

      const docRef = await addDoc(collection(db, this.collectionName), newAgent);

      return {
        success: true,
        data: { id: docRef.id, ...newAgent } as AgentType,
        message: "Agent created successfully",
      };
    } catch (error: any) {
      console.error("Error creating agent:", error);
      return {
        success: false,
        error: error.message || "Failed to create agent",
      };
    }
  }

  /**
   * Update an existing agent
   * @param agentId - ID of the agent to update
   * @param agentData - Updated agent data
   * @param userId - ID of the user updating the agent
   * @returns Result object with success status
   */
  static async updateAgent(
    agentId: string,
    agentData: Partial<AgentType>,
    userId?: string
  ) {
    try {
      const docRef = doc(db, this.collectionName, agentId);
      
      // Check if agent exists
      const agentDoc = await getDoc(docRef);
      if (!agentDoc.exists()) {
        return { success: false, error: "Agent not found" };
      }

      // If phone number is being updated, check uniqueness
      if (agentData.phoneNumber) {
        const existingAgent = await this.getAgentByPhoneNumber(agentData.phoneNumber);
        if (existingAgent && existingAgent.id !== agentId) {
          return {
            success: false,
            error: "An agent with this phone number already exists",
          };
        }
      }

      const updateData: any = {
        ...agentData,
        updatedAt: new Date().toISOString(),
        ...(userId && { updatedBy: userId }),
      };

      // Remove fields that shouldn't be updated
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.createdBy;

      await updateDoc(docRef, updateData);

      return {
        success: true,
        data: { id: agentId, ...updateData } as AgentType,
        message: "Agent updated successfully",
      };
    } catch (error: any) {
      console.error("Error updating agent:", error);
      return {
        success: false,
        error: error.message || "Failed to update agent",
      };
    }
  }

  /**
   * Soft delete an agent (mark as deleted)
   * @param agentId - ID of the agent to delete
   * @param userId - ID of the user deleting the agent
   * @returns Result object with success status
   */
  static async deleteAgent(agentId: string, userId?: string) {
    try {
      const docRef = doc(db, this.collectionName, agentId);
      
      await updateDoc(docRef, {
        isDeleted: true,
        updatedAt: new Date().toISOString(),
        ...(userId && { updatedBy: userId }),
      });

      return {
        success: true,
        message: "Agent deleted successfully",
      };
    } catch (error: any) {
      console.error("Error deleting agent:", error);
      return {
        success: false,
        error: error.message || "Failed to delete agent",
      };
    }
  }

  /**
   * Get agent by ID
   * @param agentId - ID of the agent to retrieve
   * @returns Result object with agent data
   */
  static async getAgentById(agentId: string) {
    try {
      const docRef = doc(db, this.collectionName, agentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && !docSnap.data().isDeleted) {
        return {
          success: true,
          data: { id: docSnap.id, ...docSnap.data() } as AgentType,
        };
      } else {
        return { success: false, error: "Agent not found" };
      }
    } catch (error: any) {
      console.error("Error getting agent:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get agent by phone number (for uniqueness validation)
   * @param phoneNumber - Phone number to search for
   * @returns Agent if found, null otherwise
   */
  static async getAgentByPhoneNumber(phoneNumber: string): Promise<AgentType | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("phoneNumber", "==", phoneNumber),
        where("isDeleted", "==", false),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as AgentType;
      }
      
      return null;
    } catch (error) {
      console.error("Error checking phone number:", error);
      return null;
    }
  }

  /**
   * Get all agents with pagination, search, and filtering
   * @param options - Query options including pagination, search, and ordering
   * @returns Result object with agents array and metadata
   */
  static async getAllAgents(options?: QueryParamType & { lastDoc?: any }) {
    try {
      const constraints: QueryConstraint[] = [];

      // Always filter out deleted agents
      constraints.push(where("isDeleted", "==", false));

      // Add search functionality
      if (options?.search) {
        // Note: Firestore doesn't support case-insensitive search natively
        // For production, consider using Algolia or a similar service
        // This is a basic implementation
        constraints.push(orderBy("name"));
      }

      // Add ordering
      const orderByField = options?.orderBy || "createdAt";
      const orderDirection = options?.order || "desc";
      constraints.push(orderBy(orderByField, orderDirection));

      // Add limit
      const limitCount = options?.limit || 10;
      constraints.push(limit(limitCount));

      // Add pagination
      if (options?.lastDoc) {
        constraints.push(startAfter(options.lastDoc));
      }

      const q = query(collection(db, this.collectionName), ...constraints);
      const querySnapshot = await getDocs(q);

      let data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AgentType[];

      // Client-side filtering for search (temporary solution)
      if (options?.search) {
        const searchLower = options.search.toLowerCase();
        data = data.filter((agent) => {
          return (
            agent.name?.toLowerCase().includes(searchLower) ||
            agent.phoneNumber?.toLowerCase().includes(searchLower) ||
            agent.email?.toLowerCase().includes(searchLower) ||
            agent.location?.city?.toLowerCase().includes(searchLower) ||
            agent.location?.state?.toLowerCase().includes(searchLower)
          );
        });
      }

      // Get total count (for pagination)
      const countQuery = query(
        collection(db, this.collectionName),
        where("isDeleted", "==", false)
      );
      const countSnapshot = await getDocs(countQuery);

      return {
        success: true,
        data,
        count: countSnapshot.size,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        message: "Agents retrieved successfully",
      };
    } catch (error: any) {
      console.error("Error getting agents:", error);
      return {
        success: false,
        error: error.message || "Failed to retrieve agents",
        data: [],
        count: 0,
      };
    }
  }

  /**
   * Search agents by name, phone, email, or location
   * @param searchTerm - Search term
   * @returns Result object with matching agents
   */
  static async searchAgents(searchTerm: string) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("isDeleted", "==", false)
      );

      const querySnapshot = await getDocs(q);
      const searchLower = searchTerm.toLowerCase();

      const data = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((agent: any) => {
          return (
            agent.name?.toLowerCase().includes(searchLower) ||
            agent.phoneNumber?.toLowerCase().includes(searchLower) ||
            agent.email?.toLowerCase().includes(searchLower) ||
            agent.location?.city?.toLowerCase().includes(searchLower) ||
            agent.location?.state?.toLowerCase().includes(searchLower)
          );
        }) as AgentType[];

      return {
        success: true,
        data,
        count: data.length,
      };
    } catch (error: any) {
      console.error("Error searching agents:", error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  /**
   * Get all policies for a specific agent
   * @param agentId - ID of the agent
   * @returns Result object with agent's policies
   */
  static async getAgentPolicies(agentId: string) {
    try {
      const q = query(
        collection(db, COLLECTIONS.POLICY_HOLDERS),
        where("agent", "==", agentId),
        where("isDeleted", "==", false),
        orderBy("startDate", "desc")
      );

      const querySnapshot = await getDocs(q);
      const policies = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PolicyHoldersType[];

      return {
        success: true,
        data: policies,
        count: policies.length,
      };
    } catch (error: any) {
      console.error("Error getting agent policies:", error);
      return {
        success: false,
        error: error.message,
        data: [],
        count: 0,
      };
    }
  }

  /**
   * Get agent transactions (policies) with date filtering and calculations
   * Similar to the old app's getTransactions function
   * @param agentId - ID of the agent
   * @param startDate - Start date for filtering
   * @param endDate - End date for filtering (defaults to today)
   * @returns Result object with filtered transactions and calculated totals
   */
  static async getAgentTransactions(
    agentId: string,
    startDate: string,
    endDate?: string
  ) {
    try {
      // Validate agent exists
      const agentResult = await this.getAgentById(agentId);
      if (!agentResult.success) {
        return { success: false, error: "Agent not found" };
      }

      const agent = agentResult.data;

      // Parse dates
      const filterStartDate = dayjs(startDate).isValid()
        ? dayjs(startDate).toDate()
        : null;
      const filterEndDate = endDate && dayjs(endDate).isValid()
        ? dayjs(endDate).toDate()
        : new Date();

      if (!filterStartDate) {
        return { success: false, error: "Invalid start date" };
      }

      if (filterStartDate > filterEndDate) {
        return { success: false, error: "Start date cannot be after end date" };
      }

      // Get all policies for this agent
      const policiesResult = await this.getAgentPolicies(agentId);
      if (!policiesResult.success) {
        return policiesResult;
      }

      // Filter policies by date range
      const filteredPolicies = policiesResult.data!.filter((policy) => {
        const policyDate = new Date(policy.startDate as string);
        return policyDate >= filterStartDate && policyDate <= filterEndDate;
      });

      // Calculate commission summaries using the formulas from the old app
      const summary = filteredPolicies.reduce(
        (acc, policy) => {
          const premiumAmount = policy.premiumAmount || 0;
          const totalCommission = policy.totalCommission || 0;
          const tdsRate = policy.tdsRate || 0;
          const agentRate = policy.agentRate || 0;

          // Commission = (Premium * TotalCommissionRate) / 100
          const commission = (premiumAmount * totalCommission) / 100;

          // TDS Amount = Commission * (TDS Rate / 100)
          const tdsAmount = commission * (tdsRate / 100);

          // Profit After TDS = Commission - TDS Amount
          const profitAfterTDS = commission - tdsAmount;

          // Agent Commission = (Premium * Agent Rate) / 100
          const agentCommission = (premiumAmount * agentRate) / 100;

          // Our Profit = Profit After TDS - Agent Commission
          const ourProfit = profitAfterTDS - agentCommission;

          acc.premiumAmount += premiumAmount;
          acc.totalCommission += commission;
          acc.tdsAmount += tdsAmount;
          acc.profitAfterTDS += profitAfterTDS;
          acc.agentCommission += agentCommission;
          acc.ourProfit += ourProfit;
          acc.grossAmount += policy.grossAmount || 0;

          return acc;
        },
        {
          ourProfit: 0,
          agentCommission: 0,
          profitAfterTDS: 0,
          tdsAmount: 0,
          commission: 0,
          grossAmount: 0,
          premiumAmount: 0,
          totalCommission: 0,
        }
      );

      return {
        success: true,
        data: {
          agent,
          filteredTransactions: filteredPolicies,
          sum: summary,
        },
      };
    } catch (error: any) {
      console.error("Error getting agent transactions:", error);
      return {
        success: false,
        error: error.message || "Failed to retrieve agent transactions",
      };
    }
  }

  /**
   * Get agent commission summary
   * @param agentId - ID of the agent
   * @returns Result object with commission summary
   */
  static async getAgentCommissionSummary(agentId: string) {
    try {
      const policiesResult = await this.getAgentPolicies(agentId);
      
      if (!policiesResult.success) {
        return policiesResult;
      }

      const policies = policiesResult.data!;
      
      const totalCommission = policies.reduce(
        (sum, policy) => sum + (policy.agentCommission || 0),
        0
      );
      
      const totalPremium = policies.reduce(
        (sum, policy) => sum + (policy.premiumAmount || 0),
        0
      );

      return {
        success: true,
        data: {
          agentId,
          totalCommission,
          totalPolicies: policies.length,
          totalPremium,
          averageCommission: policies.length > 0 ? totalCommission / policies.length : 0,
          policies,
        },
      };
    } catch (error: any) {
      console.error("Error calculating agent commissions:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Toggle agent active status
   * @param agentId - ID of the agent
   * @param isActive - New active status
   * @param userId - ID of the user making the change
   * @returns Result object with success status
   */
  static async toggleAgentStatus(
    agentId: string,
    isActive: boolean,
    userId?: string
  ) {
    try {
      const docRef = doc(db, this.collectionName, agentId);
      
      await updateDoc(docRef, {
        isActive,
        updatedAt: new Date().toISOString(),
        ...(userId && { updatedBy: userId }),
      });

      return {
        success: true,
        message: `Agent ${isActive ? "activated" : "deactivated"} successfully`,
      };
    } catch (error: any) {
      console.error("Error toggling agent status:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get active agents count
   * @returns Result object with count
   */
  static async getActiveAgentsCount() {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("isDeleted", "==", false),
        where("isActive", "==", true)
      );

      const querySnapshot = await getDocs(q);

      return {
        success: true,
        count: querySnapshot.size,
      };
    } catch (error: any) {
      console.error("Error getting active agents count:", error);
      return {
        success: false,
        error: error.message,
        count: 0,
      };
    }
  }

  /**
   * Validate agent data before create/update
   * @param agentData - Agent data to validate
   * @returns Validation result
   */
  static validateAgentData(agentData: Partial<AgentType>) {
    const errors: string[] = [];

    if (!agentData.name || agentData.name.trim().length === 0) {
      errors.push("Agent name is required");
    }

    if (!agentData.phoneNumber || agentData.phoneNumber.trim().length === 0) {
      errors.push("Phone number is required");
    } else if (!/^[0-9]{10}$/.test(agentData.phoneNumber)) {
      errors.push("Phone number must be 10 digits");
    }

    if (agentData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(agentData.email)) {
      errors.push("Invalid email format");
    }

    if (!agentData.location?.address || agentData.location.address.trim().length === 0) {
      errors.push("Address is required");
    }

    // Check for dangerous characters
    const dangerousChars = /[${};<>`]/;
    if (agentData.location?.address && dangerousChars.test(agentData.location.address)) {
      errors.push("Address contains invalid characters");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

