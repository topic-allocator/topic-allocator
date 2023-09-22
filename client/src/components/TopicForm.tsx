import { useState } from 'react';
import Input from './ui/Input';
import { Topic } from '@prisma/client';
import ComboBox from './ui/ComboBox';
import { useCreateTopic, useUpdateTopic } from '../queries';
import { UpdateIcon } from '@radix-ui/react-icons';
import { useDialog } from './ui/dialog/dialogContext';
import { UpdateTopicInput } from '@api/topic';
import { useForm } from 'react-hook-form';

export type NewTopic = Partial<Topic>;

// TODO: refactor
export default function TopicForm({ topicToEdit }: { topicToEdit?: Topic }) {
  const { closeDialog } = useDialog();
  const createTopicMutation = useCreateTopic();
  const updateTopicMutation = useUpdateTopic();

  const { register, handleSubmit } = useForm<NewTopic>({
    defaultValues: topicToEdit ?? {
      title: '',
      type: undefined,
      capacity: 1,
      description: '',
    },
  });

  const [formData, setFormData] = useState<NewTopic>(
    topicToEdit ?? {
      title: '',
      type: undefined,
      capacity: 1,
      description: '',
    },
  );

  async function submitHandler() {
    if (topicToEdit) {
      return updateTopicMutation.mutate(formData as UpdateTopicInput, {
        onSuccess: () => {
          closeDialog();
        },
      });
    }
    createTopicMutation.mutate(formData, {
      onSuccess: () => {
        closeDialog();
      },
    });
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setValue([name as keyof NewTopic, value]);
  };

  function setValue([key, value]: [keyof NewTopic, string | number]) {
    if (key === 'capacity') {
      value = Number.parseInt(value as string);
      if (value > 10 || value < 0) {
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <>
      <form className="grid gap-3 p-3 md:grid-cols-[auto_1fr]">
        <label className="flex items-center" htmlFor="title">
          Title
        </label>
        <Input
          id="title"
          name="title"
          placeholder="Adja meg a téma címét"
          value={formData.title}
          onChange={handleChange}
        />

        <label className="flex items-center" htmlFor="type">
          Type
        </label>
        <ComboBox
          withoutSearch
          value={formData.type}
          options={[
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
          onSelect={(value) => setValue(['type', value])}
        />

        <label className="flex items-center" htmlFor="capacity">
          Capacity
        </label>
        <Input
          id="capacity"
          type="number"
          name="capacity"
          className="rounded-md border p-1 px-3"
          min={0}
          max={10}
          value={formData.capacity}
          onChange={handleChange}
        />

        <label htmlFor="description">Description</label>
        <div className="flex flex-col">
          <textarea
            id="description"
            name="description"
            className="resize-none rounded-md border p-1 px-3"
            cols={30}
            rows={10}
            placeholder="Adja meg a téma leírását"
            maxLength={500}
            value={formData.description}
            onChange={handleChange}
          />
          <span
            className={`text-end opacity-70 ${
              formData?.description?.length === 500 &&
              'text-red-700 opacity-100'
            }`}
          >
            {formData?.description?.length} / 500
          </span>
        </div>
      </form>
      <footer className="flex justify-end gap-3 border-t px-2">
        <button
          className="my-1 rounded-md bg-gray-300 px-3 py-1 transition hover:bg-gray-400"
          onClick={closeDialog}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="my-1 flex w-[100px] items-center justify-center rounded-md bg-emerald-400 px-3 py-1 transition hover:bg-emerald-500"
          onClick={submitHandler}
        >
          {createTopicMutation.isLoading ? (
            <UpdateIcon className="animate-spin" />
          ) : topicToEdit ? (
            'Update'
          ) : (
            'Create'
          )}
        </button>
      </footer>
    </>
  );
}
