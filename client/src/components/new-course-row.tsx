import { Course } from '@lti/server/src/db';
import ComboBox from '@/components/ui/combo-box';
import Spinner from '@/components/ui/spinner';
import { CheckIcon } from '@radix-ui/react-icons';
import Input from '@/components/ui/input';
import { useState } from 'react';
import { cn } from '@/utils';
import { useCreateTopicCoursePreference } from '../queries';

export default function NewCourseRow({
  topicId,
  courses,
}: {
  topicId: number;
  courses: Course[];
}) {
  const createCoursePreference = useCreateTopicCoursePreference();

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedWeight, setSelectedWeight] = useState('1');
  const canCreate = selectedCourse && selectedWeight;

  return (
    <tr key={1} className="border-b">
      <td className="p-1">
        <ComboBox
          value={selectedCourse?.id}
          options={courses.map((course) => ({
            value: course.id,
            label: course.name,
          }))}
          onChange={(id) =>
            setSelectedCourse(courses.find((c) => c.id === id)!)
          }
        />
      </td>
      <td className="p-3">{selectedCourse?.credit}</td>
      <td className="p-1">
        <Input
          value={selectedWeight}
          className="max-w-[50px]"
          onChange={(e) => setSelectedWeight(e.target.value)}
        />
      </td>

      <td className="p-3">
        <button
          className={cn('rounded-full bg-transparent p-1 transition', {
            'hover:bg-emerald-300': canCreate,
            'bg-emerald-100': canCreate,
            'bg-gray-100': !canCreate,
          })}
          disabled={!canCreate}
          onClick={() => {
            canCreate &&
              createCoursePreference.mutate(
                {
                  topicId,
                  courseId: selectedCourse.id,
                  weight: Number(selectedWeight),
                },
                {
                  onSuccess: () => {
                    setSelectedCourse(null);
                    setSelectedWeight('1');
                  },
                },
              );
          }}
        >
          {createCoursePreference.isLoading ? (
            <Spinner
              width={25}
              height={25}
              className={cn('pointer-events-none', {
                'text-emerald-600': canCreate,
                'text-gray-600': !canCreate,
              })}
            />
          ) : (
            <CheckIcon
              width={25}
              height={25}
              className={cn('pointer-events-none', {
                'text-emerald-600': canCreate,
                'text-gray-600': !canCreate,
              })}
            />
          )}
        </button>
      </td>
    </tr>
  );
}