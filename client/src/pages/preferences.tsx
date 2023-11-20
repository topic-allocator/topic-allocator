import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  UpdateIcon,
  UploadIcon,
} from '@radix-ui/react-icons';
import Spinner from '@/components/ui/spinner';
import { useGetTopicPreferences, useUpdateTopicPreferences } from '@/queries';
import { cn } from '@/utils';
import { useEffect, useState } from 'react';
import { useLabels } from '@/contexts/labels/label-context';
import Table from '@/components/ui/table';

export default function Preferences() {
  const {
    data: preferences,
    isLoading,
    isError,
    isSuccess,
  } = useGetTopicPreferences();
  const { labels } = useLabels();
  const updateTopicPreferences = useUpdateTopicPreferences();

  const [preferencesState, setPreferencesState] = useState<
    NonNullable<typeof preferences>
  >(preferences ?? []);
  const [dragData, setDragData] = useState<
    | {
        id: string;
        index: number;
      }
    | undefined
  >();

  useEffect(() => {
    setPreferencesState(preferences ?? []);
  }, [preferences]);

  // TODO: should it save automatically?
  const isDirty = preferencesState.some(
    (preference, index) => preference.topicId !== preferences?.[index]?.topicId,
  );

  if (isError) {
    return <div>Error</div>;
  }

  function movePreference(id: string, to: number) {
    setPreferencesState((prev) => {
      const newPreferences = [...prev];

      const from = newPreferences.findIndex((p) => p.topicId === id);
      newPreferences.splice(to, 0, newPreferences.splice(from, 1)[0]);

      return newPreferences.map((p, index) => ({
        ...p,
        rank: index + 1,
      }));
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-3">
      <div className="flex items-center">
        <h2 className="p-3 text-2xl">{labels.PREFERENCES}</h2>
        {isDirty ? (
          updateTopicPreferences.isLoading ? (
            <span className="flex items-center gap-1 rounded-md bg-yellow-200 px-2 py-1 text-yellow-950">
              <UpdateIcon className="animate-spin" />
              {labels.SAVING}
            </span>
          ) : (
            <button
              className="flex items-center gap-1 rounded-md bg-sky-200 px-2 py-1 text-sky-950 transition hover:bg-sky-300"
              onClick={() => updateTopicPreferences.mutate(preferencesState)}
            >
              <UploadIcon />
              {labels.SAVE}
            </button>
          )
        ) : (
          <span className="flex items-center gap-1 rounded-md bg-emerald-200 px-2 py-1 text-emerald-950">
            <CheckIcon />
            {labels.SAVED}
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-md border p-10">
        {isSuccess && preferences.length < 10 && (
          <p className="rounded-md bg-yellow-200 py-2 text-center">
            <ExclamationTriangleIcon className="mr-3 inline" />
            {labels.AT_LEAST_TEN_PREFERENCES_ARE_REQUIRED}
            <ExclamationTriangleIcon className="ml-3 inline" />
          </p>
        )}

        <Table>
          <Table.Caption>{labels.PREFERENCES}</Table.Caption>
          <Table.Head>
            <tr>
              <th className="p-3">{labels.TITLE}</th>
              <th className="p-3">{labels.RANK}</th>
              <th className="p-3">{labels.DESCRIPTION}</th>
              <th className="p-3">{labels.TYPE}</th>
              <th className="p-3">{labels.INSTRUCTOR}</th>
              <th></th>
            </tr>
          </Table.Head>
          <tbody>
            {isLoading ? (
              <tr>
                {
                  // @ts-ignore reason: colspan expects number, but "100%" is also valid
                  <td colSpan="100%">
                    <Spinner className="p-52" />
                  </td>
                }
              </tr>
            ) : preferencesState.length === 0 ? (
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
              preferencesState.map((preference, index) => (
                <Table.Row
                  key={preference.topicId}
                  className={cn({
                    'hover:bg-gray-50': !dragData,
                    'bg-gray-50': dragData?.id === preference.topicId,
                  })}
                  draggable
                  onDragStart={() => {
                    setDragData(() => ({
                      index: index,
                      id: preference.topicId,
                    }));
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();

                    const { top, height } =
                      e.currentTarget.getBoundingClientRect();

                    const isTopHalf = e.clientY < top + height / 2;
                    const comingFromTop = dragData!.index < index;

                    // TODO: is this better?
                    if (
                      (comingFromTop && isTopHalf) ||
                      (!comingFromTop && !isTopHalf)
                    ) {
                      return;
                    }

                    if (dragData?.id !== preference.topicId) {
                      movePreference(dragData!.id, index);
                    }
                  }}
                  onDragEnd={() => {
                    setDragData(undefined);
                  }}
                >
                  <Table.Cell primary>
                    <span className="line-clamp-4">
                      {preference.topic.title}
                    </span>
                  </Table.Cell>

                  <Table.Cell label={`${labels.RANK}: `}>
                    {preference.rank}
                  </Table.Cell>

                  <Table.Cell label={`${labels.DESCRIPTION}: `}>
                    <span className="line-clamp-4">
                      {preference.topic.description}
                    </span>
                  </Table.Cell>

                  <Table.Cell label={`${labels.TYPE}: `}>
                    {preference.topic.type}
                  </Table.Cell>

                  <Table.Cell label={`${labels.INSTRUCTOR}: `}>
                    {preference.topic.instructor.name}
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex flex-wrap gap-1 items-center">
                      <button
                        className={cn(
                          'w-min rounded-full bg-gray-100 flex items-center gap-1 hover:bg-gray-300 px-2 py-1 md:py-2',
                          {
                            invisible: index === 0,
                          },
                        )}
                        onClick={() =>
                          movePreference(preference.topicId, index - 1)
                        }
                      >
                        <span className="md:hidden whitespace-nowrap">
                          {labels.MOVE_UP}
                        </span>
                        <ChevronUpIcon width={25} height={25} />
                      </button>
                      <button
                        className={cn(
                          'w-min rounded-full flex bg-gray-100 items-center gap-1 hover:bg-gray-300 px-2 py-1 md:py-2',
                          {
                            invisible: index === preferences.length - 1,
                          },
                        )}
                        onClick={() =>
                          movePreference(preference.topicId, index + 1)
                        }
                      >
                        <span className="md:hidden whitespace-nowrap">
                          {labels.MOVE_DOWN}
                        </span>
                        <ChevronDownIcon width={25} height={25} />
                      </button>
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
