import Input from '@/components/ui/input';
import ComboBox from '@/components/ui/combo-box';
import { useCreateTopic, useUpdateTopic } from '@/queries';
import { UpdateIcon } from '@radix-ui/react-icons';
import { useDialog } from '@/components/ui/dialog/dialog-context';
import { CreateTopicInput, UpdateTopicInput } from '@api/topic';
import { Controller, useForm } from 'react-hook-form';
import { useLabels } from '@/contexts/labels/label-context';
import { localeOptions } from '@lti/server/src/labels';

export type TopicToEdit = UpdateTopicInput & {
  type: string;
  _count: {
    assignedStudents: number;
  };
};
export default function TopicForm({
  topicToEdit,
}: {
  topicToEdit?: TopicToEdit;
}) {
  const { closeDialog } = useDialog();
  const { labels } = useLabels();
  const createTopicMutation = useCreateTopic();
  const updateTopicMutation = useUpdateTopic();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTopicInput>({
    defaultValues: topicToEdit ?? {
      title: '',
      language: 'hu',
      type: 'normal',
      capacity: 1,
      description: '',
    },
    mode: 'onTouched',
  });

  async function submitHandler(formData: CreateTopicInput) {
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
            {labels.TITLE}
          </label>
          <Input
            id="title"
            placeholder={labels.ENTER_TOPIC_TITLE}
            {...register('title', { required: labels.TITLE_REQUIRED })}
          />
          {errors.title && <ErrorMessage>{errors.title.message}</ErrorMessage>}

          <label className="flex items-center" htmlFor="type">
            {labels.LANGUAGE}
          </label>
          <Controller
            name="language"
            control={control}
            rules={{ required: labels.TYPE_REQUIRED }}
            render={({ field }) => (
              <ComboBox
                {...field}
                ref={null}
                withoutSearch
                options={localeOptions.map((locale) => ({
                  value: locale,
                  label: locale,
                }))}
                id="language"
                name="language"
              />
            )}
          />
          {errors.language && (
            <ErrorMessage>{errors.language.message}</ErrorMessage>
          )}

          <label className="flex items-center" htmlFor="type">
            {labels.TYPE}
          </label>
          <Controller
            name="type"
            control={control}
            rules={{ required: labels.TYPE_REQUIRED }}
            render={({ field }) => (
              <ComboBox
                {...field}
                ref={null}
                withoutSearch
                options={[
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
                placeholder={labels.SELECT_TOPIC_TYPE}
              />
            )}
          />
          {errors.type && <ErrorMessage>{errors.type.message}</ErrorMessage>}

          <label className="flex items-center" htmlFor="capacity">
            {labels.CAPACITY}
          </label>
          <Input
            id="capacity"
            type="number"
            className="rounded-md border p-1 px-3"
            min={topicToEdit?._count.assignedStudents ?? 0}
            {...register('capacity', {
              required: labels.CAPACITY_REQUIRED,
              valueAsNumber: true,
              min: {
                value: topicToEdit?._count.assignedStudents ?? 0,
                message: labels.CAPACITY_CAN_NOT_BE_LOWER_THAN.replace(
                  '${}',
                  topicToEdit?._count.assignedStudents.toString() ?? '0',
                ),
              },
            })}
          />
          {errors.capacity && (
            <ErrorMessage>{errors.capacity.message}</ErrorMessage>
          )}

          <label htmlFor="description">{labels.DESCRIPTION}</label>
          <div className="flex flex-col">
            <textarea
              id="description"
              className="rounded-md max-w-3xl min-w-[13rem] min-h-[4rem] resize border p-1 px-3"
              cols={30}
              rows={10}
              placeholder={labels.ENTER_TOPIC_DESCRIPTION}
              maxLength={500}
              {...register('description', {
                required: labels.DESCRIPTION_REQUIRED,
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
            {labels.CANCEL}
          </button>

          <button
            type="submit"
            className="my-1 flex w-[100px] items-center justify-center rounded-md bg-emerald-400 px-3 py-1 transition hover:bg-emerald-500"
          >
            {createTopicMutation.isLoading ? (
              <UpdateIcon className="animate-spin" />
            ) : topicToEdit ? (
              labels.UPDATE
            ) : (
              labels.CREATE
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
