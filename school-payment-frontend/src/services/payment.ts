import api from './api';
import type { 
  TransactionResponse, 
  CreatePaymentRequest, 
  CreatePaymentResponse,
  Transaction,
  TransactionStats
} from '../types';

export const paymentService = {
  async createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    const response = await api.post<CreatePaymentResponse>('/create-payment', data);
    return response.data;
  },

  async getAllTransactions(params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    status?: string | string[];
    school_id?: string | string[];
    startDate?: string;
    endDate?: string;
    search?: string;
  } = {}): Promise<TransactionResponse> {
    // If a School ID filter is provided, call the dedicated school transactions endpoint
    const schoolValues = Array.isArray(params.school_id)
      ? params.school_id
      : params.school_id
        ? [params.school_id]
        : [];

    if (schoolValues.length > 0) {
      const schoolId = schoolValues[0];
      const response = await api.get(`/transactions/school/${schoolId}`, {
        params: {
          page: params.page,
          limit: params.limit,
        },
      });
      const raw: any = response.data;
      const transactions = raw.transactions || raw.data?.transactions || [];
      const total = raw.total ?? raw.pagination?.total ?? transactions.length;
      const pageVal = raw.page ?? raw.pagination?.page ?? Number(params.page || 1);
      const limitVal = raw.limit ?? raw.pagination?.limit ?? Number(params.limit || 10);
      const totalPagesVal = raw.totalPages ?? raw.pagination?.totalPages ?? Math.max(1, Math.ceil(total / limitVal));
      return {
        transactions,
        pagination: {
          total,
          page: pageVal,
          limit: limitVal,
          totalPages: totalPagesVal,
          hasNext: pageVal < totalPagesVal,
          hasPrev: pageVal > 1,
        },
      } as TransactionResponse;
    }

    // Else, call the generic endpoint with query parameters
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.order) queryParams.append('order', params.order);
    if (params.search) queryParams.append('search', params.search);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    const statusValues = Array.isArray(params.status) ? params.status : params.status ? [params.status] : [];
    statusValues.forEach((s) => queryParams.append('status', s));
    schoolValues.forEach((id) => queryParams.append('school_id', id));

    const response = await api.get(`/transactions?${queryParams.toString()}`);
    const raw: any = response.data;
    let transactions = raw.transactions || raw.data?.transactions || [];

    // Client-side filtering/sorting fallback when backend ignores some params
    // Status filter
    if (statusValues.length > 0) {
      const statusSet = new Set(statusValues.map((s) => String(s).toLowerCase()));
      transactions = transactions.filter((t: any) => statusSet.has(String(t.status || '').toLowerCase()));
    }
    // Search filter
    if (params.search) {
      const q = params.search.toLowerCase();
      transactions = transactions.filter((t: any) => {
        return (
          String(t.custom_order_id || '').toLowerCase().includes(q) ||
          String(t.collect_id || '').toLowerCase().includes(q) ||
          String(t.school_id || '').toLowerCase().includes(q) ||
          String(t?.student_info?.name || '').toLowerCase().includes(q) ||
          String(t?.student_info?.email || '').toLowerCase().includes(q)
        );
      });
    }
    // Date range
    const toDate = (v: any) => (v ? new Date(v).getTime() : 0);
    if (params.startDate) {
      const start = new Date(params.startDate).getTime();
      transactions = transactions.filter((t: any) => {
        const dt = toDate(t.payment_time || t.createdAt);
        return dt >= start;
      });
    }
    if (params.endDate) {
      const end = new Date(params.endDate).getTime();
      transactions = transactions.filter((t: any) => {
        const dt = toDate(t.payment_time || t.createdAt);
        return dt <= end;
      });
    }
    // Sort
    if (params.sortBy) {
      const key = params.sortBy;
      const dir = params.order === 'asc' ? 1 : -1;
      transactions = [...transactions].sort((a: any, b: any) => {
        let av = a[key];
        let bv = b[key];
        if (key === 'createdAt' || key === 'payment_time') {
          av = toDate(a.payment_time || a.createdAt);
          bv = toDate(b.payment_time || b.createdAt);
        }
        if (av == null) return 1;
        if (bv == null) return -1;
        if (av < bv) return -dir;
        if (av > bv) return dir;
        return 0;
      });
    }
    const total = raw.pagination?.total ?? raw.total ?? transactions.length;
    const pageVal = raw.pagination?.page ?? raw.page ?? Number(params.page || 1);
    const limitVal = raw.pagination?.limit ?? raw.limit ?? Number(params.limit || 10);
    const totalPagesVal = raw.pagination?.totalPages ?? raw.totalPages ?? Math.max(1, Math.ceil(total / limitVal));
    const pagination = raw.pagination ?? {
      total,
      page: pageVal,
      limit: limitVal,
      totalPages: totalPagesVal,
      hasNext: pageVal < totalPagesVal,
      hasPrev: pageVal > 1,
    };
    return { transactions, pagination } as TransactionResponse;
  },

  async getTransactionsBySchool(
    schoolId: string, 
    page = 1, 
    limit = 10
  ): Promise<TransactionResponse> {
    const response = await api.get<TransactionResponse>(`/transactions/school/${schoolId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  async getTransactionStatus(customOrderId: string): Promise<Transaction> {
    const response = await api.get<Transaction>(`/transaction-status/${customOrderId}`);
    return response.data;
  },

  async getSchoolIds(): Promise<string[]> {
    const response = await api.get<string[]>('/school-ids');
    return response.data;
  },

  async getTransactionStats(): Promise<TransactionStats> {
    const response = await api.get<TransactionStats>('/stats');
    return response.data;
  },
};