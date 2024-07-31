import { Course } from '@lti/server/src/db';
import { Cross1Icon } from '@radix-ui/react-icons';
import { useDeleteTopicCoursePreference } from '@/queries';
import Button from './ui/button';
import { useLabels } from '@/contexts/labels/label-context';

export default function CourseRow({
  course,
  topicId,
}: {
  course: Course & { weight: number };
  topicId: string;
}) {
  const deletePreference = useDeleteTopicCoursePreference();
  const { labels } = useLabels();

  return (
    <tr key={topicId}>
      <td className="p-3">{course.name}</td>
      <td className="p-3">{course.credit}</td>
      <td className="p-3">{course.weight}</td>

      <td className="inline-flex h-full justify-end gap-3 p-3">
        <Button
          label={labels.DELETE}
          isPending={deletePreference.isPending}
          className="btn-outline btn-error"
          icon={<Cross1Icon width={20} height={20} />}
          onClick={() =>
            deletePreference.mutate({
              topicId,
              courseId: course.id,
            })
          }
        />
      </td>
    </tr>
  );
}
