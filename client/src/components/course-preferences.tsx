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
        label={<span className="md:hidden">{labels.WEIGHTS}</span>}
        icon={<GearIcon width={20} height={20} />}
      />
      <Dialog.Body className="overflow-hidden">
        <Dialog.Header headerTitle={labels.CONFIGURE_WEIGHTS} />

        <div className="max-h-[80vh] min-h-[400px] overflow-y-auto rounded-md">
          <table className="border-b border-neutral-500/50 text-base">
            <caption>{labels.WEIGHTS}</caption>
            <thead>
              {avaliableCourses.length > 0 && (
                <NewCourseRow topicId={topicId} courses={avaliableCourses} />
              )}
              <tr className="border-b border-neutral-500/50 text-base">
                <th className="p-3 ">{labels.COURSE}</th>
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
