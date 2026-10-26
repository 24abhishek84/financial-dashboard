import { BaseDataSource } from './BaseDataSource';
import { Category, CreateCategoryInput } from '@financial-dashboard/common';

export class CategoryDataSource extends BaseDataSource {
  constructor() {
    super(process.env.SERVICE_URL || 'http://localhost:8080/api');
  }

  async getCategories(): Promise<Category[]> {
    return this.get<Category[]>('/categories');
  }

  async getCategory(id: string): Promise<Category> {
    return this.get<Category>(`/categories/${id}`);
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    return this.post<Category>('/categories', input);
  }

  async updateCategory(
    id: string,
    input: Partial<CreateCategoryInput>,
  ): Promise<Category> {
    return this.patch<Category>(`/categories/${id}`, input);
  }

  async deleteCategory(id: string): Promise<boolean> {
    await this.delete(`/categories/${id}`);
    return true;
  }

  async getCategoriesByUser(userId: string): Promise<Category[]> {
    return this.get<Category[]>(`/categories?userId=${userId}`);
  }
}
