import { PersonIcon } from '@radix-ui/react-icons';
import { useGetAssignedStudentsForTopic } from '@/queries';
import Dialog from '@/components/ui/dialog/Dialog';
import { Topic } from '@lti/server/src/db';

export default function AssignedStudents({ topic }: { topic: Topic }) {
  const {
    data: students,
    isLoading,
    isError,
  } = useGetAssignedStudentsForTopic(topic.id);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error</div>;
  }

  return (
    <Dialog>
      <Dialog.Trigger
        title="edit"
        className="rounded-full bg-transparent p-2 bg-gray-100 transition hover:bg-gray-300"
        buttonTitle=<span className="md:hidden pointer-events-none px-3 py-1">
          Diákok
        </span>
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
          headerTitle={`Beosztott diákok (${students.length} / ${topic.capacity})`}
        />

        <div className="min-h-[400px] overflow-x-auto  rounded-md p-10">
          <table className="h-1 w-full caption-bottom" border={1} rules="rows">
            <caption className="mt-4 text-gray-500">Diákok</caption>
            <thead className="border-b text-left">
              <tr>
                <th className="p-3">Név</th>
                <th className="p-3">Email</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td
                    // @ts-ignore reason: colspan expects number, but "100%" is valid
                    colSpan="100%"
                  >
                    <p className="text-center p-5 text-lg">
                      Nincs beosztott diák
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
