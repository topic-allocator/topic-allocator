import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Topic } from '@prisma/client';
import { fetcher } from './utils';
import { useToast } from './contexts/toast/toastContext';
import { NewTopic } from './components/TopicForm';
import { GetTopicsResponse, UpdateTopicInput } from '@api/topic';
import { GetOwnTopicsResponse } from '@api/instructor';

export function useGetTopics() {
  return useQuery(['get-topics'], () => fetcher<GetTopicsResponse>('/api/topic'));
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
    mutationFn: (topicId: number) => fetcher<Topic>(`/api/topic/${topicId}`, { method: 'DELETE' }),
    onSuccess: (data) => {
      queryClient.setQueryData(['get-own-topics'], (oldData: GetOwnTopicsResponse | undefined) => {
        if (!oldData) {
          return oldData;
        }

        return oldData.filter((topic) => topic.id !== data.id);
      });
      pushToast({
        message: 'Topic deleted successfully',
        type: 'success',
      });
    },
  });
}

export const useCreateTopic = () => {
  const { pushToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: NewTopic) => {
      return fetcher<Topic>('/api/topic', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['get-own-topics'], (oldData: Topic[] | undefined) =>
        oldData ? [...oldData, data] : oldData,
      );
      pushToast({
        message: 'Topic created successfully',
        type: 'success',
      });
    },
  });
};

export const useUpdateTopic = () => {
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
      queryClient.setQueryData(['get-own-topics'], (oldData: GetOwnTopicsResponse | undefined) => {
        if (!oldData) {
          return oldData;
        }

        const index = oldData.findIndex((topic) => topic.id === updatedTopic.id);

        const updatedData = [...oldData];
        updatedData[index] = updatedTopic;
        return updatedData;
      });

      pushToast({
        message: 'Topic updated successfully',
        type: 'success',
      });
    },
  });
};
