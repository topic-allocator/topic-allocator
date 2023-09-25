import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  UpdateIcon,
  UploadIcon,
} from '@radix-ui/react-icons';
import Spinner from '../components/ui/Spinner';
import { useGetTopicPreferences, useUpdateTopicPreferences } from '../queries';
import { cn } from '../utils';
import { useEffect, useState } from 'react';
import { GetTopicPreferencesResponse } from '@api/student';
import { useLabel } from '../contexts/labels/labelContext';

export default function Preferences() {
  const {
    data: preferences,
    isLoading,
    isError,
    isSuccess,
  } = useGetTopicPreferences();
  const { labels } = useLabel();
  const updateTopicPreferences = useUpdateTopicPreferences();
  const [preferencesState, setPreferencesState] =
    useState<GetTopicPreferencesResponse>([]);
  const [dragData, setDragData] = useState<
    | {
        id: number;
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

  function movePreference(id: number, to: number) {
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
            Legalább 10 preferencia megadása kötelező
            <ExclamationTriangleIcon className="ml-3 inline" />
          </p>
        )}

        <table
          className="h-1 w-full min-w-[700px] caption-bottom"
          border={1}
          rules="rows"
        >
          <caption className="mt-4 text-gray-500">{labels.PREFERENCES}</caption>
          <thead className="border-b text-left">
            <tr>
              <th className="p-3">{labels.RANK}</th>
              <th className="p-3">{labels.TITLE}</th>
              <th className="p-3">{labels.DESCRIPTION}</th>
              <th className="p-3">{labels.TYPE}</th>
              <th className="p-3">{labels.INSTRUCTOR}</th>
            </tr>
          </thead>
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
            ) : (
              preferencesState.map((preference, index) => (
                <tr
                  key={preference.topicId}
                  className={cn(
                    'border-b max-h-24 overflow-hidden cursor-grab',
                    {
                      'hover:bg-gray-100': !dragData,
                      'bg-gray-100': dragData?.id === preference.topicId,
                    },
                  )}
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
                  <td className="p-3">
                    <span className="line-clamp-4">{preference.rank}</span>
                  </td>
                  <td className="p-3">
                    <span className="line-clamp-4">
                      {preference.topic.title}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="line-clamp-4">
                      {preference.topic.description}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="line-clamp-4">
                      {preference.topic.type}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="line-clamp-4">
                      {preference.topic.instructor.name}
                    </span>
                  </td>

                  <td className="flex flex-col items-center p-3">
                    <button
                      className={cn(
                        'w-min rounded-full p-1 hover:bg-gray-300',
                        {
                          invisible: index === 0,
                        },
                      )}
                      onClick={() =>
                        movePreference(preference.topicId, index - 1)
                      }
                    >
                      <ChevronUpIcon width={30} height={30} />
                    </button>
                    <button
                      className={cn(
                        'w-min rounded-full p-1 hover:bg-gray-300',
                        {
                          invisible: index === preferences.length - 1,
                        },
                      )}
                      onClick={() =>
                        movePreference(preference.topicId, index + 1)
                      }
                    >
                      <ChevronDownIcon width={30} height={30} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
