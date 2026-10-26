import React, { createContext, useState, useContext, ReactNode } from 'react';
import { gql, ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { User } from '@financial-dashboard/common';

const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.REACT_APP_GRAPHQL_URI || '/graphql',
    credentials: 'include',
  }),
  cache: new InMemoryCache(),
});

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      id
      firstName
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $firstName: String!, $lastName: String!) {
    register(email: $email, password: $password, firstName: $firstName, lastName: $lastName) {
      token
      id
      firstName
    }
  }
`;

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));

  const login = async (email: string, password: string) => {
    try {
      const response = await client.mutate<{
        login: { token: string; id: string; firstName: string };
      }>({
        mutation: LOGIN_MUTATION,
        variables: { email, password },
      });

      const loginData = response.data?.login;
      if (!loginData) throw new Error('Login response is missing user data');
      const { token: authToken, id: userId, firstName } = loginData;
      setToken(authToken);
      setUser({
        id: userId,
        email,
        firstName,
        lastName: '',
        active: true,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('userId', userId);
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      await client.mutate({
        mutation: REGISTER_MUTATION,
        variables: { email, password, firstName, lastName },
      });
      // Auto-login after registration
      await login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
