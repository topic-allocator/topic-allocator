import { useQuery } from '@tanstack/react-query';
import { InstructorResponse } from '@api/instructor';
import { Topic } from '@prisma/client';

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
