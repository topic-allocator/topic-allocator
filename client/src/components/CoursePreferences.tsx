import { GearIcon } from '@radix-ui/react-icons';
import Dialog from '@/components/ui/dialog/Dialog';
import { useLabel } from '@/contexts/labels/labelContext';
import { useGetCourses } from '@/queries';
import CourseRow from '@/components/CourseRow';
import NewCourseRow from '@/components/NewCourseRow';

export default function CoursePreferences({ topicId }: { topicId: number }) {
  const { data: courses, isLoading, isError } = useGetCourses(topicId);
  const { labels } = useLabel();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error</div>;
  }

  const avaliableCourses = courses.filter((c) => !(c.weight === 0 || c.weight));

  return (
    <Dialog>
      <Dialog.Trigger
        title="edit"
        className="rounded-full bg-transparent bg-gray-100 p-2 transition hover:bg-gray-300"
        buttonTitle=<span className="md:hidden pointer-events-none px-3 py-1">
          Súlyok
        </span>
        buttonIcon={
          <GearIcon
            width={20}
            height={20}
            className="pointer-events-none text-gray-600"
          />
        }
      />
      <Dialog.Body className="animate-pop-in overflow-hidden rounded-md px-3 py-0 shadow-2xl">
        <Dialog.Header headerTitle="Súlyok konfigurálása" />

        <div className="min-h-[400px] rounded-md p-10 max-h-[80vh] overflow-y-auto">
          <table className="h-1 w-full caption-bottom " border={1} rules="rows">
            <caption className="mt-4 text-gray-500">
              {labels.PREFERENCES}
            </caption>
            <thead className="border-b text-left">
              {avaliableCourses.length > 0 && (
                <NewCourseRow topicId={topicId} courses={avaliableCourses} />
              )}
              <tr>
                <th className="p-3">Tantárgy</th>
                <th className="p-3">Kredit</th>
                <th className="p-3">Súly</th>
              </tr>
            </thead>
            <tbody>
              {courses
                .filter((c) => c.weight === 0 || c.weight)
                .map((course) => (
                  <CourseRow
                    key={course.id}
                    topicId={topicId}
                    // @ts-ignore
                    course={course}
                  />
                ))}
            </tbody>
          </table>
        </div>
      </Dialog.Body>
    </Dialog>
  );
}
