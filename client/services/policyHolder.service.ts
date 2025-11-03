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
  orderBy as firestoreOrderBy,
  limit,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/client/utils/firebase/firebase";
import {
  COLLECTIONS,
  PolicyHoldersType,
  QueryParamType,
  AgentType,
  InsuranceProviderType,
  VehicleType,
} from "@/typescript/types";
import dayjs from "dayjs";

/**
 * Dedicated service class for Policy Holder-related operations
 * Provides comprehensive CRUD operations, search, pagination, and status management
 */
export class PolicyHolderService {
  private static collectionName = COLLECTIONS.POLICY_HOLDERS;

  /**
   * Create a new policy holder
   * @param policyData - Policy data to create
   * @param userId - ID of the user creating the policy
   * @returns Result object with success status and created policy data
   */
  static async create(
    policyData: Omit<PolicyHoldersType, "id" | "createdAt" | "updatedAt" | "isDeleted">,
    userId?: string
  ) {
    try {
      const timestamp = new Date().toISOString();

      // Validate policy number uniqueness
      const existingPolicy = await this.getByPolicyNumber(policyData.policyNumber);
      if (existingPolicy) {
        return {
          success: false,
          error: "A policy with this policy number already exists",
        };
      }

      // Determine status based on dates
      const status = this.calculateStatus(policyData.startDate as string, policyData.endDate as string);

      const newPolicy = {
        ...policyData,
        status,
        isDeleted: false,
        createdAt: timestamp,
        updatedAt: timestamp,
        ...(userId && { createdBy: userId, updatedBy: userId }),
      };

      const docRef = await addDoc(collection(db, this.collectionName), newPolicy);

      return {
        success: true,
        data: { id: docRef.id, ...newPolicy } as PolicyHoldersType,
        message: "Policy created successfully",
      };
    } catch (error: any) {
      console.error("Error creating policy:", error);
      return {
        success: false,
        error: error.message || "Failed to create policy",
      };
    }
  }

  /**
   * Update an existing policy holder
   * @param id - ID of the policy to update
   * @param policyData - Updated policy data
   * @param userId - ID of the user updating the policy
   * @returns Result object with success status
   */
  static async update(
    id: string,
    policyData: Partial<PolicyHoldersType>,
    userId?: string
  ) {
    try {
      const docRef = doc(db, this.collectionName, id);

      // Check if policy exists
      const policyDoc = await getDoc(docRef);
      if (!policyDoc.exists() || policyDoc.data()?.isDeleted) {
        return { success: false, error: "Policy not found" };
      }

      // If policy number is being updated, check uniqueness
      if (policyData.policyNumber && policyData.policyNumber !== policyDoc.data()?.policyNumber) {
        const existingPolicy = await this.getByPolicyNumber(policyData.policyNumber);
        if (existingPolicy && existingPolicy.id !== id) {
          return {
            success: false,
            error: "A policy with this policy number already exists",
          };
        }
      }

      // Recalculate status if dates are being updated
      let updateData: any = {
        ...policyData,
        updatedAt: new Date().toISOString(),
        ...(userId && { updatedBy: userId }),
      };

      if (policyData.startDate || policyData.endDate) {
        const currentData = policyDoc.data();
        const startDate = policyData.startDate || currentData.startDate;
        const endDate = policyData.endDate || currentData.endDate;
        updateData.status = this.calculateStatus(startDate, endDate);
      }

      delete updateData.id; // Ensure ID is not updated in Firestore document

      await updateDoc(docRef, updateData);

      return {
        success: true,
        data: { id, ...updateData } as PolicyHoldersType,
        message: "Policy updated successfully",
      };
    } catch (error: any) {
      console.error("Error updating policy:", error);
      return {
        success: false,
        error: error.message || "Failed to update policy",
      };
    }
  }

