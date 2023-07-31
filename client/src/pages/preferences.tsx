import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
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
  const { data: preferences, isLoading, isError } = useGetTopicPreferences();
  const updateTopicPreferences = useUpdateTopicPreferences();
  const [preferencesState, setPreferencesState] =
    useState<GetTopicPreferencesResponse>([]);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setPreferencesState(preferences ?? []);
  }, [preferences]);
  const { labels } = useLabel();

  useEffect(() => {
    const isDirty = !preferencesState.every(
      (preference, index) => preference.rank === preferences?.[index]?.rank,
    );

    setIsDirty(isDirty);
  }, [preferencesState, preferences]);

  if (isError) {
    return <div>Error</div>;
  }

  function movePreferenceUp(index: number) {
    if (index === 0) {
      return;
    }

    setPreferencesState((prev) => {
      const newPreferences = [...prev];
      newPreferences[index].rank = index;
      newPreferences[index - 1].rank = index + 1;

      newPreferences[index] = newPreferences[index - 1];
      newPreferences[index - 1] = preferencesState[index];

      return newPreferences;
    });
  }
  function movePreferenceDown(index: number) {
    if (index === preferencesState.length - 1) {
      return;
    }

    setPreferencesState((prev) => {
      const newPreferences = [...prev];
      newPreferences[index].rank = index + 2;
      newPreferences[index + 1].rank = index + 1;

      newPreferences[index] = newPreferences[index + 1];
      newPreferences[index + 1] = preferencesState[index];

      return newPreferences;
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
                  className="border-b hover:bg-gray-100"
                >
                  <td className="p-3">{preference.rank}</td>
                  <td className="p-3">{preference.topic.title}</td>
                  <td className="p-3">{preference.topic.description}</td>
                  <td className="p-3">{preference.topic.type}</td>
                  <td className="p-3">{preference.topic.instructor.name}</td>

                  <td className="flex flex-col items-center p-3">
                    <button
                      className={cn(
                        'w-min rounded-full p-1 hover:bg-gray-300',
                        {
                          invisible: index === 0,
                        },
                      )}
                      onClick={() => movePreferenceUp(index)}
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
                      onClick={() => movePreferenceDown(index)}
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
