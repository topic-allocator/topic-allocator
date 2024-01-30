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
import Button from '@/components/ui/button';

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
    <main className="mx-auto flex max-w-5xl flex-col gap-3 p-3">
      <h2 className="text-2xl">{labels.ANNOUNCED_TOPICS}</h2>

      <Filter filter={filter} setFilter={setFilter} />

      <div className="card overflow-x-auto border border-neutral-500/50 bg-base-300 md:p-5">
        <Table>
          <Table.Caption>{labels.ANNOUNCED_TOPICS}</Table.Caption>
          <Table.Head>
            <tr>
              {Object.entries(columns).map(([key, label]) => (
                <th
                  key={key}
                  className="cursor-pointer hover:bg-base-100"
                  onClick={() =>
                    handleChangeSorting(key as keyof typeof columns)
                  }
                >
                  <div className="flex items-center">
                    {label}

                    <CaretUpIcon
                      className={cn('invisible inline transition', {
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
                    'bg-success text-success-content':
                      topic.isAddedToPreferences,
                    'md:hover:bg-base-100': !topic.isAddedToPreferences,
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
                    <span className="line-clamp-[12] max-w-[80vw] text-ellipsis  break-words md:line-clamp-3 md:max-w-[250px]">
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
    </main>
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
  const { labels } = useLabels();

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
    <div className="collapse collapse-arrow overflow-visible border border-neutral-500/50 bg-base-300">
      <input type="checkbox" className="peer" />
      <div className="collapse-title text-xl">{labels.FILTER}</div>
      <div className="collapse-content flex flex-col items-start gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="form-control">
            <div className="label">
              <span className="label-text">{labels.TITLE}</span>
            </div>

            <Input
              name="titleFilter"
              className="input-sm"
              placeholder={`${labels.TITLE}...`}
              value={filter.title}
              onChange={(e) => handleFilterChange('title', e.target.value)}
            />
          </label>

          <label className="form-control" onClick={(e) => e.preventDefault()}>
            <div className="label">
              <span className="label-text">{labels.LANGUAGE}</span>
            </div>

            <ComboBox
              name="languageFilter"
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
          </label>

          <label className="form-control" onClick={(e) => e.preventDefault()}>
            <div className="label">
              <span className="label-text">{labels.INSTRUCTOR}</span>
            </div>

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
          </label>

          <label className="form-control" onClick={(e) => e.preventDefault()}>
            <div className="label">
              <span className="label-text">{labels.TYPE}</span>
            </div>

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
          </label>
        </div>

        <button
          className="btn btn-outline btn-primary btn-sm"
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
    <Button
      className="btn-success md:size-12"
      isLoading={createTopicPreference.isLoading}
      label={<span className="md:hidden">{labels.ADD_TO_PREFERENCE_LIST}</span>}
      title={labels.ADD_TO_PREFERENCE_LIST}
      icon={<PlusIcon className="pointer-events-none" width={25} height={25} />}
      onClick={() => {
        if (!createTopicPreference.isLoading) {
          createTopicPreference.mutate({ topicId });
        }
      }}
    />
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
    <Button
      className="btn-error md:size-12"
      isLoading={deleteTopicPreference.isLoading}
      label={
        <span className="md:hidden">{labels.REMOVE_FROM_PREFERENCE_LIST}</span>
      }
      title={labels.REMOVE_FROM_PREFERENCE_LIST}
      icon={
        <Cross2Icon className="pointer-events-none" width={25} height={25} />
      }
      onClick={() => {
        if (!deleteTopicPreference.isLoading) {
          deleteTopicPreference.mutate(topicId);
        }
      }}
    />
  );
}

function TopicInfoModal({ topic }: { topic: GetTopicsOutput[number] }) {
  const { labels: labels } = useLabels();

  return (
    <Dialog>
      <Dialog.Trigger
        className="btn-info md:size-12"
        buttonIcon={<InfoCircledIcon width={25} height={25} />}
        buttonTitle={<span className="md:hidden">{labels.DETAILS}</span>}
      />

      <Dialog.Body className="min-w-[15rem] animate-pop-in rounded-md px-3 py-0 shadow-2xl">
        <Dialog.Header headerTitle={topic.title} />
        <div className="grid grid-cols-[auto_1fr] gap-3 py-2">
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
          okButton={<Button className="btn-error">PDF export</Button>}
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
