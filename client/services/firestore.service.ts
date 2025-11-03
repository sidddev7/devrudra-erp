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
  DocumentData,
  QueryConstraint,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/client/utils/firebase/firebase";
import { COLLECTIONS } from "@/typescript/types";

export class FirestoreService {
  // Generic CRUD Operations
  
  static async create(collectionName: string, data: any) {
    try {
      const timestamp = new Date().toISOString();
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
        isDeleted: false,
      });
      return { success: true, id: docRef.id, data: { ...data, id: docRef.id } };
    } catch (error: any) {
      console.error("Error creating document:", error);
      return { success: false, error: error.message };
    }
  }

  static async update(collectionName: string, id: string, data: any) {
    try {
      const docRef = doc(db, collectionName, id);
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      delete updateData.id; // Remove id from update data
      await updateDoc(docRef, updateData);
      return { success: true, data: { ...data, id } };
    } catch (error: any) {
      console.error("Error updating document:", error);
      return { success: false, error: error.message };
    }
  }

  static async delete(collectionName: string, id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        isDeleted: true,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting document:", error);
      return { success: false, error: error.message };
    }
  }

  static async hardDelete(collectionName: string, id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error: any) {
      console.error("Error hard deleting document:", error);
      return { success: false, error: error.message };
    }
  }

  static async getById(collectionName: string, id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          success: true,
          data: { id: docSnap.id, ...docSnap.data() },
        };
      } else {
        return { success: false, error: "Document not found" };
      }
    } catch (error: any) {
      console.error("Error getting document:", error);
      return { success: false, error: error.message };
    }
  }

  static async getAll(
    collectionName: string,
    options?: {
      whereClause?: Array<{ field: string; operator: any; value: any }>;
      orderByField?: string;
      orderDirection?: "asc" | "desc";
      limitCount?: number;
      lastDoc?: any;
    }
  ) {
    try {
      const constraints: QueryConstraint[] = [];

      // Always filter out deleted documents
      constraints.push(where("isDeleted", "==", false));

      // Add custom where clauses
      if (options?.whereClause) {
        options.whereClause.forEach((clause) => {
          constraints.push(where(clause.field, clause.operator, clause.value));
        });
      }

      // Add ordering
      if (options?.orderByField) {
        constraints.push(
          orderBy(options.orderByField, options.orderDirection || "desc")
        );
      }

      // Add limit
      if (options?.limitCount) {
        constraints.push(limit(options.limitCount));
      }

      // Add pagination
      if (options?.lastDoc) {
        constraints.push(startAfter(options.lastDoc));
      }

      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);

      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        success: true,
        data,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        count: querySnapshot.size,
      };
    } catch (error: any) {
      console.error("Error getting documents:", error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Search functionality
  static async search(
    collectionName: string,
    searchField: string,
    searchTerm: string
  ) {
    try {
      const q = query(
        collection(db, collectionName),
        where("isDeleted", "==", false),
        orderBy(searchField)
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((item: any) =>
          item[searchField]?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      return { success: true, data };
    } catch (error: any) {
      console.error("Error searching documents:", error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Get expiring policies (within 30 days)
  static async getExpiringPolicies(daysThreshold: number = 30) {
    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + daysThreshold);

      const q = query(
        collection(db, COLLECTIONS.POLICY_HOLDERS),
        where("isDeleted", "==", false),
        orderBy("endDate", "asc")
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((policy: any) => {
          const endDate = new Date(policy.endDate);
          return endDate >= today && endDate <= futureDate;
        });

      return { success: true, data };
    } catch (error: any) {
      console.error("Error getting expiring policies:", error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Get policies by agent
  static async getPoliciesByAgent(agentId: string) {
    try {
      const result = await this.getAll(COLLECTIONS.POLICY_HOLDERS, {
        whereClause: [{ field: "agent", operator: "==", value: agentId }],
        orderByField: "createdAt",
        orderDirection: "desc",
      });
      return result;
    } catch (error: any) {
      console.error("Error getting policies by agent:", error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Calculate agent commissions
  static async getAgentCommissions(agentId: string) {
    try {
      const policiesResult = await this.getPoliciesByAgent(agentId);
      
      if (!policiesResult.success) {
        return policiesResult;
      }

      const policies = policiesResult.data || [];
      const totalCommission = policies.reduce(
        (sum: number, policy: any) => sum + (policy.agentCommission || 0),
        0
      );
      const totalPolicies = policies.length;

      return {
        success: true,
        data: {
          agentId,
          totalCommission,
          totalPolicies,
          policies,
        },
      };
    } catch (error: any) {
      console.error("Error calculating agent commissions:", error);
      return { success: false, error: error.message };
    }
  }
}

