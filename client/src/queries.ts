import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Topic,
  StudentTopicPreference,
  Course,
  Instructor,
} from '@lti/server/src/db';
import { fetcher } from './utils';
import { useToast } from './contexts/toast/toastContext';
import { GetTopicsResponse, UpdateTopicInput } from '@api/topic';
import { GetOwnTopicsResponse } from '@api/instructor';
import { GetTopicPreferencesResponse } from '@api/student';

export function useGetTopics() {
  return useQuery(['get-topics'], () =>
    fetcher<GetTopicsResponse>('/api/topic'),
  );
}

export function useGetInstructors() {
  return useQuery(['get-instructors'], () =>
    fetcher<Instructor[]>('/api/instructor'),
  );
}

export function useGetOwnTopics() {
  return useQuery(['get-own-topics'], () =>
    fetcher<GetOwnTopicsResponse>('/api/instructor/topics'),
  );
}
export function useDeleteOwnTopic() {
  const { pushToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation(['delete-own-topics'], {
    mutationFn: (topicId: number) =>
      fetcher<Topic>(`/api/topic/${topicId}`, { method: 'DELETE' }),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ['get-own-topics'],
        (oldData: GetOwnTopicsResponse | undefined) => {
          if (!oldData) {
            return oldData;
          }

          return oldData.filter((topic) => topic.id !== data.id);
        },
      );
      pushToast({
        message: 'TOPIC_DELETED_SUCCESSFULLY',
        type: 'success',
      });
    },
  });
}

export function useCreateTopic() {
  const { pushToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: Partial<Topic>) => {
      return fetcher<Topic>('/api/topic', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ['get-own-topics'],
        (oldData: Topic[] | undefined) =>
          oldData ? [...oldData, data] : oldData,
      );
      pushToast({
        message: 'TOPIC_CREATED_SUCCESSFULLY',
        type: 'success',
      });
    },
  });
}

export function useUpdateTopic() {
  const { pushToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: UpdateTopicInput) => {
      return fetcher<GetOwnTopicsResponse[0]>('/api/topic', {
        method: 'PUT',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: (updatedTopic) => {
      queryClient.setQueryData(
        ['get-own-topics'],
        (oldData: GetOwnTopicsResponse | undefined) => {
          if (!oldData) {
            return oldData;
          }

          const index = oldData.findIndex(
            (topic) => topic.id === updatedTopic.id,
          );

          const updatedData = [...oldData];
          updatedData[index] = updatedTopic;
          return updatedData;
        },
      );

      pushToast({
        message: 'TOPIC_UPDATED_SUCCESSFULLY',
        type: 'success',
      });
    },
  });
}

export function useGetTopicPreferences() {
  return useQuery(['get-topic-preferences'], () =>
    fetcher<GetTopicPreferencesResponse>('/api/student/topic-preference'),
  );
}

export function useCreateTopicPreference() {
  const { pushToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (topicId: number) => {
      return fetcher<StudentTopicPreference>('/api/student/topic-preference', {
        method: 'POST',
        body: JSON.stringify({ topicId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: (newStudentTopicPreference) => {
      queryClient.invalidateQueries(['get-topic-preferences']);
      queryClient.setQueryData(
        ['get-topics'],
        (oldData: GetTopicsResponse | undefined) => {
          if (!oldData) {
            return oldData;
          }

          return oldData.map((topic) => {
            if (topic.id === newStudentTopicPreference.topicId) {
              return {
                ...topic,
                isAddedToPreferences: true,
              };
            }

            return topic;
          });
        },
      );
      pushToast({
        message: 'Topic preference created successfully',
        type: 'success',
      });
    },
  });
}

export function useUpdateTopicPreferences() {
  const { pushToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: Omit<StudentTopicPreference, 'studentId'>[]) => {
      return fetcher<GetTopicPreferencesResponse>(
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
    onSuccess: (updatedStudentTopicPreferences) => {
      queryClient.setQueryData(
        ['get-topic-preferences'],
        (oldData: GetTopicPreferencesResponse | undefined) => {
          if (!oldData) {
            return oldData;
          }

          return updatedStudentTopicPreferences;
        },
      );

      pushToast({
        message: 'Topic preferences updated successfully',
        type: 'success',
      });
    },
  });
}

export function useDeleteTopicPreference() {
  const { pushToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (topicId: number) => {
      return fetcher<StudentTopicPreference>(
        `/api/student/topic-preference/${topicId}`,
        {
          method: 'DELETE',
        },
      );
    },
    onSuccess: (deletedStudentTopicPreference) => {
      queryClient.invalidateQueries(['get-topic-preferences']);
      queryClient.setQueryData(
        ['get-topics'],
        (oldData: GetTopicsResponse | undefined) => {
          if (!oldData) {
            return oldData;
          }

          return oldData.map((topic) => {
            if (topic.id === deletedStudentTopicPreference.topicId) {
              return {
                ...topic,
                isAddedToPreferences: false,
              };
            }

            return topic;
          });
        },
      );

      pushToast({
        message: 'Topic preference deleted successfully',
        type: 'success',
      });
    },
  });
}

export function useGetCourses(topicId: number) {
  return useQuery(['get-courses', topicId], () =>
    fetcher<(Course & { weight: number | undefined })[]>(
      `/api/course?topicId=${topicId}`,
    ),
  );
}
export function useCreateTopicCoursePreference() {
  const { pushToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTopicCoursePreference: {
      topicId: number;
      courseId: number;
      weight: number;
    }) => {
      return fetcher<typeof newTopicCoursePreference>(
        '/api/course/topic-preference',
        {
          method: 'POST',
          body: JSON.stringify(newTopicCoursePreference),
        },
      );
    },
    onSuccess: (newTopicCoursePreference) => {
      queryClient.invalidateQueries(['get-topic-preferences']);
      queryClient.setQueryData(
        ['get-courses', newTopicCoursePreference.topicId],
        (oldData: (Course & { weight: number | undefined })[] | undefined) => {
          if (!oldData) {
            return oldData;
          }

          return oldData.map((course) => {
            if (course.id === newTopicCoursePreference.courseId) {
              return {
                ...course,
                weight: newTopicCoursePreference.weight,
              };
            }

            return course;
          });
        },
      );

      pushToast({
        message: 'Cource preference created successfully',
        type: 'success',
      });
    },
  });
}

export function useDeleteTopicCoursePreference() {
  const { pushToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      topicId,
      courseId,
    }: {
      topicId: number;
      courseId: number;
    }) => {
      return fetcher<{
        topicId: number;
        courseId: number;
        weight: number;
      }>(
        `/api/course/topic-preference?topicId=${topicId}&courseId=${courseId}`,
        {
          method: 'DELETE',
        },
      );
    },
    onSuccess: (deletedTopicCoursePreference) => {
      queryClient.invalidateQueries([
        'get-courses',
        deletedTopicCoursePreference.topicId,
      ]);
      queryClient.setQueryData(
        ['get-courses', deletedTopicCoursePreference.topicId],
        (oldData: (Course & { weight: number | undefined })[] | undefined) => {
          if (!oldData) {
            return oldData;
          }

          return oldData.map((course) => {
            if (course.id === deletedTopicCoursePreference.courseId) {
              return {
                ...course,
                weight: undefined,
              };
            }

            return course;
          });
        },
      );

      pushToast({
        message: 'Cource preference deleted successfully',
        type: 'success',
      });
    },
  });
}
