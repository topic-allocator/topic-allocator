import CreateTopicForm from '../components/CreateTopicForm';
import Dialog from '../components/ui/dialog/Dialog';
import { PlusIcon } from '@radix-ui/react-icons';
import { useGetTopics } from '../queries';

export default function OwnTopics() {
  const { data: topics, isLoading, isError } = useGetTopics();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-3">
      <div className="mt-3 flex items-center gap-3 border-b">
        <h2 className="text-2xl">Meghirdetett témák</h2>

        <Dialog>
          <Dialog.Trigger
            buttonIcon={<PlusIcon className="pointer-events-none" width={30} height={30} />}
          />

          <Dialog.Body className="pop-in rounded-md px-3 py-0 shadow-2xl">
            <Dialog.Header headerTitle="Új téma létrehozása" />

            <CreateTopicForm />
          </Dialog.Body>
        </Dialog>
      </div>

      <ul>
        {topics.map((topic) => (
          <li key={topic.id}>{JSON.stringify(topic)}</li>
        ))}
      </ul>
    </div>
  );
}
