import { Cross2Icon, PlusIcon } from '@radix-ui/react-icons';
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
import Table from '../components/ui/Table';
import { SetStateAction, useMemo, useState } from 'react';

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

  const filteredTopics = useMemo(() => {
    return topics?.filter((topic) => {
      const titleMatch = topic.title
        .toLowerCase()
        .includes(filter.title.toLowerCase());
      const typeMatch = filter.type === 'all' || topic.type === filter.type;
      const instructorMatch =
        filter.instructorId < 0 || topic.instructorId === filter.instructorId;

      return titleMatch && typeMatch && instructorMatch;
    });
  }, [topics, filter]);

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
              <th className="p-3">Cím</th>
              <th className="p-3">Oktató</th>
              <th className="p-3">Típus</th>
              <th className="p-3">Leírás</th>
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
              filteredTopics?.map((topic) => (
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

                  <td className="block p-3 md:table-cell">
                    <span className="font-bold md:hidden">Oktató: </span>
                    {topic.instructor.name}
                  </td>

                  <td className="block p-3 md:table-cell">
                    <span className="font-bold md:hidden">Típus: </span>
                    {topic.type}
                  </td>

                  <td className="block p-3 md:table-cell">
                    <span className="font-bold md:hidden">Leírás: </span>
                    {topic.description}
                  </td>

                  {session.isStudent && (
                    <td className="block p-3 pt-0 md:table-cell md:pt-3">
                      {!topic.isAddedToPreferences ? (
                        <AddButton topicId={topic.id} />
                      ) : (
                        <DeleteButton topicId={topic.id} />
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* <Table */}
        {/*   data={topics?.map(({ id, title, description, type, instructor }) => ({ */}
        {/*     id: id.toString(), */}
        {/*     title, */}
        {/*     description, */}
        {/*     type, */}
        {/*     instructor: instructor.name, */}
        {/*   }))} */}
        {/*   buttons={(topic) => */}
        {/*     session.isStudent */}
        {/*       ? [ */}
        {/*           !topic.isAddedToPreferences ? ( */}
        {/*             <button */}
        {/*               className="flex items-center rounded-full bg-emerald-100 text-emerald-800 transition hover:bg-emerald-300" */}
        {/*               title="add to preferences" */}
        {/*               onClick={() => */}
        {/*                 createTopicPreference.mutate(Number(topic.id)) */}
        {/*               } */}
        {/*             > */}
        {/*               <PlusIcon */}
        {/*                 className="pointer-events-none" */}
        {/*                 width={30} */}
        {/*                 height={30} */}
        {/*               /> */}
        {/*             </button> */}
        {/*           ) : ( */}
        {/*             <button */}
        {/*               title="remove from preferences" */}
        {/*               className="flex items-center rounded-full bg-red-100 text-red-800 transition hover:bg-red-300" */}
        {/*               onClick={() => */}
        {/*                 deleteTopicPreference.mutate(Number(topic.id)) */}
        {/*               } */}
        {/*             > */}
        {/*               <Cross2Icon */}
        {/*                 className="pointer-events-none" */}
        {/*                 width={30} */}
        {/*                 height={30} */}
        {/*               /> */}
        {/*             </button> */}
        {/*           ), */}
        {/*         ] */}
        {/*       : [] */}
        {/*   } */}
        {/*   labels={{ */}
        {/*     title: 'Cím', */}
        {/*     description: 'Leírás', */}
        {/*     type: 'Típus', */}
        {/*     instructor: 'Oktató', */}
        {/*   }} */}
        {/*   rowClassName={({ isAddedToPreferences }) => */}
        {/*     cn('border-b hover:bg-gray-100', { */}
        {/*       'bg-emerald-50': isAddedToPreferences, */}
        {/*       'hover:bg-emerald-100': isAddedToPreferences, */}
        {/*     }) */}
        {/*   } */}
        {/* /> */}
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
        onSelect={(value) => handleFilterChange('instructorId', Number(value))}
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
        onSelect={(value) => handleFilterChange('type', value.toString())}
      />
    </div>
  );
}

function AddButton({ topicId }: { topicId: number }) {
  const createTopicPreference = useCreateTopicPreference();

  return (
    <button
      className="flex items-center rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 transition hover:bg-emerald-300"
      title="add to preferences"
      onClick={() => createTopicPreference.mutate(topicId)}
    >
      {createTopicPreference.isLoading ? (
        <Spinner className="pointer-events-none" width={25} height={25} />
      ) : (
        <PlusIcon className="pointer-events-none" width={25} height={25} />
      )}
      <span className="md:hidden">Preferencia listához adás</span>
    </button>
  );
}

function DeleteButton({ topicId }: { topicId: number }) {
  const deleteTopicPreference = useDeleteTopicPreference();

  return (
    <button
      title="remove from preferences"
      className="flex items-center rounded-full bg-red-100 px-3 py-1 text-red-800 transition hover:bg-red-300"
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
