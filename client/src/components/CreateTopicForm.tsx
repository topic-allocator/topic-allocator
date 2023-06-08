import { useState } from 'react';
import Input from './ui/Input';
import { Topic } from '@prisma/client';
import ComboBox from './ui/ComboBox';
import { useCreateTopic, useGetInstructors } from '../queries';
import { UpdateIcon } from '@radix-ui/react-icons';
import { useDialog } from './ui/dialog/dialogContext';

export type NewTopic = Partial<Omit<Topic, 'id'>>;

export default function CreateTopicForm() {
  const { data: instructors, isLoading, isError } = useGetInstructors();
  const { closeDialog } = useDialog();
  const createFormMutation = useCreateTopic();

  const [formData, setFormData] = useState<NewTopic>({
    instructorId: undefined,
    title: '',
    type: undefined,
    capacity: 0,
    description: '',
  });

  async function submitHandler() {
    createFormMutation.mutate(formData, {
      onSuccess: () => {
        closeDialog();
      },
    });
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error</div>;
  }

  return (
    <>
      <form className=" grid grid-cols-[auto_1fr] gap-3 p-3">
        <label className="flex items-center" htmlFor="instructor">
          Instructor:
        </label>
        <ComboBox
          options={instructors.map((instructor) => ({
            value: instructor.id,
            label: instructor.name,
          }))}
          id="instructor"
          name="instructor"
          placeholder="Adja meg az oktatót"
          onSelect={(value) => setValue(['instructorId', value])}
        />

        <label className="flex items-center" htmlFor="title">
          Title:
        </label>
        <Input
          id="title"
          name="title"
          placeholder="Adja meg a téma címét"
          value={formData.title}
          onChange={handleChange}
        />

        <label className="flex items-center" htmlFor="type">
          Type:
        </label>
        <ComboBox
          withoutSearch
          options={[
            {
              value: 'individual',
              label: 'Egyéni',
            },
            {
              value: 'TDK',
              label: 'TDK',
            },
          ]}
          id="type"
          name="type"
          placeholder="Válassza ki a téma típusát"
          onSelect={(value) => setValue(['type', value])}
        />

        <label className="flex items-center" htmlFor="capacity">
          Capacity:
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

        <label htmlFor="description">Description:</label>
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
              formData?.description?.length === 500 && 'text-red-700 opacity-100'
            }`}
          >
            {formData?.description?.length} / 500
          </span>
        </div>
      </form>
      <footer className="flex justify-end gap-3 border-t px-2">
        <button className="my-1 rounded-md bg-gray-300 px-3 py-1 transition hover:bg-gray-400">
          Cancel
        </button>

        <button
          type="submit"
          className="my-1 flex w-[100px] items-center justify-center rounded-md bg-emerald-400 px-3 py-1 transition hover:bg-emerald-500"
          onClick={submitHandler}
        >
          {createFormMutation.isLoading ? <UpdateIcon className="animate-spin" /> : 'Create'}
        </button>
      </footer>
    </>
  );
}