  /**
   * Soft delete a policy (sets isDeleted to true)
   * @param id - ID of the policy to delete
   * @returns Result object with success status
   */
  static async delete(id: string) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        isDeleted: true,
        updatedAt: new Date().toISOString(),
      });
      return { success: true, message: "Policy deleted successfully" };
    } catch (error: any) {
      console.error("Error deleting policy:", error);
      return {
        success: false,
        error: error.message || "Failed to delete policy",
      };
    }
  }

  /**
   * Get a single policy by ID
   * @param id - ID of the policy to retrieve
   * @returns Result object with success status and policy data
   */
  static async getById(id: string) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && !docSnap.data()?.isDeleted) {
        const policyData = { id: docSnap.id, ...docSnap.data() } as PolicyHoldersType;
        
        // Populate related data
        const populatedPolicy = await this.populatePolicyData(policyData);
        
        return {
          success: true,
          data: populatedPolicy,
        };
      } else {
        return { success: false, error: "Policy not found or is deleted" };
      }
    } catch (error: any) {
      console.error("Error getting policy:", error);
      return {
        success: false,
        error: error.message || "Failed to get policy",
      };
    }
  }

  /**
   * Get all policies with pagination, search, and sorting
   * @param options - Query options (search, page, limit, orderBy, order)
   * @returns Result object with success status, data, and count
   */
  static async getAll(options?: QueryParamType) {
    try {
      const {
        search,
        page = 1,
        limit: limitValue = 10,
        orderBy = "createdAt",
        order = "desc",
      } = options || {};

      const constraints: QueryConstraint[] = [where("isDeleted", "==", false)];

      if (orderBy) {
        constraints.push(firestoreOrderBy(orderBy, order));
      }

      if (limitValue) {
        constraints.push(limit(limitValue * page)); // Fetch enough data for pagination
      }

      const q = query(collection(db, this.collectionName), ...constraints);
      const querySnapshot = await getDocs(q);

      let data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PolicyHoldersType[];

      // Client-side filtering for search
      if (search) {
        const searchTermLower = search.toLowerCase();
        data = data.filter(
          (policy) =>
            policy.policyNumber?.toLowerCase().includes(searchTermLower) ||
            policy.name?.toLowerCase().includes(searchTermLower) ||
            policy.phoneNumber?.toLowerCase().includes(searchTermLower) ||
            policy.email?.toLowerCase().includes(searchTermLower)
        );
      }

      // Manual pagination
      const startIndex = (page - 1) * limitValue;
      const endIndex = startIndex + limitValue;
      const paginatedData = data.slice(startIndex, endIndex);

      // Populate related data
      const populatedData = await Promise.all(
        paginatedData.map((policy) => this.populatePolicyData(policy))
      );

      return {
        success: true,
        data: populatedData,
        count: data.length,
        message: "Policies fetched successfully",
      };
    } catch (error: any) {
      console.error("Error getting policies:", error);
      return {
        success: false,
        error: error.message || "Failed to get policies",
        data: [],
        count: 0,
      };
    }
  }

  /**
   * Get policies by status
   * @param status - Status to filter by (active, expired, expiring-soon)
   * @returns Result object with success status and filtered policies
   */
  static async getByStatus(status: "active" | "expired" | "expiring-soon") {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("isDeleted", "==", false),
        where("status", "==", status)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PolicyHoldersType[];

      const populatedData = await Promise.all(
        data.map((policy) => this.populatePolicyData(policy))
      );

      return { success: true, data: populatedData, count: data.length };
    } catch (error: any) {
      console.error("Error getting policies by status:", error);
      return {
        success: false,
        error: error.message || "Failed to get policies by status",
        data: [],
        count: 0,
      };
    }
  }

  /**
   * Get statistics for policies
   * @returns Object with total, active, expired, and expiring-soon counts
   */
  static async getStatistics() {
    try {
      const [allResult, activeResult, expiredResult, expiringResult] = await Promise.all([
        this.getAll({ limit: 10000 }), // Get all for total count
        this.getByStatus("active"),
        this.getByStatus("expired"),
        this.getByStatus("expiring-soon"),
      ]);

      return {
        success: true,
        data: {
          total: allResult.count || 0,
          active: activeResult.count || 0,
          expired: expiredResult.count || 0,
          expiringSoon: expiringResult.count || 0,
        },
      };
    } catch (error: any) {
      console.error("Error getting policy statistics:", error);
      return {
        success: false,
        error: error.message || "Failed to get statistics",
        data: {
          total: 0,
          active: 0,
          expired: 0,
          expiringSoon: 0,
        },
      };
    }
  }

  /**
   * Get a policy by policy number (for uniqueness validation)
   * @param policyNumber - Policy number to search for
   * @returns Existing policy data or null if not found
   */
  static async getByPolicyNumber(policyNumber: string) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("policyNumber", "==", policyNumber),
        where("isDeleted", "==", false),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as PolicyHoldersType;
      }
      return null;
    } catch (error: any) {
      console.error("Error getting policy by policy number:", error);
      return null;
    }
  }

  /**
   * Calculate policy status based on start and end dates
   * @param startDate - Policy start date
   * @param endDate - Policy end date
   * @returns Status: "active", "expired", or "expiring-soon"
   */
  private static calculateStatus(startDate: string, endDate: string): "active" | "expired" | "expiring-soon" {
    const now = dayjs();
    const end = dayjs(endDate);
    const daysUntilExpiry = end.diff(now, "day");

    if (daysUntilExpiry < 0) {
      return "expired";
    } else if (daysUntilExpiry <= 30) {
      return "expiring-soon";
    } else {
      return "active";
    }
  }

  /**
   * Populate related data (agent, insurance provider, vehicle type) for a policy
   * @param policy - Policy data to populate
   * @returns Policy with populated related data
   */
  private static async populatePolicyData(
    policy: PolicyHoldersType
  ): Promise<PolicyHoldersType> {
    try {
      const [agentDoc, providerDoc, vehicleDoc] = await Promise.all([
        typeof policy.agent === "string"
          ? getDoc(doc(db, COLLECTIONS.AGENTS, policy.agent))
          : Promise.resolve(null),
        typeof policy.insuranceProvider === "string"
          ? getDoc(doc(db, COLLECTIONS.INSURANCE_PROVIDERS, policy.insuranceProvider))
          : Promise.resolve(null),
        typeof policy.vehicleType === "string"
          ? getDoc(doc(db, COLLECTIONS.VEHICLE_CLASSES, policy.vehicleType))
          : Promise.resolve(null),
      ]);

      return {
        ...policy,
        agent:
          agentDoc && agentDoc.exists()
            ? ({ id: agentDoc.id, ...agentDoc.data() } as AgentType)
            : policy.agent,
        insuranceProvider:
          providerDoc && providerDoc.exists()
            ? ({ id: providerDoc.id, ...providerDoc.data() } as InsuranceProviderType)
            : policy.insuranceProvider,
        vehicleType:
          vehicleDoc && vehicleDoc.exists()
            ? ({ id: vehicleDoc.id, ...vehicleDoc.data() } as VehicleType)
            : policy.vehicleType,
      };
    } catch (error) {
      console.error("Error populating policy data:", error);
      return policy;
    }
  }
}

