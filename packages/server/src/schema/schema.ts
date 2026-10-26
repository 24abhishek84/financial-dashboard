import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    active: Boolean!
    createdAt: String!
  }

  type Category {
    id: ID!
    name: String!
    description: String
    type: CategoryType!
    color: String!
    userId: ID!
    parentCategoryId: ID
    parentCategory: Category
    subCategories: [Category!]
    keywords: [String!]
  }

  type Transaction {
    id: ID!
    description: String!
    amount: Float!
    transactionDate: String!
    notes: String
    userId: ID!
    categoryId: ID!
    categoryName: String!
    createdAt: String!
    updatedAt: String!
  }

  type DashboardStats {
    totalIncome: Float!
    totalExpense: Float!
    balance: Float!
    transactionCount: Int!
  }

  enum CategoryType {
    INCOME
    EXPENSE
  }

  type AuthPayload {
    token: String!
    id: ID!
    firstName: String!
  }

  type Query {
    me: User
    user(id: ID!): User
    categories: [Category!]!
    transactions: [Transaction!]!
    dashboardStats: DashboardStats!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    register(email: String!, password: String!, firstName: String!, lastName: String!): AuthPayload!
    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!
    createTransaction(input: CreateTransactionInput!): Transaction!
    updateTransaction(id: ID!, input: UpdateTransactionInput!): Transaction!
    deleteTransaction(id: ID!): Boolean!
  }

  input CreateCategoryInput {
    name: String!
    description: String
    type: CategoryType!
    color: String!
    parentCategoryId: ID
    keywords: [String!]
  }

  input UpdateCategoryInput {
    name: String
    description: String
    type: CategoryType
    color: String
    parentCategoryId: ID
    keywords: [String!]
  }

  input CreateTransactionInput {
    description: String!
    amount: Float!
    transactionDate: String!
    notes: String
    categoryId: ID!
  }

  input UpdateTransactionInput {
    description: String
    amount: Float
    transactionDate: String
    notes: String
    categoryId: ID
  }
`;
