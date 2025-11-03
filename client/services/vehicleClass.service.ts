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
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/client/utils/firebase/firebase";
import { COLLECTIONS, VehicleType, QueryParamType } from "@/typescript/types";

/**
 * Dedicated service class for Vehicle Class-related operations
 * Provides comprehensive CRUD operations, search, pagination, and commission calculations
 */
export class VehicleClassService {
  private static collectionName = COLLECTIONS.VEHICLE_CLASSES;

  /**
   * Create a new vehicle class
   * @param vehicleData - Vehicle class data to create
   * @param userId - ID of the user creating the vehicle class
   * @returns Result object with success status and created vehicle class data
   */
  static async createVehicleClass(
    vehicleData: Omit<VehicleType, "id" | "createdAt" | "updatedAt" | "isDeleted">,
    userId?: string
  ) {
    try {
      const timestamp = new Date().toISOString();
      
      // Validate name uniqueness
      const existingVehicleClass = await this.findByName(vehicleData.name);
      if (existingVehicleClass) {
        return {
          success: false,
          error: "A vehicle class with this name already exists",
        };
      }

      const newVehicleClass = {
        ...vehicleData,
        name: vehicleData.name.toLowerCase().trim(),
        isActive: true,
        isDeleted: false,
        createdAt: timestamp,
        updatedAt: timestamp,
        ...(userId && { createdBy: userId, updatedBy: userId }),
      };

      const docRef = await addDoc(collection(db, this.collectionName), newVehicleClass);

      return {
        success: true,
        data: { id: docRef.id, ...newVehicleClass } as VehicleType,
        message: "Vehicle class created successfully",
      };
    } catch (error: any) {
      console.error("Error creating vehicle class:", error);
      return {
        success: false,
        error: error.message || "Failed to create vehicle class",
      };
    }
  }

  /**
   * Update an existing vehicle class
   * @param vehicleClassId - ID of the vehicle class to update
   * @param vehicleData - Updated vehicle class data
   * @param userId - ID of the user updating the vehicle class
   * @returns Result object with success status
   */
  static async updateVehicleClass(
    vehicleClassId: string,
    vehicleData: Partial<VehicleType>,
    userId?: string
  ) {
    try {
      const docRef = doc(db, this.collectionName, vehicleClassId);
      
      // Check if vehicle class exists
      const vehicleDoc = await getDoc(docRef);
      if (!vehicleDoc.exists()) {
        return { success: false, error: "Vehicle class not found" };
      }

      // If name is being updated, check uniqueness
      if (vehicleData.name) {
        const existingVehicleClass = await this.findByName(vehicleData.name);
        if (existingVehicleClass && existingVehicleClass.id !== vehicleClassId) {
          return {
            success: false,
            error: "A vehicle class with this name already exists",
          };
        }
      }

      const updateData: any = {
        ...vehicleData,
        ...(vehicleData.name && { name: vehicleData.name.toLowerCase().trim() }),
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
        data: { ...vehicleData, id: vehicleClassId },
        message: "Vehicle class updated successfully",
      };
    } catch (error: any) {
      console.error("Error updating vehicle class:", error);
      return {
        success: false,
        error: error.message || "Failed to update vehicle class",
      };
    }
  }

  /**
   * Soft delete a vehicle class
   * @param vehicleClassId - ID of the vehicle class to delete
   * @param userId - ID of the user deleting the vehicle class
   * @returns Result object with success status
   */
  static async deleteVehicleClass(vehicleClassId: string, userId?: string) {
    try {
      const docRef = doc(db, this.collectionName, vehicleClassId);
      await updateDoc(docRef, {
        isDeleted: true,
        updatedAt: new Date().toISOString(),
        ...(userId && { updatedBy: userId }),
      });

      return {
        success: true,
        message: "Vehicle class deleted successfully",
      };
    } catch (error: any) {
      console.error("Error deleting vehicle class:", error);
      return {
        success: false,
        error: error.message || "Failed to delete vehicle class",
      };
    }
  }

