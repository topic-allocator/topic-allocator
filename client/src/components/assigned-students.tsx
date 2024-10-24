import { PersonIcon } from '@radix-ui/react-icons';
import { useGetStudents } from '@/queries';
import Dialog from '@/components/ui/dialog/dialog';
import { Topic } from '@lti/server/src/db';
import { useLabels } from '@/contexts/labels/label-context';
import Table from './ui/table';

export default function AssignedStudents({ topic }: { topic: Topic }) {
  const {
    data: students,
    isPending,
    isError,
  } = useGetStudents({
    assignedTopicId: topic.id,
  });
  const { labels } = useLabels();

  if (isPending) {
    return <div>{labels.LOADING}...</div>;
  }
  if (isError) {
    return <div>{labels.ERROR}...</div>;
  }

  return (
    <Dialog>
      <Dialog.Trigger
        title={labels.ASSIGNED_STUDENTS}
        className="btn-outline btn-md md:btn-circle"
        label={<span className="md:hidden">{labels.STUDENTS}</span>}
        icon={<PersonIcon width={20} height={20} />}
      />
      <Dialog.Body className="overflow-hidden">
        <Dialog.Header
          headerTitle={`${labels.ASSIGNED_STUDENTS} (${students.length} / ${topic.capacity})`}
        />

        <div className="min-h-[400px] overflow-x-auto rounded-md p-10">
          <Table>
            <Table.Caption>{labels.STUDENTS}</Table.Caption>
            <Table.Head>
              <Table.Row>
                <th className="p-3">{labels.NAME}</th>
                <th className="p-3">{labels.EMAIL}</th>
              </Table.Row>
            </Table.Head>
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
                  <Table.Row key={student.id}>
                    <Table.Cell primary label={labels.NAME}>
                      {student.name}
                    </Table.Cell>
                    <Table.Cell label={labels.EMAIL}>
                      {student.email}
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Dialog.Body>
    </Dialog>
  );
}
