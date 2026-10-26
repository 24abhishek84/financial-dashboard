import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express, { Request } from 'express';
import cors from 'cors';
import { typeDefs } from './schema/schema';
import { resolvers } from './resolvers';
import { createDataSources } from './datasources';

async function startServer() {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(express.json());
  app.use(
    cors({
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
    })
  );

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }: { req: Request }) => {
        const dataSources = createDataSources();
        const authorization = req.headers.authorization as string | undefined;
        const token = authorization ? authorization.split('Bearer ')[1] : undefined;
        const headerUserId = req.headers['x-user-id'] as string | undefined;
        const userId = headerUserId || undefined;

        return {
          dataSources,
          token,
          userId,
        };
      },
    })
  );

  const port = parseInt(process.env.PORT || '4000');
  await new Promise<void>((resolve) =>
    app.listen({ port }, () => {
      console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
      console.log('🔐 CORS enabled for localhost:3000, localhost:3001');
      resolve();
    })
  );
}

startServer().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});
