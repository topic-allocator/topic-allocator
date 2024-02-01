import { Course } from '@lti/server/src/db';
import ComboBox from '@/components/ui/combo-box';
import { CheckIcon } from '@radix-ui/react-icons';
import Input from '@/components/ui/input';
import { useState } from 'react';
import { useCreateTopicCoursePreference } from '../queries';
import Button from './ui/button';
import { useLabels } from '@/contexts/labels/label-context';

export default function NewCourseRow({
  topicId,
  courses,
}: {
  topicId: string;
  courses: Course[];
}) {
  const createCoursePreference = useCreateTopicCoursePreference();
  const { labels } = useLabels();

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedWeight, setSelectedWeight] = useState('1');
  const canCreate = selectedCourse && selectedWeight;

  return (
    <tr key={-1} className="border-b text-base">
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
        <Button
          label={labels.CREATE}
          className="btn-outline btn-success"
          disabled={!canCreate}
          icon={<CheckIcon width={25} height={25} />}
          isLoading={createCoursePreference.isLoading}
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
        />
      </td>
    </tr>
  );
}
