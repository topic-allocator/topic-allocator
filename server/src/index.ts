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
  updateInstructorMinMax,
} from './handlers/api/instructor';
import {
  createTopicPreference,
  deleteTopicPreference,
  getAssignedTopic,
  getStudents,
  getTopicPreferences,
  updateStudent,
  updateTopicPreferences,
} from './handlers/api/student';
import {
  createTopicCoursePreference,
  deleteTopicCoursePreference,
  getCourses,
} from './handlers/api/course';
import { solve } from './handlers/api/solver';

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
app.put('update-instructor-min-max', {
  route: 'api/instructor/min-max',
  authLevel: 'anonymous',
  handler: withSession(updateInstructorMinMax),
});

app.get('get-students', {
  route: 'api/student',
  authLevel: 'anonymous',
  handler: withSession(getStudents),
});
app.put('update-student', {
  route: 'api/student',
  authLevel: 'anonymous',
  handler: withSession(updateStudent),
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
app.get('get-assigned-topic-for-student', {
  route: 'api/student/assigned-topic',
  authLevel: 'anonymous',
  handler: withSession(getAssignedTopic),
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

app.post('solve', {
  route: 'api/solve',
  authLevel: 'anonymous',
  handler: withSession(solve),
});
