import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/utils';
import { useToast } from '@/contexts/toast/toast-context';
import {
  CreateTopicInput,
  CreateTopicOutput,
  DeleteTopicOutput,
  GetAssignedStudentsOutput,
  GetTopicsOutput,
  UpdateTopicInput,
  UpdateTopicOutput,
} from '@api/topic';
import {
  GetAssignedStudentsForInstructorOutput,
  GetInstructorsOutput,
  GetOwnTopicsOutput,
} from '@api/instructor';
import { SolverOutput } from '@api/solver';
import {
  CreateTopicPreferenceInput,
  CreateTopicPreferenceOutput,
  DeleteTopicPreferenceOutput,
  GetStudentsOutput,
  GetTopicPreferencesOutput,
  UpdateStudentInput,
  UpdateStudentOutput,
  UpdateTopicPreferencesInput,
  UpdateTopicPreferencesOutput,
} from '@api/student';
import {
  CreateTopicCoursePreferenceInput,
  CreateTopicCoursePreferenceOutput,
  DeleteTopicCoursePreferenceOutput,
  GetCoursesOutput,
} from '@api/course';
import { useLabels } from '@/contexts/labels/label-context';

export function useGetTopics() {
  return useQuery(['get-topics'], () => fetcher<GetTopicsOutput>('/api/topic'));
}

export function useGetInstructors() {
  return useQuery(['get-instructors'], () =>
    fetcher<GetInstructorsOutput>('/api/instructor'),
  );
}

