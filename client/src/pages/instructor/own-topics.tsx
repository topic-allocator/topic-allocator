import TopicForm, { TopicToEdit } from '@/components/topic-form';
import Dialog from '@/components/ui/dialog/dialog';
import { Cross1Icon, Pencil1Icon, PlusIcon } from '@radix-ui/react-icons';
import { useDeleteOwnTopic, useGetOwnTopics } from '@/queries';
import CoursePreferences from '@/components/course-preferences';
import AssignedStudents from '@/components/assigned-students';
import Table from '@/components/ui/table';
import { useLabels } from '@/contexts/labels/label-context';
import Spinner from '@/components/ui/spinner';

export default function OwnTopics() {
  const { data: topics, isLoading, isError } = useGetOwnTopics();
  const deleteTopicMutation = useDeleteOwnTopic();
  const { labels } = useLabels();

  if (isLoading) {
    return <div>{labels.LOADING}...</div>;
  }
  if (isError) {
    return <div>{labels.ERROR}...</div>;
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-3 p-3">
      <div className="flex items-center gap-3">
        <h2 className="p-3 text-2xl">{labels.OWN_TOPICS}</h2>

        <Dialog>
          <Dialog.Trigger
            className="btn-success btn-md text-base"
            label={labels.CREATE}
            icon={<PlusIcon width={25} height={25} />}
          />

          <Dialog.Body className="px-3 py-0">
            <Dialog.Header headerTitle={labels.CREATE_NEW_TOPIC} />

            <TopicForm />
          </Dialog.Body>
        </Dialog>
      </div>

      <div className="card overflow-x-auto border border-neutral-500/50 bg-base-300 md:p-5">
        <Table>
          <Table.Caption>{labels.OWN_TOPICS}</Table.Caption>
          <Table.Head>
            <tr>
              <th className="p-3">{labels.TITLE}</th>
              <th className="p-3">{labels.DESCRIPTION}</th>
              <th className="p-3">{labels.TYPE}</th>
              <th className="p-3">{labels.CAPACITY}</th>
              <th className="p-3">{labels.STUDENTS}</th>
              <th className="p-3">{labels.WEIGHTS}</th>
              <th></th>
            </tr>
          </Table.Head>
          <tbody>
            {isLoading ? (
              <tr>
                {
                  // @ts-ignore reason: colspan expects number, but "100%" is valid
                  <td colSpan="100%">
                    <Spinner className="p-52" />
                  </td>
                }
              </tr>
            ) : topics?.length === 0 ? (
              <tr>
                {
                  // @ts-ignore reason: colspan expects number, but "100%" is valid
                  <td colSpan="100%">
                    <p className="text-center text-xl">
                      {labels.NO_RECORDS_FOUND}
                    </p>
                  </td>
                }
              </tr>
            ) : (
              topics.map((topic) => (
                <Table.Row key={topic.id}>
                  <Table.Cell primary>{topic.title}</Table.Cell>
                  <Table.Cell label={`${labels.DESCRIPTION}: `}>
                    <span className="line-clamp-[12] max-w-[80vw] text-ellipsis break-words md:line-clamp-3 md:max-w-[220px]">
                      {topic.description}
                    </span>
                  </Table.Cell>
                  <Table.Cell label={`${labels.TYPE}: `}>
                    {labels[topic.type.toUpperCase() as keyof typeof labels]}
                  </Table.Cell>
                  <Table.Cell label={`${labels.CAPACITY}: `}>
                    {topic._count.assignedStudents} / {topic.capacity}
                  </Table.Cell>
                  <Table.Cell>
                    <AssignedStudents topic={topic} />
                  </Table.Cell>
                  <Table.Cell>
                    <CoursePreferences topicId={topic.id} />
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <Dialog>
                        <Dialog.Trigger
                          title={labels.EDIT}
                          className="btn-outline btn-primary btn-md md:btn-circle"
                          label={
                            <span className="md:hidden">{labels.EDIT}</span>
                          }
                          icon={<Pencil1Icon width={20} height={20} />}
                        />
                        <Dialog.Body className="px-3 py-0">
                          <Dialog.Header headerTitle={labels.EDIT_TOPIC} />

                          <TopicForm topicToEdit={topic as TopicToEdit} />
                        </Dialog.Body>
                      </Dialog>

                      <Dialog>
                        <Dialog.Trigger
                          className="btn-outline btn-error btn-md md:btn-circle"
                          title={labels.DELETE}
                          label={
                            <span className="md:hidden">{labels.DELETE}</span>
                          }
                          icon={<Cross1Icon width={20} height={20} />}
                        />
                        <Dialog.Body className="animate-pop-in rounded-md px-3 py-0 shadow-2xl">
                          <Dialog.Header headerTitle={labels.DELETE_TOPIC} />
                          <p className="m-3">{labels.DELETE_TOPIC_CONFIRM}</p>
                          <p className="m-3">
                            {labels.TITLE}:{' '}
                            <span className="font-bold">{topic.title}</span>
                          </p>

                          <Dialog.Footer
                            okAction={() =>
                              deleteTopicMutation.mutate(topic.id)
                            }
                          />
                        </Dialog.Body>
                      </Dialog>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </main>
  );
}
