import TopicForm from '../components/TopicForm';
import Dialog from '../components/ui/dialog/Dialog';
import { Cross1Icon, Pencil1Icon, PlusIcon } from '@radix-ui/react-icons';
import { useDeleteOwnTopic, useGetOwnTopics } from '../queries';
import CoursePreferences from '../components/CoursePreferences';

export default function OwnTopics() {
  const { data: topics, isLoading, isError } = useGetOwnTopics();
  const deleteTopicMutation = useDeleteOwnTopic();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-3">
      <div className="mt-3 flex items-center gap-3">
        <h2 className="p-3 text-2xl">Saját témák</h2>

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
            buttonTitle="Hozzáadás"
          />

          <Dialog.Body className="animate-pop-in rounded-md px-3 py-0 shadow-2xl">
            <Dialog.Header headerTitle="Új téma létrehozása" />

            <TopicForm />
          </Dialog.Body>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-md border p-10">
        <table
          className="h-1 w-full min-w-[700px] caption-bottom"
          border={1}
          rules="rows"
        >
          <caption className="mt-4 text-gray-500">Meghirdetett témák</caption>
          <thead className="border-b text-left">
            <tr>
              <th className="p-3">Cím</th>
              <th className="p-3">Leírás</th>
              <th className="p-3">Típus</th>
              <th className="p-3">Kapacitás</th>
              <th className="p-3">Súlyok</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => (
              <tr
                key={topic.id}
                className="border-b transition hover:bg-gray-100"
              >
                <td className="p-3">{topic.title}</td>
                <td className="p-3">{topic.description}</td>
                <td className="p-3">{topic.type}</td>
                <td className="p-3">{topic.capacity}</td>
                <td className="p-3">
                  <CoursePreferences topicId={topic.id} />
                </td>

                <td className="inline-flex h-full items-center justify-end gap-3 p-3">
                  <Dialog>
                    <Dialog.Trigger
                      title="edit"
                      className="rounded-full bg-transparent p-2 transition hover:bg-sky-200"
                      buttonIcon={
                        <Pencil1Icon
                          width={20}
                          height={20}
                          className="pointer-events-none text-sky-600"
                        />
                      }
                    />
                    <Dialog.Body className="animate-pop-in rounded-md px-3 py-0 shadow-2xl">
                      <Dialog.Header headerTitle="Téma szerkesztése" />

                      <TopicForm topicToEdit={topic} />
                    </Dialog.Body>
                  </Dialog>

                  <Dialog>
                    <Dialog.Trigger
                      className="rounded-full bg-transparent p-2 transition hover:bg-red-300"
                      buttonIcon={
                        <Cross1Icon
                          width={20}
                          height={20}
                          className="pointer-events-none text-red-600"
                        />
                      }
                    />
                    <Dialog.Body className="animate-pop-in rounded-md px-3 py-0 shadow-2xl">
                      <Dialog.Header headerTitle="Téma törlése" />
                      <p className="m-3">Biztosan törli a témát?</p>
                      <p className="m-3">
                        Cím: <span className="font-bold">{topic.title}</span>
                      </p>

                      <Dialog.Footer
                        okAction={() => deleteTopicMutation.mutate(topic.id)}
                      />
                    </Dialog.Body>
                  </Dialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
