import Input from '@/components/ui/input';
import { Topic } from '@lti/server/src/db';
import ComboBox from '@/components/ui/combo-box';
import { useCreateTopic, useUpdateTopic } from '@/queries';
import { UpdateIcon } from '@radix-ui/react-icons';
import { useDialog } from '@/components/ui/dialog/dialog-context';
import { UpdateTopicInput } from '@api/topic';
import { Controller, useForm } from 'react-hook-form';

export default function TopicForm({ topicToEdit }: { topicToEdit?: Topic }) {
  const { closeDialog } = useDialog();
  const createTopicMutation = useCreateTopic();
  const updateTopicMutation = useUpdateTopic();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Partial<Topic>>({
    defaultValues: topicToEdit ?? {
      title: '',
      type: undefined,
      capacity: 1,
      description: '',
    },
    mode: 'onTouched',
  });

  async function submitHandler(formData: Partial<Topic>) {
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

  return (
    <>
      <form onSubmit={handleSubmit(submitHandler)}>
        <div className="grid gap-3 p-3 md:grid-cols-[auto_1fr]">
          <label className="flex items-center" htmlFor="title">
            Title
          </label>
          <Input
            id="title"
            placeholder="Adja meg a téma címét"
            {...register('title', { required: 'Cím megadása kötelező' })}
          />
          {errors.title && <ErrorMessage>{errors.title.message}</ErrorMessage>}

          <label className="flex items-center" htmlFor="type">
            Type
          </label>
          <Controller
            name="type"
            control={control}
            rules={{ required: 'Típus megadása kötelező' }}
            render={({ field }) => (
              <ComboBox
                {...field}
                ref={null}
                withoutSearch
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
              />
            )}
          />
          {errors.type && <ErrorMessage>{errors.type.message}</ErrorMessage>}

          <label className="flex items-center" htmlFor="capacity">
            Capacity
          </label>
          <Input
            id="capacity"
            type="number"
            className="rounded-md border p-1 px-3"
            min={0}
            max={10}
            {...register('capacity', {
              required: 'Kapacitás megadása kötelező',
              valueAsNumber: true,
              min: {
                value: 0,
                message: 'Kapacitás nem lehet negatív',
              },
              max: {
                value: 10,
                message: 'Kapacitás nem lehet nagyobb mint 10',
              },
            })}
          />
          {errors.capacity && (
            <ErrorMessage>{errors.capacity.message}</ErrorMessage>
          )}

          <label htmlFor="description">Description</label>
          <div className="flex flex-col">
            <textarea
              id="description"
              className="resize-none rounded-md border p-1 px-3"
              cols={30}
              rows={10}
              placeholder="Adja meg a téma leírását"
              maxLength={500}
              {...register('description', {
                required: 'Leírás megadása kötelező',
              })}
            />
          </div>
          {errors.description && (
            <ErrorMessage>{errors.description.message}</ErrorMessage>
          )}
        </div>

        <footer className="flex justify-end gap-3 border-t px-2">
          <button
            type="button"
            className="my-1 rounded-md bg-gray-300 px-3 py-1 transition hover:bg-gray-400"
            onClick={closeDialog}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="my-1 flex w-[100px] items-center justify-center rounded-md bg-emerald-400 px-3 py-1 transition hover:bg-emerald-500"
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
      </form>
    </>
  );
}

function ErrorMessage({ children }: { children?: string }) {
  return (
    <span className="-mt-3 max-w-[16rem] pl-1 text-red-700 md:col-end-3">
      {children}
    </span>
  );
}
