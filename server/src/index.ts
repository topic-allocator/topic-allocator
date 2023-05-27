import { app } from '@azure/functions';
import { serveStaticFiles } from './handlers/static';
import { lti } from './handlers/lti';

app.post('lti', {
  authLevel: 'anonymous',
  handler: lti,
});
app.get('static-files', {
  route: 'app/{*filename}',
  authLevel: 'anonymous',
  handler: serveStaticFiles,
});
