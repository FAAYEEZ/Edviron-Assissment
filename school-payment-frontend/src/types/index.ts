export interface User {
    id: string;
    email: string;
    role: string;
  }
  
  export interface LoginResponse {
    access_token: string;
    user: User;
  }
  
  export interface StudentInfo {
    name: string;
    id: string;
    email: string;
  }
  
  export interface Transaction {
    collect_id: string;
    school_id: string;
    gateway: string;
    gateway_name?: string;
    order_amount: number;
    transaction_amount: number;
    status: 'success' | 'pending' | 'failed' | 'initiated';
    custom_order_id: string;
    student_info: StudentInfo;
    payment_time?: string;
    payment_mode?: string;
    bank_reference?: string;
    payment_message?: string;
    error_message?: string;
    createdAt: string;
  }
  
  export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }
  
  export interface TransactionResponse {
    transactions: Transaction[];
    pagination: PaginationInfo;
  }
  
  export interface CreatePaymentRequest {
    school_id: string;
    trustee_id: string;
    student_info: StudentInfo;
    gateway_name: string;
    amount: number;
    redirect_url?: string;
  }
  
  export interface CreatePaymentResponse {
    order_id: string;
    custom_order_id: string;
    payment_url: string;
    status: string;
    message: string;
  }
  
  export interface TransactionStats {
    statusStats: {
      _id: string;
      count: number;
      totalAmount: number;
    }[];
    totalTransactions: number;
    totalAmount: number;
  }
  
  export interface ApiError {
    message: string;
    statusCode: number;
    error: string;
  }
  