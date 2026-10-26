import { DataSources } from '../datasources';

export interface ResolverContext {
  dataSources: DataSources;
  token?: string;
  userId?: string;
}

export const resolvers = {
  Query: {
    me: async (_: any, __: any, { dataSources, token, userId }: ResolverContext) => {
      console.log('[Resolver] Query.me called');
      if (!token || !userId) throw new Error('Not authenticated');
      dataSources.userAPI.setContext(token, userId);
      const result = await dataSources.userAPI.getCurrentUser();
      console.log('[Resolver] Query.me result:', result);
      return result;
    },

    user: async (_: any, { id }: { id: string }, { dataSources, token, userId }: ResolverContext) => {
      console.log('[Resolver] Query.user called with id:', id);
      if (token && userId) {
        dataSources.userAPI.setContext(token, userId);
      }
      const result = await dataSources.userAPI.getUser(id);
      console.log('[Resolver] Query.user result:', result);
      return result;
    },

    categories: async (_: any, __: any, { dataSources, token, userId }: ResolverContext) => {
      console.log('[Resolver] Query.categories called for userId:', userId);
      if (!token || !userId) throw new Error('Not authenticated');
      dataSources.categoryAPI.setContext(token, userId);
      const result = await dataSources.categoryAPI.getCategoriesByUser(userId);
      console.log('[Resolver] Query.categories result:', result);
      return result;
    },

    transactions: async (_: any, __: any, { dataSources, token, userId }: ResolverContext) => {
      console.log('[Resolver] Query.transactions called for userId:', userId);
      if (!token || !userId) throw new Error('Not authenticated');
      dataSources.transactionAPI.setContext(token, userId);
      const result = await dataSources.transactionAPI.getTransactionsByUser(userId);
      console.log('[Resolver] Query.transactions result:', result);
      return result;
    },

    dashboardStats: async (_: any, __: any, { dataSources, token, userId }: ResolverContext) => {
      console.log('[Resolver] Query.dashboardStats called for userId:', userId);
      if (!token || !userId) throw new Error('Not authenticated');
      dataSources.transactionAPI.setContext(token, userId);
      const result = await dataSources.transactionAPI.getDashboardStats(userId);
      console.log('[Resolver] Query.dashboardStats result:', result);
      return result;
    },
  },

  Mutation: {
    login: async (
      _: any,
      { email, password }: { email: string; password: string },
      { dataSources }: ResolverContext,
    ) => {
      console.log('[Resolver] Mutation.login called with email:', email);
      try {
        const payload = await dataSources.userAPI.login(email, password);
        dataSources.userAPI.setContext(payload.token, payload.id);
        console.log('[Resolver] Mutation.login success:', { userId: payload.id });
        return payload;
      } catch (error) {
        console.error('[Resolver] Mutation.login failed:', error);
        throw error;
      }
    },

    register: async (
      _: any,
      {
        email,
        password,
        firstName,
        lastName,
      }: { email: string; password: string; firstName: string; lastName: string },
      { dataSources }: ResolverContext,
    ) => {
      console.log('[Resolver] Mutation.register called with email:', email, 'firstName:', firstName, 'lastName:', lastName);
      try {
        const payload = await dataSources.userAPI.register(email, password, firstName, lastName);
        dataSources.userAPI.setContext(payload.token, payload.id);
        console.log('[Resolver] Mutation.register success:', { userId: payload.id  });
        return payload;
      } catch (error) {
        console.error('[Resolver] Mutation.register failed:', error);
        throw error;
      }
    },

    createCategory: async (
      _: any,
      { input }: { input: any },
      { dataSources, token, userId }: ResolverContext,
    ) => {
      console.log('[Resolver] Mutation.createCategory called with input:', input, 'userId:', userId);
      if (!token || !userId) throw new Error('Not authenticated');
      dataSources.categoryAPI.setContext(token, userId);
      const result = await dataSources.categoryAPI.createCategory(input);
      console.log('[Resolver] Mutation.createCategory result:', result);
      return result;
    },

    updateCategory: async (
      _: any,
      { id, input }: { id: string; input: any },
      { dataSources, token, userId }: ResolverContext,
    ) => {
      console.log('[Resolver] Mutation.updateCategory called with id:', id, 'input:', input);
      if (!token || !userId) throw new Error('Not authenticated');
      dataSources.categoryAPI.setContext(token, userId);
      const result = await dataSources.categoryAPI.updateCategory(id, input);
      console.log('[Resolver] Mutation.updateCategory result:', result);
      return result;
    },

    deleteCategory: async (
      _: any,
      { id }: { id: string },
      { dataSources, token, userId }: ResolverContext,
    ) => {
      console.log('[Resolver] Mutation.deleteCategory called with id:', id);
      if (!token || !userId) throw new Error('Not authenticated');
      dataSources.categoryAPI.setContext(token, userId);
      const result = await dataSources.categoryAPI.deleteCategory(id);
      console.log('[Resolver] Mutation.deleteCategory result:', result);
      return result;
    },

    createTransaction: async (
      _: any,
      { input }: { input: any },
      { dataSources, token, userId }: ResolverContext,
    ) => {
      console.log('[Resolver] Mutation.createTransaction called with input:', input, 'userId:', userId);
      if (!token || !userId) throw new Error('Not authenticated');
      dataSources.transactionAPI.setContext(token, userId);
      const result = await dataSources.transactionAPI.createTransaction(input);
      console.log('[Resolver] Mutation.createTransaction result:', result);
      return result;
    },

    updateTransaction: async (
      _: any,
      { id, input }: { id: string; input: any },
      { dataSources, token, userId }: ResolverContext,
    ) => {
      console.log('[Resolver] Mutation.updateTransaction called with id:', id, 'input:', input);
      if (!token || !userId) throw new Error('Not authenticated');
      dataSources.transactionAPI.setContext(token, userId);
      const result = await dataSources.transactionAPI.updateTransaction(id, input);
      console.log('[Resolver] Mutation.updateTransaction result:', result);
      return result;
    },

    deleteTransaction: async (
      _: any,
      { id }: { id: string },
      { dataSources, token, userId }: ResolverContext,
    ) => {
      console.log('[Resolver] Mutation.deleteTransaction called with id:', id);
      if (!token || !userId) throw new Error('Not authenticated');
      dataSources.transactionAPI.setContext(token, userId);
      const result = await dataSources.transactionAPI.deleteTransaction(id);
      console.log('[Resolver] Mutation.deleteTransaction result:', result);
      return result;
    },
  },
};
