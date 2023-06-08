import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { InstructorResponse } from '@api/instructor';
import { Topic } from '@prisma/client';
import { fetcher } from './utils';
import { useToast } from './contexts/toast/toastContext';
import { NewTopic } from './components/CreateTopicForm';

export function useGetInstructors() {
  return useQuery(['get-instructors'], async () => {
    const response = await fetch('/api/instructor');
    const data = await response.json();
    return data as InstructorResponse[];
  });
}

export function useGetTopics() {
  return useQuery(['get-topics'], async () => {
    const response = await fetch('/api/topic');
    const data = await response.json();
    return data as Topic[];
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
      queryClient.setQueryData(['get-topics'], (oldData: Topic[] | undefined) =>
        oldData ? [...oldData, data] : oldData,
      );
      pushToast({
        message: 'Topic created successfully',
        type: 'success',
      });
    },
  });
};
