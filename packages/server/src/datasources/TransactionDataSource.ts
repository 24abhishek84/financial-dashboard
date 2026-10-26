import { BaseDataSource } from './BaseDataSource';
import { Transaction, DashboardStats, CreateTransactionInput } from '@financial-dashboard/common';

export class TransactionDataSource extends BaseDataSource {
  constructor() {
    super(process.env.SERVICE_URL || 'http://localhost:8080/api');
  }

  async getTransactions(): Promise<Transaction[]> {
    return this.get<Transaction[]>('/transactions');
  }

  async getTransaction(id: string): Promise<Transaction> {
    return this.get<Transaction>(`/transactions/${id}`);
  }

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    return this.post<Transaction>('/transactions', input);
  }

  async updateTransaction(
    id: string,
    input: Partial<CreateTransactionInput>,
  ): Promise<Transaction> {
    return this.patch<Transaction>(`/transactions/${id}`, input);
  }

  async deleteTransaction(id: string): Promise<boolean> {
    await this.delete(`/transactions/${id}`);
    return true;
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return this.get<Transaction[]>(`/transactions?userId=${userId}`);
  }

  async getDashboardStats(userId: string): Promise<DashboardStats> {
    return this.get<DashboardStats>(`/transactions/stats?userId=${userId}`);
  }

  async getTransactionsByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<Transaction[]> {
    return this.get<Transaction[]>(
      `/transactions?userId=${userId}&startDate=${startDate}&endDate=${endDate}`,
    );
  }

  async getTransactionsByCategory(categoryId: string): Promise<Transaction[]> {
    return this.get<Transaction[]>(`/transactions?categoryId=${categoryId}`);
  }
}