  /**
   * Get vehicle class by ID
   * @param vehicleClassId - ID of the vehicle class to retrieve
   * @returns Result object with vehicle class data
   */
  static async getVehicleClassById(vehicleClassId: string) {
    try {
      const docRef = doc(db, this.collectionName, vehicleClassId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && !docSnap.data().isDeleted) {
        return {
          success: true,
          data: { id: docSnap.id, ...docSnap.data() } as VehicleType,
        };
      } else {
        return { success: false, error: "Vehicle class not found" };
      }
    } catch (error: any) {
      console.error("Error getting vehicle class:", error);
      return {
        success: false,
        error: error.message || "Failed to get vehicle class",
      };
    }
  }

  /**
   * Find vehicle class by name
   * @param name - Name to search for
   * @returns Vehicle class if found, null otherwise
   */
  static async findByName(name: string) {
    try {
      const normalizedName = name.toLowerCase().trim();
      const q = query(
        collection(db, this.collectionName),
        where("isDeleted", "==", false),
        where("name", "==", normalizedName)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as VehicleType;
      }
      return null;
    } catch (error: any) {
      console.error("Error finding vehicle class by name:", error);
      return null;
    }
  }

  /**
   * Get all vehicle classes with pagination and search
   * @param params - Query parameters (page, limit, search, orderBy, order)
   * @returns Result object with vehicle classes array and count
   */
  static async getAllVehicleClasses(params?: QueryParamType) {
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
        collection(db, this.collectionName),
        ...constraints
      );

      const querySnapshot = await getDocs(q);

      let data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VehicleType[];

      // Apply search filter
      if (search && search.trim() !== "") {
        const searchLower = search.toLowerCase().trim();
        data = data.filter(
          (vehicleClass) =>
            vehicleClass.name?.toLowerCase().includes(searchLower)
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
      console.error("Error getting vehicle classes:", error);
      return {
        success: false,
        error: error.message || "Failed to get vehicle classes",
        data: [],
        count: 0,
      };
    }
  }

  /**
   * Get all active vehicle classes (for dropdowns)
   * @returns Result object with active vehicle classes
   */
  static async getAllActiveVehicleClasses() {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("isDeleted", "==", false),
        where("isActive", "==", true),
        firestoreOrderBy("name", "asc")
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VehicleType[];

      return { success: true, data };
    } catch (error: any) {
      console.error("Error getting active vehicle classes:", error);
      return {
        success: false,
        error: error.message || "Failed to get active vehicle classes",
        data: [],
      };
    }
  }

  /**
   * Get count of active vehicle classes
   * @returns Result object with count
   */
  static async getActiveVehicleClassesCount() {
    try {
      const result = await this.getAllActiveVehicleClasses();
      return {
        success: true,
        count: result.data?.length || 0,
      };
    } catch (error: any) {
      console.error("Error getting active vehicle classes count:", error);
      return { success: false, count: 0 };
    }
  }

  /**
   * Get vehicle class transactions with date range
   * @param vehicleClassId - ID of the vehicle class
   * @param startDate - Start date for filtering
   * @param endDate - End date for filtering
   * @returns Result object with transactions and sum
   */
  static async getVehicleClassTransactions(
    vehicleClassId: string,
    startDate?: string,
    endDate?: string
  ) {
    try {
      const constraints: QueryConstraint[] = [
        where("isDeleted", "==", false),
        where("vehicleType", "==", vehicleClassId),
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
      console.error("Error getting vehicle class transactions:", error);
      return {
        success: false,
        error: error.message || "Failed to get vehicle class transactions",
      };
    }
  }

  /**
   * Toggle vehicle class active status
   * @param vehicleClassId - ID of the vehicle class
   * @param isActive - New active status
   * @param userId - ID of the user making the change
   * @returns Result object with success status
   */
  static async toggleActive(
    vehicleClassId: string,
    isActive: boolean,
    userId?: string
  ) {
    try {
      const docRef = doc(db, this.collectionName, vehicleClassId);
      await updateDoc(docRef, {
        isActive,
        updatedAt: new Date().toISOString(),
        ...(userId && { updatedBy: userId }),
      });

      return {
        success: true,
        message: `Vehicle class ${isActive ? "activated" : "deactivated"} successfully`,
      };
    } catch (error: any) {
      console.error("Error toggling vehicle class status:", error);
      return {
        success: false,
        error: error.message || "Failed to toggle vehicle class status",
      };
    }
  }
}

