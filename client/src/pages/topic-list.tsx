import {
  CaretUpIcon,
  Cross2Icon,
  InfoCircledIcon,
  PlusIcon,
} from '@radix-ui/react-icons';
import {
  useCreateTopicPreference,
  useDeleteTopicPreference,
  useGetAssignedTopicsForStudent,
  useGetInstructors,
  useGetTopics,
} from '@/queries';
import Spinner from '@/components/ui/spinner';
import { cn, formatDate } from '@/utils';
import { useSession } from '@/contexts/session/session-context';
import Input from '@/components/ui/input';
import ComboBox from '@/components/ui/combo-box';
import { SetStateAction, useMemo, useState } from 'react';
import Dialog from '@/components/ui/dialog/dialog';
import { GetTopicsOutput } from '@api/topic';
import { useLabels } from '@/contexts/labels/label-context';
import Table from '@/components/ui/table';
import { Topic } from '@lti/server/src/db';
import { useDialog } from '@/components/ui/dialog/dialog-context';
import { localeOptions } from '@lti/server/src/labels';

export default function TopicList({
  onSelectTopicId,
}: {
  onSelectTopicId?: (topicId: Topic['id']) => void;
}) {
  const session = useSession();
  const { data: topics, isLoading, isError } = useGetTopics();
  const { labels } = useLabels();

  const columns = {
    title: labels.TITLE,
    language: labels.LANGUAGE,
    instructorName: labels.INSTRUCTOR,
    type: labels.TYPE,
    description: labels.DESCRIPTION,
  };

  const [filter, setFilter] = useState({
    title: '',
    language: 'all',
    type: 'all',
    instructorId: 'all',
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
        const languageMatch =
          filter.language === 'all' || topic.language === filter.language;
        const typeMatch = filter.type === 'all' || topic.type === filter.type;
        const instructorMatch =
          filter.instructorId === 'all' ||
          topic.instructorId === filter.instructorId;

        return titleMatch && languageMatch && typeMatch && instructorMatch;
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
    return <div>{labels.ERROR}</div>;
  }

  return (
    <div className="mx-auto max-w-4xl p-3 flex flex-col gap-3">
      <h2 className="text-2xl">{labels.ANNOUNCED_TOPICS}</h2>

      <Filter filter={filter} setFilter={setFilter} />

      <div className="overflow-x-auto rounded-md border md:p-10">
        <Table>
          <Table.Caption>{labels.ANNOUNCED_TOPICS}</Table.Caption>
          <Table.Head>
            <tr>
              {Object.entries(columns).map(([key, label]) => (
                <th
                  key={key}
                  className="cursor-pointer p-3 hover:bg-gray-200"
                  onClick={() =>
                    handleChangeSorting(key as keyof typeof columns)
                  }
                >
                  <div className="flex items-center">
                    {label}

                    <CaretUpIcon
                      className={cn('inline invisible', {
                        visible: sorting.key === key,
                        'rotate-180':
                          sorting.key === key && sorting.order === 'desc',
                      })}
                      width={20}
                      height={20}
                    />
                  </div>
                </th>
              ))}
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
            ) : filteredTopics?.length === 0 ? (
              <tr>
                {
                  // @ts-ignore reason: colspan expects number, but "100%" is valid
                  <td colSpan="100%">
                    <p className="text-center text-xl">
                      {labels.NO_RECORDS_FOUND}...
                    </p>
                  </td>
                }
              </tr>
            ) : (
              sortedTopics!.map((topic) => (
                <Table.Row
                  key={topic.id}
                  className={cn({
                    'bg-emerald-100': topic.isAddedToPreferences,
                    'hover:bg-emerald-200': topic.isAddedToPreferences,
                    'hover:bg-gray-200': !topic.isAddedToPreferences,
                  })}
                >
                  <Table.Cell primary>{topic.title}</Table.Cell>

                  <Table.Cell label={`${labels.LANGUAGE}: `}>
                    {topic.language}
                  </Table.Cell>

                  <Table.Cell label={`${labels.INSTRUCTOR}: `}>
                    {topic.instructor.name}
                  </Table.Cell>

                  <Table.Cell label={`${labels.TYPE}: `}>
                    {labels[topic.type.toUpperCase() as keyof typeof labels]}
                  </Table.Cell>

                  <Table.Cell label={`${labels.DESCRIPTION}: `}>
                    <span className="line-clamp-[12] max-w-[80vw] md:max-w-[250px]  text-ellipsis break-words md:line-clamp-3">
                      {topic.description}
                    </span>
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex flex-wrap gap-1 md:flex-nowrap">
                      {session.isStudent &&
                        (!topic.isAddedToPreferences ? (
                          <AddButton topicId={topic.id} />
                        ) : (
                          <DeleteButton topicId={topic.id} />
                        ))}
                      {session.isAdmin && onSelectTopicId ? (
                        <SelectTopicButton
                          onClick={() => onSelectTopicId(topic.id)}
                        />
                      ) : (
                        <TopicInfoModal topic={topic} />
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </tbody>
        </Table>
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
    language: string;
    type: string;
    instructorId: string;
  };
  setFilter: React.Dispatch<SetStateAction<typeof filter>>;
}) {
  const { data: instructors } = useGetInstructors();
  const { labels: labels } = useLabels();

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
    <div className="bg-gray-50 rounded-md flex flex-col gap-3 items-start p-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 items-center p-1 rounded-md">
          <label className="min-w-[7ch] md:min-w-fit" htmlFor="titleFilter">
            {labels.TITLE}:
          </label>
          <Input
            id="titleFilter"
            placeholder={`${labels.TITLE}...`}
            value={filter.title}
            onChange={(e) => handleFilterChange('title', e.target.value)}
          />
        </div>

        <div className="flex gap-1 items-center p-1 rounded-md">
          <label className="min-w-[7ch] md:min-w-fit">{labels.LANGUAGE}:</label>
          <ComboBox
            value={filter.language}
            options={[
              {
                label: labels.ALL,
                value: 'all',
              },
              ...localeOptions.map((locale) => ({
                value: locale,
                label: locale,
              })),
            ]}
            placeholder={labels.SELECT_INSTRUCTOR}
            onChange={(value) =>
              handleFilterChange('language', value.toString())
            }
          />
        </div>

        <div className="flex gap-1 items-center p-1 rounded-md">
          <label className="min-w-[7ch] md:min-w-fit">
            {labels.INSTRUCTOR}:
          </label>
          <ComboBox
            value={filter.instructorId}
            options={[
              {
                label: labels.ALL,
                value: 'all',
              },
              ...(instructors
                ?.toSorted((a, b) => a.name.localeCompare(b.name))
                .map((instructor) => ({
                  value: instructor.id,
                  label: instructor.name,
                })) ?? []),
            ]}
            placeholder={labels.SELECT_INSTRUCTOR}
            onChange={(value) =>
              handleFilterChange('instructorId', value.toString())
            }
          />
        </div>

        <div className="flex gap-1 items-center p-1 rounded-md">
          <label className="min-w-[7ch] md:min-w-fit">{labels.TYPE}:</label>
          <ComboBox
            withoutSearch
            value={filter.type}
            options={[
              {
                value: 'all',
                label: labels.ALL,
              },
              {
                value: 'normal',
                label: labels.NORMAL,
              },
              {
                value: 'tdk',
                label: labels.TDK,
              },
              {
                value: 'research',
                label: labels.RESEARCH,
              },
              {
                value: 'internship',
                label: labels.INTERNSHIP,
              },
            ]}
            id="type"
            name="type"
            placeholder="Válassza ki a téma típusát"
            onChange={(value) => handleFilterChange('type', value.toString())}
          />
        </div>
      </div>
      <button
        className="px-3 py-1 bg-sky-200 rounded-md hover:bg-sky-300 disabled:hover:bg-gray-300 disabled:bg-gray-300 transition"
        disabled={
          filter.title === '' &&
          filter.language === 'all' &&
          filter.type === 'all' &&
          filter.instructorId === 'all'
        }
        onClick={() =>
          setFilter({
            title: '',
            language: 'all',
            type: 'all',
            instructorId: 'all',
          })
        }
      >
        {labels.CLEAR_FILTERS}
      </button>
    </div>
  );
}

function AddButton({ topicId }: { topicId: string }) {
  const createTopicPreference = useCreateTopicPreference();
  const { labels } = useLabels();
  const { data, isLoading, isError } = useGetAssignedTopicsForStudent();

  if (isLoading) {
    return;
  }

  if (isError) {
    return <div>{labels.ERROR}</div>;
  }

  if (data.assignedTopic) {
    return;
  }

  return (
    <button
      className={cn(
        'flex items-center gap-2 rounded-md bg-emerald-100 px-2 py-1 text-emerald-800 transition hover:bg-emerald-300 md:p-2 md:py-2',
        {
          'pointer-events-none': createTopicPreference.isLoading,
        },
      )}
      title={labels.ADD_TO_PREFERENCE_LIST}
      onClick={() => {
        if (!createTopicPreference.isLoading) {
          createTopicPreference.mutate({ topicId });
        }
      }}
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

function DeleteButton({ topicId }: { topicId: string }) {
  const deleteTopicPreference = useDeleteTopicPreference();
  const { labels: labels } = useLabels();
  const { data, isLoading, isError } = useGetAssignedTopicsForStudent();

  if (isLoading) {
    return;
  }

  if (isError) {
    return <div>{labels.ERROR}</div>;
  }

  if (data.assignedTopic) {
    return;
  }

  return (
    <button
      title={labels.REMOVE_FROM_PREFERENCE_LIST}
      className={cn(
        'flex items-center gap-2 rounded-md bg-red-100 px-2 py-1 text-red-800 transition hover:bg-red-300',
        {
          'pointer-events-none': deleteTopicPreference.isLoading,
        },
      )}
      onClick={() => {
        if (!deleteTopicPreference.isLoading) {
          deleteTopicPreference.mutate(topicId);
        }
      }}
    >
      {deleteTopicPreference.isLoading ? (
        <Spinner className="pointer-events-none" width={25} height={25} />
      ) : (
        <Cross2Icon className="pointer-events-none" width={25} height={25} />
      )}
      <span className="md:hidden">{labels.REMOVE_FROM_PREFERENCE_LIST}</span>
    </button>
  );
}

function TopicInfoModal({ topic }: { topic: GetTopicsOutput[number] }) {
  const { labels: labels } = useLabels();

  return (
    <Dialog>
      <Dialog.Trigger
        className="
          flex items-center gap-2 rounded-md bg-sky-200 px-2 py-1
          text-sky-900 transition hover:bg-sky-300 md:p-2 md:py-2
        "
        buttonIcon={<InfoCircledIcon width={25} height={25} />}
        buttonTitle={<span className="md:hidden">{labels.DETAILS}</span>}
      />

      <Dialog.Body className="animate-pop-in min-w-[15rem] rounded-md px-3 py-0 shadow-2xl">
        <Dialog.Header headerTitle={topic.title} />
        <div className="grid grid-cols-[auto_1fr] gap-3">
          <span className="font-bold">{labels.INSTRUCTOR}:</span>
          <span>{topic.instructor.name}</span>
          <span className="font-bold">{labels.DESCRIPTION}:</span>
          <pre className="max-w-[60vw] whitespace-pre-wrap">
            {topic.description}
          </pre>
          <span className="font-bold">{labels.TYPE}:</span>
          <span>{labels[topic.type.toUpperCase() as keyof typeof labels]}</span>
          <span className="font-bold">{labels.LANGUAGE}:</span>
          <span>{topic.language}</span>
          <span className="font-bold">{labels.RESEARCH_QUESTION}:</span>
          <span>{topic.researchQuestion ?? `(${labels.NOT_SPECIFIED})`}</span>
          <span className="font-bold">{labels.RECOMMENDED_LITERATURE}:</span>
          {topic.recommendedLiterature ? (
            <pre className="max-w-[60vw] whitespace-pre-wrap">
              {topic.recommendedLiterature}
            </pre>
          ) : (
            <span>{`(${labels.NOT_SPECIFIED})`}</span>
          )}

          <span className="font-bold">{labels.CREATED_AT}:</span>
          <span>{formatDate(topic.createdAt)}</span>
          <span className="font-bold">{labels.UPDATED_AT}:</span>
          <span>{formatDate(topic.updatedAt)}</span>
        </div>

        <Dialog.Footer
          closeButtonText={labels.CLOSE}
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

function SelectTopicButton({ onClick }: { onClick: () => void }) {
  const { closeDialog } = useDialog();
  return (
    <button
      className="flex items-center gap-2 rounded-md bg-emerald-200 px-2 py-1 text-emerald-900 transition hover:bg-emerald-300 md:p-2 md:py-2"
      onClick={() => {
        onClick();
        closeDialog();
      }}
    >
      <PlusIcon width={25} height={25} />
    </button>
  );
}
