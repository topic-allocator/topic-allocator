import { trpc } from '@/utils';
import { useToast } from '@/contexts/toast/toast-context';
import { useLabels } from '@/contexts/labels/label-context';
import { RouterInput } from '@server/api/router';

// TODO: queries are kinda redundant here, maybe remove them?
export function useGetTopics(input: RouterInput['topic']['getMany'] = {}) {
  return trpc.topic.getMany.useQuery(input);
}
export function useGetInstructor(input: RouterInput['instructor']['getOne']) {
  return trpc.instructor.getOne.useQuery(input);
}
export function useGetInstructors() {
  return trpc.instructor.getAll.useQuery();
}
export function useGetStudents(input?: RouterInput['student']['getMany']) {
  return trpc.student.getMany.useQuery(input);
}
export function useGetTopicPreferences(
  input?: RouterInput['student']['getPreferences'],
) {
  return trpc.student.getPreferences.useQuery(input);
}
export function useGetAssignedTopicsForStudent() {
  return trpc.student.getAssignedTopic.useQuery();
}

export function useUpdateInstructorMinMax() {
  const { pushToast } = useToast();
  const { labels } = useLabels();
  const utils = trpc.useUtils();

  return trpc.instructor.updateMinMax.useMutation({
    onSuccess: async () => {
      await utils.instructor.getAll.invalidate();

      pushToast({
        message: labels.MIN_MAX_UPDATED,
        type: 'success',
      });
    },
  });
}

export function useDeleteTopic() {
  const { pushToast } = useToast();
  const { labels } = useLabels();
  const utils = trpc.useUtils();

  return trpc.topic.delete.useMutation({
    onSuccess: async () => {
      await utils.topic.getMany.invalidate();

      pushToast({
        message: labels.TOPIC_DELETED_SUCCESSFULLY,
        type: 'success',
      });
    },
  });
}

export function useCreateTopic() {
  const { pushToast } = useToast();
  const { labels } = useLabels();
  const utils = trpc.useUtils();

  return trpc.topic.create.useMutation({
    onSuccess: async () => {
      await utils.topic.getMany.invalidate();
      pushToast({
        message: labels.TOPIC_CREATED_SUCCESSFULLY,
        type: 'success',
      });
    },
  });
}

export function useUpdateTopic() {
  const { pushToast } = useToast();
  const { labels } = useLabels();
  const utils = trpc.useUtils();

  return trpc.topic.update.useMutation({
    onSuccess: async () => {
      await utils.topic.getMany.invalidate();

      pushToast({
        message: labels.TOPIC_UPDATED_SUCCESSFULLY,
        type: 'success',
      });
    },
  });
}

export function useCreateTopicPreference() {
  const { pushToast } = useToast();
  const { labels } = useLabels();
  const utils = trpc.useUtils();

  return trpc.student.createTopicPreference.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.topic.getMany.invalidate(),
        utils.student.getPreferences.invalidate(),
      ]);

      pushToast({
        message: labels.TOPIC_PREFERENCE_CREATED,
        type: 'success',
      });
    },
  });
}

export function useUpdateTopicPreferences() {
  const { pushToast } = useToast();
  const { labels } = useLabels();
  const utils = trpc.useUtils();

  return trpc.student.updateTopicPreferences.useMutation({
    onSuccess: async () => {
      await utils.student.getPreferences.invalidate();

      pushToast({
        message: labels.TOPIC_PREFERENCES_UPDATED,
        type: 'success',
      });
    },
  });
}

export function useDeleteTopicPreference() {
  const { pushToast } = useToast();
  const { labels } = useLabels();
  const utils = trpc.useUtils();

  return trpc.student.deleteTopicPreference.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.topic.getMany.invalidate(),
        utils.student.getPreferences.invalidate(),
      ]);

      pushToast({
        message: labels.TOPIC_PREFERENCE_DELETED,
        type: 'success',
      });
    },
  });
}

export function useGetCourses(topicId?: string) {
  return trpc.course.getMany.useQuery({
    topicId,
  });
}
export function useCreateTopicCoursePreference() {
  const { pushToast } = useToast();
  const { labels } = useLabels();
  const utils = trpc.useUtils();

  return trpc.course.createTopicPreference.useMutation({
    onSuccess: async () => {
      await utils.course.getMany.invalidate();

      pushToast({
        message: labels.COURSE_PREFERENCE_CREATED,
        type: 'success',
      });
    },
  });
}

export function useDeleteTopicCoursePreference() {
  const { pushToast } = useToast();
  const { labels } = useLabels();
  const utils = trpc.useUtils();

  return trpc.course.deleteTopicPreference.useMutation({
    onSuccess: async () => {
      await utils.course.getMany.invalidate();

      pushToast({
        message: labels.COURSE_PREFERENCE_DELETED,
        type: 'success',
      });
    },
  });
}

export function useRunSolver() {
  const { pushToast } = useToast();
  const { labels } = useLabels();
  const utils = trpc.useUtils();

  return trpc.solver.solve.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.student.getMany.invalidate(),
        utils.topic.getMany.invalidate(),
      ]);

      pushToast({
        message: labels.SOLVER_FINISHED,
        type: 'success',
      });
    },
  });
}

export function useUpdateStudent() {
  const { pushToast } = useToast();
  const { labels } = useLabels();
  const utils = trpc.useUtils();

  return trpc.student.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.student.getMany.invalidate(),
        utils.topic.getMany.invalidate(),
      ]);

      pushToast({
        message: labels.STUDENT_UPDATED_SUCCESFULLY,
        type: 'success',
      });
    },
  });
}
