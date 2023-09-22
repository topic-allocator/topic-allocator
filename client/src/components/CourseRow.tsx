import { Course } from '@lti/server/src/db';
import { Cross1Icon } from '@radix-ui/react-icons';
import { useDeleteTopicCoursePreference } from '../queries';

export default function CourseRow({
  course,
  topicId,
}: {
  course: Course & { weight: number };
  topicId: number;
}) {
  const deletePreference = useDeleteTopicCoursePreference();

  return (
    <tr key={1} className="border-b hover:bg-gray-100">
      <td className="p-3">{course.name}</td>
      <td className="p-3">{course.credit}</td>
      <td className="p-3">{course.weight}</td>

      <td className="inline-flex h-full justify-end gap-3 p-3">
        <button
          className="rounded-full bg-transparent p-2 transition hover:bg-red-300"
          onClick={() =>
            deletePreference.mutate({
              topicId,
              courseId: course.id,
            })
          }
        >
          <Cross1Icon
            width={20}
            height={20}
            className="pointer-events-none text-red-600"
          />
        </button>
      </td>
    </tr>
  );
}
