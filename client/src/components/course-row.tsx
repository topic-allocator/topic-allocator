import { Course } from '@lti/server/src/db';
import { Cross1Icon } from '@radix-ui/react-icons';
import { useDeleteTopicCoursePreference } from '@/queries';
import Spinner from '@/components/ui/spinner';

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
          className="rounded-full p-2 transition bg-red-100 hover:bg-red-300"
          onClick={() =>
            deletePreference.mutate({
              topicId,
              courseId: course.id,
            })
          }
        >
          {deletePreference.isLoading ? (
            <Spinner
              width={20}
              height={20}
              className="pointer-events-none text-red-600"
            />
          ) : (
            <Cross1Icon
              width={20}
              height={20}
              className="pointer-events-none text-red-600"
            />
          )}
        </button>
      </td>
    </tr>
  );
}
