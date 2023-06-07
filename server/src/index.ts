import { app } from '@azure/functions';
import { serveStaticFiles } from './handlers/static';
import { launchLTI } from './handlers/lti';
import { retrieveSession } from './handlers/api/session';
import { createTopic, getTopics } from './handlers/api/topic';
import { getInstructors } from './handlers/api/instructor';

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

app.get('get-topics', {
  route: 'api/topic',
  authLevel: 'anonymous',
  handler: getTopics,
});
app.post('create-topic', {
  route: 'api/topic',
  authLevel: 'anonymous',
  handler: createTopic,
});

app.get('get-instructors', {
  route: 'api/instructor',
  authLevel: 'anonymous',
  handler: getInstructors,
});
