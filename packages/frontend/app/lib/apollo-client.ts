import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URI || 'http://localhost:4000/graphql',
  credentials: 'include',
});

const authLink = new ApolloLink((operation, forward) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : '',
      'X-User-Id': typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '',
    },
  });
  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
