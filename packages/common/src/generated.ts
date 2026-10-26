export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  token: Scalars['String']['output'];
};

export type Category = {
  __typename?: 'Category';
  color: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  keywords?: Maybe<Array<Scalars['String']['output']>>;
  name: Scalars['String']['output'];
  parentCategory?: Maybe<Category>;
  parentCategoryId?: Maybe<Scalars['ID']['output']>;
  subCategories?: Maybe<Array<Category>>;
  type: CategoryType;
  userId: Scalars['ID']['output'];
};

export enum CategoryType {
  Expense = 'EXPENSE',
  Income = 'INCOME'
}

export type CreateCategoryInput = {
  color: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  parentCategoryId?: InputMaybe<Scalars['ID']['input']>;
  type: CategoryType;
};

export type CreateTransactionInput = {
  amount: Scalars['Float']['input'];
  categoryId: Scalars['ID']['input'];
  description: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  transactionDate: Scalars['String']['input'];
};

export type DashboardStats = {
  __typename?: 'DashboardStats';
  balance: Scalars['Float']['output'];
  totalExpense: Scalars['Float']['output'];
  totalIncome: Scalars['Float']['output'];
  transactionCount: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createCategory: Category;
  createTransaction: Transaction;
  deleteCategory: Scalars['Boolean']['output'];
  deleteTransaction: Scalars['Boolean']['output'];
  login: AuthPayload;
  register: AuthPayload;
  updateCategory: Category;
  updateTransaction: Transaction;
};


export type MutationCreateCategoryArgs = {
  input: CreateCategoryInput;
};


export type MutationCreateTransactionArgs = {
  input: CreateTransactionInput;
};


export type MutationDeleteCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTransactionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationRegisterArgs = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationUpdateCategoryArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCategoryInput;
};


export type MutationUpdateTransactionArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTransactionInput;
};

export type Query = {
  __typename?: 'Query';
  categories: Array<Category>;
  dashboardStats: DashboardStats;
  me?: Maybe<User>;
  transactions: Array<Transaction>;
  user?: Maybe<User>;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export type Transaction = {
  __typename?: 'Transaction';
  amount: Scalars['Float']['output'];
  categoryId: Scalars['ID']['output'];
  categoryName: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  transactionDate: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export type UpdateCategoryInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  parentCategoryId?: InputMaybe<Scalars['ID']['input']>;
  type?: InputMaybe<CategoryType>;
};

export type UpdateTransactionInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  transactionDate?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  active: Scalars['Boolean']['output'];
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
};