export function useGetOwnTopics() {
  return useQuery(['get-own-topics'], () =>
    fetcher<GetOwnTopicsOutput>('/api/instructor/topics'),
  );
}
export function useDeleteOwnTopic() {
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const { labels } = useLabels();

  return useMutation(['delete-own-topics'], {
    mutationFn: (topicId: string) =>
      fetcher<DeleteTopicOutput>(`/api/topic/${topicId}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries(['get-own-topics']);

      pushToast({
        message: labels.TOPIC_DELETED_SUCCESSFULLY,
        type: 'success',
      });
    },
  });
}

export function useCreateTopic() {
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const { labels } = useLabels();

  return useMutation({
    mutationFn: (formData: CreateTopicInput) => {
      return fetcher<CreateTopicOutput>('/api/topic', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['get-topics']);

      pushToast({
        message: labels.TOPIC_CREATED_SUCCESSFULLY,
        type: 'success',
      });
    },
  });
}

export function useUpdateTopic() {
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const { labels } = useLabels();

  return useMutation({
    mutationFn: (formData: UpdateTopicInput) => {
      return fetcher<UpdateTopicOutput>('/api/topic', {
        method: 'PUT',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['get-topics', 'get-own-topics']);

      pushToast({
        message: labels.TOPIC_UPDATED_SUCCESSFULLY,
        type: 'success',
      });
    },
  });
}

export function useGetAssignedStudentsForTopic(topicId: string) {
  return useQuery(['get-assigned-students-for-topic', topicId], () =>
    fetcher<GetAssignedStudentsOutput>(
      `/api/topic/${topicId}/assigned-students`,
    ),
  );
}

export function useGetAssignedStudentsForInstructor() {
  return useQuery(['get-assigned-students-for-instructor'], () =>
    fetcher<GetAssignedStudentsForInstructorOutput>(
      `/api/instructor/assigned-students`,
    ),
  );
}

export function useGetTopicPreferences() {
  return useQuery(['get-topic-preferences'], () =>
    fetcher<GetTopicPreferencesOutput>('/api/student/topic-preference'),
  );
}

export function useCreateTopicPreference() {
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const { labels } = useLabels();

  return useMutation({
    mutationFn: (input: CreateTopicPreferenceInput) => {
      return fetcher<CreateTopicPreferenceOutput>(
        '/api/student/topic-preference',
        {
          method: 'POST',
          body: JSON.stringify(input),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['get-topics']);
      await queryClient.invalidateQueries(['get-topic-preferences']);

      pushToast({
        message: labels.TOPIC_PREFERENCE_CREATED,
        type: 'success',
      });
    },
  });
}

export function useUpdateTopicPreferences() {
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const { labels } = useLabels();

  return useMutation({
    mutationFn: (preferences: UpdateTopicPreferencesInput) => {
      return fetcher<UpdateTopicPreferencesOutput>(
        '/api/student/topic-preference',
        {
          method: 'PUT',
          body: JSON.stringify(preferences),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['get-topic-preferences']);

      pushToast({
        message: labels.TOPIC_PREFERENCES_UPDATED,
        type: 'success',
      });
    },
  });
}

export function useDeleteTopicPreference() {
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const { labels } = useLabels();

  return useMutation({
    mutationFn: (topicId: string) => {
      return fetcher<DeleteTopicPreferenceOutput>(
        `/api/student/topic-preference/${topicId}`,
        {
          method: 'DELETE',
        },
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['get-topics']);
      await queryClient.invalidateQueries(['get-topic-preferences']);

      pushToast({
        message: labels.TOPIC_PREFERENCE_DELETED,
        type: 'success',
      });
    },
  });
}

export function useGetCourses(topicId: string) {
  return useQuery(['get-courses', topicId], () =>
    fetcher<GetCoursesOutput>(`/api/course?topicId=${topicId}`),
  );
}
export function useCreateTopicCoursePreference() {
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const { labels } = useLabels();

  return useMutation({
    mutationFn: (
      newTopicCoursePreference: CreateTopicCoursePreferenceInput,
    ) => {
      return fetcher<CreateTopicCoursePreferenceOutput>(
        '/api/course/topic-preference',
        {
          method: 'POST',
          body: JSON.stringify(newTopicCoursePreference),
        },
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['get-topic-preferences']);
      await queryClient.invalidateQueries(['get-courses']);

      pushToast({
        message: labels.COURSE_PREFERENCE_CREATED,
        type: 'success',
      });
    },
  });
}

export function useDeleteTopicCoursePreference() {
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const { labels } = useLabels();

  return useMutation({
    mutationFn: ({
      topicId,
      courseId,
    }: {
      topicId: string;
      courseId: string;
    }) => {
      return fetcher<DeleteTopicCoursePreferenceOutput>(
        `/api/course/topic-preference?topicId=${topicId}&courseId=${courseId}`,
        {
          method: 'DELETE',
        },
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['get-courses']);

      pushToast({
        message: labels.COURSE_PREFERENCE_DELETED,
        type: 'success',
      });
    },
  });
}

export function useRunSolver() {
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const { labels } = useLabels();

  return useMutation({
    mutationFn: () => {
      return fetcher<SolverOutput>('/api/solve', {
        method: 'POST',
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['get-students']);
      await queryClient.invalidateQueries(['get-assigned-students-for-topic']);
      await queryClient.invalidateQueries([
        'get-assigned-students-for-instructor',
      ]);
      await queryClient.invalidateQueries(['get-topics']);
      await queryClient.invalidateQueries(['get-own-topics']);

      pushToast({
        message: labels.SOLVER_FINISHED,
        type: 'success',
      });
    },
  });
}

export function useGetStudents() {
  return useQuery(['get-students'], () =>
    fetcher<GetStudentsOutput>('/api/student'),
  );
}

export function useUpdateStudent() {
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const { labels } = useLabels();

  return useMutation({
    mutationFn: (student: UpdateStudentInput) => {
      return fetcher<UpdateStudentOutput>(`/api/student`, {
        method: 'PUT',
        body: JSON.stringify(student),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['get-students']);
      await queryClient.invalidateQueries(['get-assigned-students-for-topic']);
      await queryClient.invalidateQueries([
        'get-assigned-students-for-instructor',
      ]);
      await queryClient.invalidateQueries(['get-topics']);
      await queryClient.invalidateQueries(['get-own-topics']);

      pushToast({
        message: labels.STUDENT_UPDATED_SUCCESFULLY,
        type: 'success',
      });
    },
  });
}
