import { app } from '@azure/functions';
import { serveStaticFiles } from './handlers/static';
import { launchLTI } from './handlers/lti';
import { withSession } from './lib/utils';
import { createTrpcHandler } from './api/trpc-adapter';
import { createContext } from './api/context';
import { router } from './api/router';
import * as dotenv from 'dotenv';

if (process.env.DEV) {
  dotenv.config();
}

app.post('lti', {
  authLevel: 'anonymous',
  handler: launchLTI,
});

app.get('static-files', {
  route: 'app/{*filename}',
  authLevel: 'anonymous',
  handler: withSession(serveStaticFiles),
});

app.http('trpc', {
  authLevel: 'anonymous',
  methods: ['GET', 'POST'],
  route: 'api/trpc/{*path}',
  handler: createTrpcHandler({ router, createContext }),
});
