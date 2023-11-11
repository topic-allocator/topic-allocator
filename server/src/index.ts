import { app } from '@azure/functions';
import { serveStaticFiles } from './handlers/static';
import { launchLTI } from './handlers/lti';
import { retrieveSession } from './handlers/api/session';
import {
  createTopic,
  deleteTopic,
  getAssignedStudents,
  getTopics,
  updateTopic,
} from './handlers/api/topic';
import { withSession } from './lib/utils';
import {
  getAssignedStudentsForInstructor,
  getInstructors,
  getOwnTopics,
} from './handlers/api/instructor';
import {
  createTopicPreference,
  deleteTopicPreference,
  getTopicPreferences,
  updateTopicPreferences,
} from './handlers/api/student';
import {
  createTopicCoursePreference,
  deleteTopicCoursePreference,
  getCourses,
} from './handlers/api/course';
import { solve } from './handlers/api/solve';

app.post('lti', {
  authLevel: 'anonymous',
  handler: launchLTI,
});

app.get('static-files', {
  route: 'app/{*filename}',
  authLevel: 'anonymous',
  handler: withSession(serveStaticFiles),
});

app.get('get-session', {
  route: 'api/session',
  authLevel: 'anonymous',
  handler: withSession(retrieveSession),
});

app.get('get-topics', {
  route: 'api/topic',
  authLevel: 'anonymous',
  handler: withSession(getTopics),
});
app.post('create-topic', {
  route: 'api/topic',
  authLevel: 'anonymous',
  handler: withSession(createTopic),
});
app.put('update-topic', {
  route: 'api/topic',
  authLevel: 'anonymous',
  handler: withSession(updateTopic),
});
app.deleteRequest('delete-topic', {
  route: 'api/topic/{topicId}',
  authLevel: 'anonymous',
  handler: withSession(deleteTopic),
});
app.get('get-assigned-students', {
  route: 'api/topic/{topicId}/assigned-students',
  authLevel: 'anonymous',
  handler: withSession(getAssignedStudents),
});

app.get('get-instructors', {
  route: 'api/instructor',
  authLevel: 'anonymous',
  handler: withSession(getInstructors),
});
app.get('get-own-topics', {
  route: 'api/instructor/topics',
  authLevel: 'anonymous',
  handler: withSession(getOwnTopics),
});
app.get('get-assigned-students-for-instructor', {
  route: 'api/instructor/assigned-students',
  authLevel: 'anonymous',
  handler: withSession(getAssignedStudentsForInstructor),
});

app.get('get-topic-preferences', {
  route: 'api/student/topic-preference',
  authLevel: 'anonymous',
  handler: withSession(getTopicPreferences),
});
app.put('update-topic-preferences', {
  route: 'api/student/topic-preference',
  authLevel: 'anonymous',
  handler: withSession(updateTopicPreferences),
});
app.post('add-topic-preference', {
  route: 'api/student/topic-preference',
  authLevel: 'anonymous',
  handler: withSession(createTopicPreference),
});
app.deleteRequest('delete-topic-preference', {
  route: 'api/student/topic-preference/{studentTopicPreferenceId}',
  authLevel: 'anonymous',
  handler: withSession(deleteTopicPreference),
});

app.get('get-courses', {
  route: 'api/course',
  authLevel: 'anonymous',
  handler: withSession(getCourses),
});
app.post('create-topic-course-preference', {
  route: 'api/course/topic-preference',
  authLevel: 'anonymous',
  handler: withSession(createTopicCoursePreference),
});
app.deleteRequest('delete-topic-course-preference', {
  route: 'api/course/topic-preference',
  authLevel: 'anonymous',
  handler: withSession(deleteTopicCoursePreference),
});

app.get('solve', {
  route: 'api/solve',
  authLevel: 'anonymous',
  handler: solve,
});
