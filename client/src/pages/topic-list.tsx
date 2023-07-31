import { Cross2Icon, PlusIcon } from '@radix-ui/react-icons';
import {
  useCreateTopicPreference,
  useDeleteTopicPreference,
  useGetTopics,
} from '../queries';
import Spinner from '../components/ui/Spinner';
import { cn } from '../utils';
import { useSession } from '../contexts/session/sessionContext';
import Input from '../components/ui/Input';
import ComboBox from '../components/ui/ComboBox';

export default function TopicList() {
  const session = useSession();
  const { data: topics, isLoading, isError } = useGetTopics();
  const createTopicPreference = useCreateTopicPreference();
  const deleteTopicPreference = useDeleteTopicPreference();

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-3">
      <h2 className="p-3 text-2xl">Meghirdetett témák</h2>

      <div className="overflow-x-auto rounded-md border p-10">
        <div className="flex gap-3">
          <Input id="titleFilter" placeholder="Cím..." />

          <ComboBox
            withoutSearch
            value="normal"
            options={[
              {
                value: 'all',
                label: 'Összes',
              },
              {
                value: 'normal',
                label: 'Normal',
              },
              {
                value: 'tdk',
                label: 'TDK',
              },
              {
                value: 'research',
                label: 'Research',
              },
              {
                value: 'internship',
                label: 'Internship',
              },
            ]}
            id="type"
            name="type"
            placeholder="Válassza ki a téma típusát"
            onSelect={(value) => console.log(value)}
          />
        </div>

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
              <th className="p-3">Oktató</th>
            </tr>
          </thead>
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
            ) : (
              topics.map((topic) => (
                <tr
                  key={topic.id}
                  className={cn('border-b transition hover:bg-gray-100', {
                    'bg-emerald-50': topic.isAddedToPreferences,
                    'hover:bg-emerald-100': topic.isAddedToPreferences,
                  })}
                  onDoubleClick={() =>
                    session.isStudent &&
                    (topic.isAddedToPreferences
                      ? deleteTopicPreference.mutate(topic.id)
                      : createTopicPreference.mutate(topic.id))
                  }
                >
                  <td className="p-3">{topic.title}</td>
                  <td className="p-3">{topic.description}</td>
                  <td className="p-3">{topic.type}</td>
                  <td className="p-3">{topic.instructor.name}</td>
                  {session.isStudent && (
                    <td>
                      {!topic.isAddedToPreferences ? (
                        <button
                          className="flex items-center rounded-full bg-emerald-100 text-emerald-800 transition hover:bg-emerald-300"
                          title="add to preferences"
                          onClick={() => createTopicPreference.mutate(topic.id)}
                        >
                          <PlusIcon
                            className="pointer-events-none"
                            width={30}
                            height={30}
                          />
                        </button>
                      ) : (
                        <button
                          title="remove from preferences"
                          className="flex items-center rounded-full bg-red-100 text-red-800 transition hover:bg-red-300"
                          onClick={() => deleteTopicPreference.mutate(topic.id)}
                        >
                          <Cross2Icon
                            className="pointer-events-none"
                            width={30}
                            height={30}
                          />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
