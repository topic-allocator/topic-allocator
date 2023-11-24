import TopicForm from '@/components/topic-form';
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
    <div className="mx-auto max-w-4xl px-3">
      <div className="mt-3 flex items-center gap-3">
        <h2 className="p-3 text-2xl">{labels.OWN_TOPICS}</h2>

        <Dialog>
          <Dialog.Trigger
            className="flex items-center rounded-md bg-emerald-200 px-2 py-1 text-emerald-950 transition hover:bg-emerald-300"
            buttonIcon={
              <PlusIcon
                className="pointer-events-none"
                width={25}
                height={25}
              />
            }
            buttonTitle={labels.CREATE}
          />

          <Dialog.Body className="animate-pop-in rounded-md px-3 py-0 shadow-2xl">
            <Dialog.Header headerTitle={labels.CREATE_NEW_TOPIC} />

            <TopicForm />
          </Dialog.Body>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-md md:border md:p-10">
        <Table>
          <Table.Caption>{labels.ANNOUNCED_TOPICS}</Table.Caption>
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
                  <Table.Cell primary label="Cím: ">
                    {topic.title}
                  </Table.Cell>
                  <Table.Cell label={`${labels.DESCRIPTION}: `}>
                    {topic.description}
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
                    <div className="flex gap-3 items-center">
                      <Dialog>
                        <Dialog.Trigger
                          title="edit"
                          className="rounded-full bg-transparent bg-sky-50 text-sky-700 p-2 transition hover:bg-sky-200"
                          buttonTitle={
                            <span className="md:hidden pointer-events-none px-3 py-1">
                              {labels.EDIT}
                            </span>
                          }
                          buttonIcon={
                            <Pencil1Icon
                              width={20}
                              height={20}
                              className="pointer-events-none"
                            />
                          }
                        />
                        <Dialog.Body className="animate-pop-in rounded-md px-3 py-0 shadow-2xl">
                          <Dialog.Header headerTitle={labels.EDIT_TOPIC} />

                          <TopicForm topicToEdit={topic} />
                        </Dialog.Body>
                      </Dialog>

                      <Dialog>
                        <Dialog.Trigger
                          className="rounded-full bg-transparent p-2 text-red-600 transition bg-red-50 hover:bg-red-300"
                          title="delete"
                          buttonTitle={
                            <span className="md:hidden pointer-events-none px-3 py-1">
                              {labels.DELETE}
                            </span>
                          }
                          buttonIcon={
                            <Cross1Icon
                              width={20}
                              height={20}
                              className="pointer-events-none text-red-600"
                            />
                          }
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

            {}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
