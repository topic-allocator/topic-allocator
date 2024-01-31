import { GearIcon } from '@radix-ui/react-icons';
import Dialog from '@/components/ui/dialog/dialog';
import { useLabels } from '@/contexts/labels/label-context';
import { useGetCourses } from '@/queries';
import CourseRow from '@/components/course-row';
import NewCourseRow from '@/components/new-course-row';

export default function CoursePreferences({ topicId }: { topicId: string }) {
  const { data: courses, isLoading, isError } = useGetCourses(topicId);
  const { labels } = useLabels();

  if (isLoading) {
    return <div>{labels.LOADING}...</div>;
  }
  if (isError) {
    return <div>{labels.ERROR}...</div>;
  }

  const avaliableCourses = courses.filter((c) => !(c.weight === 0 || c.weight));

  return (
    <Dialog>
      <Dialog.Trigger
        title={labels.WEIGHTS}
        className="btn-outline btn-md md:btn-circle"
        buttonLabel={<span className="md:hidden">{labels.WEIGHTS}</span>}
        buttonIcon={<GearIcon width={20} height={20} />}
      />
      <Dialog.Body className="animate-pop-in overflow-hidden rounded-md px-3 py-0 shadow-2xl">
        <Dialog.Header headerTitle="Súlyok konfigurálása" />

        <div className="max-h-[80vh] min-h-[400px] overflow-y-auto rounded-md p-10">
          <table className="h-1 w-full caption-bottom " border={1} rules="rows">
            <caption className="mt-4 text-gray-500">
              {labels.PREFERENCES}
            </caption>
            <thead className="border-b text-left">
              {avaliableCourses.length > 0 && (
                <NewCourseRow topicId={topicId} courses={avaliableCourses} />
              )}
              <tr>
                <th className="p-3">{labels.COURSE}</th>
                <th className="p-3">{labels.CREDITS}</th>
                <th className="p-3">{labels.WEIGHT}</th>
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
