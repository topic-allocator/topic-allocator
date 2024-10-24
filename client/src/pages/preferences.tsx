import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  UploadIcon,
} from '@radix-ui/react-icons';
import Spinner from '@/components/ui/spinner';
import { useGetTopicPreferences, useUpdateTopicPreferences } from '@/queries';
import { cn } from '@/utils';
import { useEffect, useState } from 'react';
import { useLabels } from '@/contexts/labels/label-context';
import Table from '@/components/ui/table';
import Button from '@/components/ui/button';

export default function Preferences() {
  const {
    data: preferences,
    isPending,
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
    return <div>{labels.ERROR}</div>;
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
    <main className="mx-auto flex max-w-5xl flex-col gap-3 p-3">
      <div className="flex items-center">
        <h2 className="p-3 text-2xl">{labels.PREFERENCES}</h2>
        {isDirty ? (
          <Button
            label={labels.SAVE}
            className="btn-outline btn-success btn-md"
            icon={<UploadIcon />}
            isPending={updateTopicPreferences.isPending}
            onClick={() => updateTopicPreferences.mutate(preferencesState)}
          />
        ) : (
          <div className="btn btn-primary pointer-events-none">
            {labels.SAVED}
            <CheckIcon />
          </div>
        )}
      </div>

      {isSuccess && preferences.length < 10 && (
        <div
          role="alert"
          className="alert alert-warning justify-items-center font-bold"
        >
          <ExclamationTriangleIcon width={20} height={20} />
          {labels.AT_LEAST_TEN_PREFERENCES_ARE_REQUIRED}
          <ExclamationTriangleIcon width={20} height={20} />
        </div>
      )}

      <div className="card overflow-x-auto border border-neutral-500/50 bg-base-300 md:p-5">
        <Table>
          <Table.Caption>{labels.PREFERENCES}</Table.Caption>
          <Table.Head>
            <tr>
              <th className="p-3">{labels.TITLE}</th>
              <th className="p-3">{labels.LANGUAGE}</th>
              <th className="p-3">{labels.RANK}</th>
              <th className="p-3">{labels.DESCRIPTION}</th>
              <th className="p-3">{labels.TYPE}</th>
              <th className="p-3">{labels.INSTRUCTOR}</th>
              <th></th>
            </tr>
          </Table.Head>
          <tbody>
            {isPending ? (
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
                    'hover:bg-base-100': !dragData,
                    'bg-base-100': dragData?.id === preference.topicId,
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

                  <Table.Cell label={`${labels.LANGUAGE}: `}>
                    {preference.topic.language}
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
                    {
                      labels[
                        preference.topic.type.toUpperCase() as keyof typeof labels
                      ]
                    }
                  </Table.Cell>

                  <Table.Cell label={`${labels.INSTRUCTOR}: `}>
                    {preference.topic.instructor.name}
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex flex-wrap items-center gap-1">
                      <Button
                        label={
                          <span className="whitespace-nowrap md:hidden">
                            {labels.MOVE_UP}
                          </span>
                        }
                        className={cn('btn-outline btn-md md:btn-circle', {
                          invisible: index === 0,
                        })}
                        icon={<ChevronUpIcon width={25} height={25} />}
                        onClick={() =>
                          movePreference(preference.topicId, index - 1)
                        }
                      />
                      <Button
                        label={
                          <span className="whitespace-nowrap md:hidden">
                            {labels.MOVE_DOWN}
                          </span>
                        }
                        className={cn('btn-outline btn-md md:btn-circle', {
                          invisible: index === preferences.length - 1,
                        })}
                        icon={<ChevronDownIcon width={25} height={25} />}
                        onClick={() =>
                          movePreference(preference.topicId, index + 1)
                        }
                      />
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
