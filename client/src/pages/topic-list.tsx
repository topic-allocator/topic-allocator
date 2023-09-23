import {
  CaretDownIcon,
  CaretUpIcon,
  Cross2Icon,
  InfoCircledIcon,
  PlusIcon,
} from '@radix-ui/react-icons';
import {
  useCreateTopicPreference,
  useDeleteTopicPreference,
  useGetInstructors,
  useGetTopics,
} from '../queries';
import Spinner from '../components/ui/Spinner';
import { cn } from '../utils';
import { useSession } from '../contexts/session/sessionContext';
import Input from '../components/ui/Input';
import ComboBox from '../components/ui/ComboBox';
import { SetStateAction, useMemo, useState } from 'react';
import Dialog from '../components/ui/dialog/Dialog';
import { GetTopicsResponse } from '@api/topic';
import { useLabel } from '../contexts/labels/labelContext';

const columns = {
  title: 'Cím',
  instructorName: 'Oktató',
  type: 'Típus',
  description: 'Leírás',
} as const;

export default function TopicList() {
  const session = useSession();
  const { data: topics, isLoading, isError } = useGetTopics();
  const createTopicPreference = useCreateTopicPreference();
  const deleteTopicPreference = useDeleteTopicPreference();

  const [filter, setFilter] = useState({
    title: '',
    type: 'all',
    instructorId: -1,
  });

  const [sorting, setSorting] = useState<{
    key: keyof typeof columns;
    order: 'asc' | 'desc';
  }>({
    key: 'title',
    order: 'asc',
  });

  function handleChangeSorting(key: keyof typeof columns) {
    setSorting((prev) => {
      if (prev.key === key) {
        return {
          key,
          order: prev.order === 'asc' ? 'desc' : 'asc',
        };
      }

      return {
        key,
        order: 'asc',
      };
    });
  }

  const filteredTopics = useMemo(() => {
    return topics
      ?.map((t) => ({ ...t, instructorName: t.instructor.name }))
      .filter((topic) => {
        const titleMatch = topic.title
          .toLowerCase()
          .includes(filter.title.toLowerCase());
        const typeMatch = filter.type === 'all' || topic.type === filter.type;
        const instructorMatch =
          filter.instructorId < 0 || topic.instructorId === filter.instructorId;

        return titleMatch && typeMatch && instructorMatch;
      });
  }, [topics, filter]);

  const sortedTopics = useMemo(() => {
    return filteredTopics?.toSorted((a, b) => {
      if (sorting.order === 'asc') {
        return a[sorting.key] > b[sorting.key] ? 1 : -1;
      }

      return a[sorting.key] < b[sorting.key] ? 1 : -1;
    });
  }, [filteredTopics, sorting]);

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-3">
      <h2 className="p-3 text-2xl">Meghirdetett témák</h2>

      <Filter filter={filter} setFilter={setFilter} />

      <div className="overflow-x-auto rounded-md border md:p-10">
        <table
          className="h-1 min-h-[300px] w-full caption-bottom md:min-w-[700px]"
          border={1}
          rules="rows"
        >
          <caption className="mt-4 text-gray-500">Meghirdetett témák</caption>
          <thead className="hidden border-b bg-gray-100 text-left md:table-header-group">
            <tr>
              {Object.entries(columns).map(([key, label]) => (
                <th
                  className="cursor-pointer p-3 hover:bg-gray-200"
                  onClick={() =>
                    handleChangeSorting(key as keyof typeof columns)
                  }
                >
                  <span>{label}</span>
                  {sorting.key === key && sorting.order === 'asc' && (
                    <CaretUpIcon className="inline" width={20} height={20} />
                  )}

                  {sorting.key === key && sorting.order === 'desc' && (
                    <CaretDownIcon className="inline" width={20} height={20} />
                  )}
                </th>
              ))}
              <th></th>
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
            ) : filteredTopics?.length === 0 ? (
              <tr>
                {
                  // @ts-ignore reason: colspan expects number, but "100%" is valid
                  <td colSpan="100%">
                    <p className="text-center text-xl">
                      Nincsenek megjeleníthető találatok...
                    </p>
                  </td>
                }
              </tr>
            ) : (
              sortedTopics!.map((topic) => (
                <tr
                  key={topic.id}
                  className={cn(
                    'mb-3 border md:border-x-0 md:border-b md:border-t-0',
                    {
                      'bg-emerald-100': topic.isAddedToPreferences,
                      'hover:bg-emerald-200': topic.isAddedToPreferences,
                      'hover:bg-gray-200': !topic.isAddedToPreferences,
                    },
                  )}
                  onDoubleClick={() =>
                    session.isStudent &&
                    (topic.isAddedToPreferences
                      ? deleteTopicPreference.mutate(topic.id)
                      : createTopicPreference.mutate(topic.id))
                  }
                >
                  <td className="block bg-gray-100 p-3 text-xl font-bold md:table-cell md:bg-inherit md:text-base md:font-normal">
                    {topic.title}
                  </td>

                  <td className="block px-3 py-1 md:table-cell ">
                    <span className="font-bold md:hidden">Oktató: </span>
                    {topic.instructor.name}
                  </td>

                  <td className="block px-3 py-1 md:table-cell ">
                    <span className="font-bold md:hidden">Típus: </span>
                    {topic.type}
                  </td>

                  <td className="block px-3 py-1 md:table-cell ">
                    <span className="font-bold md:hidden">Leírás: </span>
                    <span className="line-clamp-[12] md:line-clamp-2">
                      {topic.description}
                    </span>
                  </td>

                  {session.isStudent && (
                    <td className="block px-3 py-1 md:table-cell">
                      <div className="flex flex-wrap gap-1 md:flex-nowrap">
                        {!topic.isAddedToPreferences ? (
                          <AddButton topicId={topic.id} />
                        ) : (
                          <DeleteButton topicId={topic.id} />
                        )}
                        <TopicInfoModal topic={topic} />
                      </div>
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

function Filter({
  filter,
  setFilter,
}: {
  filter: {
    title: string;
    type: string;
    instructorId: number;
  };
  setFilter: React.Dispatch<SetStateAction<typeof filter>>;
}) {
  const { data: instructors } = useGetInstructors();

  function handleFilterChange(
    key: keyof typeof filter,
    value: string | number,
  ) {
    setFilter((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  return (
    <div className="flex flex-wrap gap-3 pb-3">
      <Input
        id="titleFilter"
        placeholder="Cím..."
        value={filter.title}
        onChange={(e) => handleFilterChange('title', e.target.value)}
      />

      <ComboBox
        value={filter.instructorId}
        options={[
          {
            label: 'Összes',
            value: -1,
          },
          ...(instructors
            ?.toSorted((a, b) => a.name.localeCompare(b.name))
            .map((instructor) => ({
              value: instructor.id,
              label: instructor.name,
            })) ?? []),
        ]}
        placeholder="Válassza ki az oktatót"
        onChange={(value) => handleFilterChange('instructorId', Number(value))}
      />

      <ComboBox
        withoutSearch
        value={filter.type}
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
        onChange={(value) => handleFilterChange('type', value.toString())}
      />
    </div>
  );
}

function AddButton({ topicId }: { topicId: number }) {
  const createTopicPreference = useCreateTopicPreference();
  const { labels } = useLabel();

  return (
    <button
      className="flex items-center gap-2 rounded-md bg-emerald-100 px-2 py-1 text-emerald-800 transition hover:bg-emerald-300 md:p-2 md:py-2"
      title="add to preferences"
      onClick={() => createTopicPreference.mutate(topicId)}
    >
      {createTopicPreference.isLoading ? (
        <Spinner className="pointer-events-none" width={25} height={25} />
      ) : (
        <PlusIcon className="pointer-events-none" width={25} height={25} />
      )}
      <span className="md:hidden">{labels.ADD_TO_PREFERENCE_LIST}</span>
    </button>
  );
}

function DeleteButton({ topicId }: { topicId: number }) {
  const deleteTopicPreference = useDeleteTopicPreference();

  return (
    <button
      title="remove from preferences"
      className="flex items-center gap-2 rounded-md bg-red-100 px-2 py-1 text-red-800 transition hover:bg-red-300"
      onClick={() => deleteTopicPreference.mutate(topicId)}
    >
      {deleteTopicPreference.isLoading ? (
        <Spinner className="pointer-events-none" width={25} height={25} />
      ) : (
        <Cross2Icon className="pointer-events-none" width={25} height={25} />
      )}
      <span className="md:hidden">Eltávolítás a preferencia listából</span>
    </button>
  );
}

function TopicInfoModal({ topic }: { topic: GetTopicsResponse[number] }) {
  return (
    <Dialog>
      <Dialog.Trigger
        className="
          flex items-center gap-2 rounded-md bg-sky-200 px-2 py-1
          text-sky-900 transition hover:bg-sky-300 md:p-2 md:py-2
        "
        buttonIcon={<InfoCircledIcon width={25} height={25} />}
        buttonTitle={<span className="md:hidden">Részletek</span>}
      />

      <Dialog.Body className="pop-in min-w-[15rem] rounded-md px-3 py-0 shadow-2xl">
        <Dialog.Header headerTitle={topic.title} />

        <p>
          <span className="font-bold">Oktató:</span> {topic.instructor.name}
        </p>
        <p>
          <span className="font-bold">Típus:</span> {topic.type}
        </p>
        <p>
          <span className="font-bold">Leírás:</span>
          <p>{topic.description}</p>
        </p>

        <Dialog.Footer
          closeButtonText="Bezár"
          okButton={
            <button className="my-1 rounded-md bg-red-400 px-3 py-1 transition hover:bg-red-500">
              PDF export
            </button>
          }
        />
      </Dialog.Body>
    </Dialog>
  );
}
