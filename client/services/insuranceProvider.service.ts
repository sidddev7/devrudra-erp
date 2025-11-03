import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy as firestoreOrderBy,
  limit as firestoreLimit,
  DocumentData,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/client/utils/firebase/firebase";
import { COLLECTIONS, InsuranceProviderType, QueryParamType } from "@/typescript/types";

export class InsuranceProviderService {
  /**
   * Create a new insurance provider
   */
  static async create(data: Omit<InsuranceProviderType, "id">) {
    try {
      // Check if provider with same name already exists
      const existingProvider = await this.findByName(data.name);
      if (existingProvider) {
        return {
          success: false,
          error: "Insurance provider with this name already exists",
        };
      }

      const timestamp = new Date().toISOString();
      const docRef = await addDoc(
        collection(db, COLLECTIONS.INSURANCE_PROVIDERS),
        {
          ...data,
          name: data.name.toLowerCase().trim(),
          createdAt: timestamp,
          updatedAt: timestamp,
          isDeleted: false,
          isActive: true,
        }
      );

      return {
        success: true,
        id: docRef.id,
        data: { ...data, id: docRef.id },
        message: "Insurance provider created successfully",
      };
    } catch (error: any) {
      console.error("Error creating insurance provider:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update an existing insurance provider
   */
  static async update(id: string, data: Partial<InsuranceProviderType>) {
    try {
      const docRef = doc(db, COLLECTIONS.INSURANCE_PROVIDERS, id);
      const updateData = {
        ...data,
        ...(data.name && { name: data.name.toLowerCase().trim() }),
        updatedAt: new Date().toISOString(),
      };
      delete updateData.id;
      delete updateData.createdAt;

      await updateDoc(docRef, updateData);
      return {
        success: true,
        data: { ...data, id },
        message: "Insurance provider updated successfully",
      };
    } catch (error: any) {
      console.error("Error updating insurance provider:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Soft delete an insurance provider
   */
  static async delete(id: string) {
    try {
      const docRef = doc(db, COLLECTIONS.INSURANCE_PROVIDERS, id);
      await updateDoc(docRef, {
        isDeleted: true,
        updatedAt: new Date().toISOString(),
      });
      return {
        success: true,
        message: "Insurance provider deleted successfully",
      };
    } catch (error: any) {
      console.error("Error deleting insurance provider:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get insurance provider by ID
   */
  static async getById(id: string) {
    try {
      const docRef = doc(db, COLLECTIONS.INSURANCE_PROVIDERS, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && !docSnap.data().isDeleted) {
        return {
          success: true,
          data: { id: docSnap.id, ...docSnap.data() } as InsuranceProviderType,
        };
      } else {
        return { success: false, error: "Insurance provider not found" };
      }
    } catch (error: any) {
      console.error("Error getting insurance provider:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find insurance provider by name
   */
  static async findByName(name: string) {
    try {
      const normalizedName = name.toLowerCase().trim();
      const q = query(
        collection(db, COLLECTIONS.INSURANCE_PROVIDERS),
        where("isDeleted", "==", false),
        where("name", "==", normalizedName)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as InsuranceProviderType;
      }
      return null;
    } catch (error: any) {
      console.error("Error finding insurance provider by name:", error);
      return null;
    }
  }

  /**
   * Get all insurance providers with pagination and search
   */
  static async getAll(params?: QueryParamType) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        orderBy = "name",
        order = "asc",
      } = params || {};

      // Build base query
      const constraints: QueryConstraint[] = [
        where("isDeleted", "==", false),
      ];

      // Add ordering
      constraints.push(firestoreOrderBy(orderBy, order));

      const q = query(
        collection(db, COLLECTIONS.INSURANCE_PROVIDERS),
        ...constraints
      );

      const querySnapshot = await getDocs(q);

      let data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as InsuranceProviderType[];

      // Apply search filter
      if (search && search.trim() !== "") {
        const searchLower = search.toLowerCase().trim();
        data = data.filter(
          (provider) =>
            provider.name?.toLowerCase().includes(searchLower)
        );
      }

      // Calculate pagination
      const totalCount = data.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = data.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedData,
        count: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error: any) {
      console.error("Error getting insurance providers:", error);
      return {
        success: false,
        error: error.message,
        data: [],
        count: 0,
      };
    }
  }

  /**
   * Get all active insurance providers (for dropdowns)
   */
  static async getAllActive() {
    try {
      const q = query(
        collection(db, COLLECTIONS.INSURANCE_PROVIDERS),
        where("isDeleted", "==", false),
        where("isActive", "==", true),
        firestoreOrderBy("name", "asc")
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as InsuranceProviderType[];

      return { success: true, data };
    } catch (error: any) {
      console.error("Error getting active insurance providers:", error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Get provider transactions with date range
   */
  static async getProviderTransactions(
    providerId: string,
    startDate?: string,
    endDate?: string
  ) {
    try {
      const constraints: QueryConstraint[] = [
        where("isDeleted", "==", false),
        where("insuranceProvider", "==", providerId),
      ];

      if (startDate && endDate) {
        constraints.push(where("startDate", ">=", startDate));
        constraints.push(where("startDate", "<=", endDate));
      }

      const q = query(
        collection(db, COLLECTIONS.POLICY_HOLDERS),
        ...constraints,
        firestoreOrderBy("startDate", "desc")
      );

      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calculate totals
      const sum = transactions.reduce(
        (acc, transaction: any) => ({
          ourProfit: acc.ourProfit + (transaction.ourProfit || 0),
          agentCommission: acc.agentCommission + (transaction.agentCommission || 0),
          profitAfterTDS: acc.profitAfterTDS + (transaction.profitAfterTDS || 0),
          tdsAmount: acc.tdsAmount + (transaction.tdsAmount || 0),
          gstAmount: acc.gstAmount + (transaction.gstAmount || 0),
          commission: acc.commission + (transaction.commission || 0),
          grossAmount: acc.grossAmount + (transaction.grossAmount || 0),
          premiumAmount: acc.premiumAmount + (transaction.premiumAmount || 0),
          totalCommission: acc.totalCommission + (transaction.totalCommission || 0),
        }),
        {
          ourProfit: 0,
          agentCommission: 0,
          profitAfterTDS: 0,
          tdsAmount: 0,
          gstAmount: 0,
          commission: 0,
          grossAmount: 0,
          premiumAmount: 0,
          totalCommission: 0,
        }
      );

      return {
        success: true,
        data: {
          filteredTransactions: transactions,
          sum,
        },
      };
    } catch (error: any) {
      console.error("Error getting provider transactions:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Toggle provider active status
   */
  static async toggleActive(id: string, isActive: boolean) {
    try {
      const docRef = doc(db, COLLECTIONS.INSURANCE_PROVIDERS, id);
      await updateDoc(docRef, {
        isActive,
        updatedAt: new Date().toISOString(),
      });
      return {
        success: true,
        message: `Insurance provider ${isActive ? "activated" : "deactivated"} successfully`,
      };
    } catch (error: any) {
      console.error("Error toggling provider status:", error);
      return { success: false, error: error.message };
    }
  }
}

