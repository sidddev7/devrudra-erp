/**
 * Validation utilities for form data
 * Based on the Joi validation schemas from the old MongoDB app
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate agent data
 * Based on AgentValidationSchema from old app
 */
export const validateAgent = (
  data: any,
  mode: "Add" | "Edit"
): ValidationResult => {
  const errors: Record<string, string> = {};

  // ID validation for Edit mode
  if (mode === "Edit" && !data.id) {
    errors.id = "Agent ID is required for editing";
  }

  // Name validation
  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.name = "Agent name is required";
  }

  // Phone number validation
  if (!data.phoneNumber || typeof data.phoneNumber !== "string" || data.phoneNumber.trim().length === 0) {
    errors.phoneNumber = "Agent phone number is required";
  } else if (!/^[0-9]{10}$/.test(data.phoneNumber.trim())) {
    errors.phoneNumber = "Phone number must be exactly 10 digits";
  }

  // Location validation
  if (!data.location || typeof data.location !== "object") {
    errors.location = "Location information is required";
  } else {
    const dangerousCharsRegex = /[${};<>`]/;
    const dangerousCharsMessage =
      "should not contain symbols like '$', '}', '{', ';', '<', '>', '`'";

    // Address validation (required)
    if (!data.location.address || data.location.address.trim().length === 0) {
      errors["location.address"] = "Agent address is required";
    } else if (dangerousCharsRegex.test(data.location.address)) {
      errors["location.address"] = `Agent address ${dangerousCharsMessage}`;
    }

    // City validation (optional, but check for dangerous chars)
    if (data.location.city && dangerousCharsRegex.test(data.location.city)) {
      errors["location.city"] = `Agent city ${dangerousCharsMessage}`;
    }

    // State validation (optional, but check for dangerous chars)
    if (data.location.state && dangerousCharsRegex.test(data.location.state)) {
      errors["location.state"] = `Agent state ${dangerousCharsMessage}`;
    }
  }

  // Email validation (optional, but must be valid if provided)
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = "Invalid email format";
    }
  }

  // Transactions validation (optional array)
  if (data.transactions && !Array.isArray(data.transactions)) {
    errors.transactions = "Transactions must be an array";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate insurance provider data
 */
export const validateInsuranceProvider = (
  data: any,
  mode: "Add" | "Edit"
): ValidationResult => {
  const errors: Record<string, string> = {};

  if (mode === "Edit" && !data.id) {
    errors.id = "Insurance provider ID is required for editing";
  }

  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.name = "Insurance provider name is required";
  }

  if (data.agentRate === undefined || data.agentRate === null) {
    errors.agentRate = "Agent rate is required";
  } else if (typeof data.agentRate !== "number" || data.agentRate < 0 || data.agentRate > 100) {
    errors.agentRate = "Agent rate must be between 0 and 100";
  }

  if (data.ourRate === undefined || data.ourRate === null) {
    errors.ourRate = "Our rate is required";
  } else if (typeof data.ourRate !== "number" || data.ourRate < 0 || data.ourRate > 100) {
    errors.ourRate = "Our rate must be between 0 and 100";
  }

  if (data.tds === undefined || data.tds === null) {
    errors.tds = "TDS is required";
  } else if (typeof data.tds !== "number" || data.tds < 0 || data.tds > 100) {
    errors.tds = "TDS must be between 0 and 100";
  }

  if (data.gst === undefined || data.gst === null) {
    errors.gst = "GST is required";
  } else if (typeof data.gst !== "number" || data.gst < 0 || data.gst > 100) {
    errors.gst = "GST must be between 0 and 100";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate vehicle class data
 */
export const validateVehicleClass = (
  data: any,
  mode: "Add" | "Edit"
): ValidationResult => {
  const errors: Record<string, string> = {};

  if (mode === "Edit" && !data.id) {
    errors.id = "Vehicle class ID is required for editing";
  }

  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.name = "Vehicle class name is required";
  }

  if (data.commissionRate === undefined || data.commissionRate === null) {
    errors.commissionRate = "Commission rate is required";
  } else if (
    typeof data.commissionRate !== "number" ||
    data.commissionRate < 0 ||
    data.commissionRate > 100
  ) {
    errors.commissionRate = "Commission rate must be between 0 and 100";
  }

  if (data.agentRate === undefined || data.agentRate === null) {
    errors.agentRate = "Agent rate is required";
  } else if (typeof data.agentRate !== "number" || data.agentRate < 0 || data.agentRate > 100) {
    errors.agentRate = "Agent rate must be between 0 and 100";
  }

  if (data.ourRate === undefined || data.ourRate === null) {
    errors.ourRate = "Our rate is required";
  } else if (typeof data.ourRate !== "number" || data.ourRate < 0 || data.ourRate > 100) {
    errors.ourRate = "Our rate must be between 0 and 100";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate user data
 */
export const validateUser = (
  data: any,
  mode: "Add" | "Edit"
): ValidationResult => {
  const errors: Record<string, string> = {};

  if (mode === "Edit" && !data.id) {
    errors.id = "User ID is required for editing";
  }

  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.name = "Name is required";
  }

  if (!data.username || typeof data.username !== "string" || data.username.trim().length === 0) {
    errors.username = "Username is required";
  } else if (data.username.trim().length < 3) {
    errors.username = "Username must be at least 3 characters";
  }

  if (!data.email || typeof data.email !== "string" || data.email.trim().length === 0) {
    errors.email = "Email is required";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = "Invalid email format";
    }
  }

  if (!data.phoneNumber || typeof data.phoneNumber !== "string" || data.phoneNumber.trim().length === 0) {
    errors.phoneNumber = "Phone number is required";
  } else if (!/^[0-9]{10}$/.test(data.phoneNumber.trim())) {
    errors.phoneNumber = "Phone number must be exactly 10 digits";
  }

  if (mode === "Add") {
    if (!data.password || typeof data.password !== "string" || data.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
  }

  if (!data.role || !["admin", "sub-user"].includes(data.role)) {
    errors.role = "Role must be either 'admin' or 'sub-user'";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate policy holder data
 */
export const validatePolicyHolder = (
  data: any,
  mode: "Add" | "Edit"
): ValidationResult => {
  const errors: Record<string, string> = {};

  if (mode === "Edit" && !data.id) {
    errors.id = "Policy ID is required for editing";
  }

  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.name = "Policy holder name is required";
  }

  if (!data.policyNumber || typeof data.policyNumber !== "string" || data.policyNumber.trim().length === 0) {
    errors.policyNumber = "Policy number is required";
  }

  if (!data.startDate) {
    errors.startDate = "Start date is required";
  }

  if (!data.endDate) {
    errors.endDate = "End date is required";
  }

  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (start >= end) {
      errors.endDate = "End date must be after start date";
    }
  }

  if (!data.premiumAmount || data.premiumAmount <= 0) {
    errors.premiumAmount = "Premium amount must be greater than 0";
  }

  if (!data.agent) {
    errors.agent = "Agent is required";
  }

  if (!data.insuranceProvider) {
    errors.insuranceProvider = "Insurance provider is required";
  }

  if (!data.vehicleType) {
    errors.vehicleType = "Vehicle type is required";
  }

  if (data.phoneNumber && !/^[0-9]{10}$/.test(data.phoneNumber.trim())) {
    errors.phoneNumber = "Phone number must be exactly 10 digits";
  }

  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = "Invalid email format";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Sanitize string input by removing dangerous characters
 */
export const sanitizeString = (input: string): string => {
  return input.replace(/[${};<>`]/g, "").trim();
};

/**
 * Validate phone number format
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  return /^[0-9]{10}$/.test(phoneNumber.trim());
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate percentage value (0-100)
 */
export const isValidPercentage = (value: number): boolean => {
  return typeof value === "number" && value >= 0 && value <= 100;
};

/**
 * Check if string contains dangerous characters
 */
export const hasDangerousCharacters = (input: string): boolean => {
  return /[${};<>`]/.test(input);
};

