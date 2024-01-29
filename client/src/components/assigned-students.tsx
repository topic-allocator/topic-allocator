import { PersonIcon } from '@radix-ui/react-icons';
import { useGetAssignedStudentsForTopic } from '@/queries';
import Dialog from '@/components/ui/dialog/dialog';
import { Topic } from '@lti/server/src/db';
import { useLabels } from '@/contexts/labels/label-context';

export default function AssignedStudents({ topic }: { topic: Topic }) {
  const {
    data: students,
    isLoading,
    isError,
  } = useGetAssignedStudentsForTopic(topic.id);
  const { labels } = useLabels();

  if (isLoading) {
    return <div>{labels.LOADING}...</div>;
  }
  if (isError) {
    return <div>{labels.ERROR}...</div>;
  }

  return (
    <Dialog>
      <Dialog.Trigger
        title="edit"
        className="rounded-full bg-gray-100 bg-transparent p-2 transition hover:bg-gray-300"
        buttonTitle={
          <span className="pointer-events-none px-3 py-1 md:hidden">
            {labels.STUDENTS}
          </span>
        }
        buttonIcon={
          <PersonIcon
            width={20}
            height={20}
            className="pointer-events-none text-gray-600"
          />
        }
      />
      <Dialog.Body className="animate-pop-in overflow-hidden rounded-md px-3 py-0 shadow-2xl">
        <Dialog.Header
          headerTitle={`${labels.ASSIGNED_STUDENTS} (${students.length} / ${topic.capacity})`}
        />

        <div className="min-h-[400px] overflow-x-auto  rounded-md p-10">
          <table className="h-1 w-full caption-bottom" border={1} rules="rows">
            <caption className="mt-4 text-gray-500">{labels.STUDENTS}</caption>
            <thead className="border-b text-left">
              <tr>
                <th className="p-3">{labels.NAME}</th>
                <th className="p-3">{labels.EMAIL}</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td
                    // @ts-ignore reason: colspan expects number, but "100%" is valid
                    colSpan="100%"
                  >
                    <p className="p-5 text-center text-lg">
                      {labels.NO_ASSIGNED_STUDENTS}
                    </p>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-3 py-1">{student.name}</td>
                    <td className="px-3 py-1">{student.email}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Dialog.Body>
    </Dialog>
  );
}
