import CreateTopicForm from '../components/CreateTopicForm';
import Modal from '../components/ui/modal/Modal';
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
      <div className="mt-3 flex items-center gap-3 border-b-[1px]">
        <h2 className="text-2xl">Meghirdetett témák</h2>

        <Modal>
          <Modal.Trigger
            buttonIcon={<PlusIcon className="pointer-events-none" width={30} height={30} />}
          />

          <Modal.Body className="rounded-md px-3 py-0">
            <Modal.Header headerTitle="Új téma létrehozása" />

            <CreateTopicForm />
          </Modal.Body>
        </Modal>
      </div>

      <ul>
        {topics.map((topic) => (
          <li key={topic.id}>{JSON.stringify(topic)}</li>
        ))}
      </ul>
    </div>
  );
}
