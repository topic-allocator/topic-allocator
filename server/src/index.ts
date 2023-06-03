import { app } from '@azure/functions';
import { serveStaticFiles } from './handlers/static';
import { launchLTI } from './handlers/lti';
import { retrieveSession } from './handlers/api/session';

app.post('lti', {
  authLevel: 'anonymous',
  handler: launchLTI,
});
app.get('static-files', {
  route: 'app/{*filename}',
  authLevel: 'anonymous',
  handler: serveStaticFiles,
});
app.get('get-session', {
  route: 'api/session',
  authLevel: 'anonymous',
  handler: retrieveSession,
});
