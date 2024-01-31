import Input from '@/components/ui/input';
import ComboBox from '@/components/ui/combo-box';
import { useCreateTopic, useUpdateTopic } from '@/queries';
import { UpdateIcon } from '@radix-ui/react-icons';
import { useDialog } from '@/components/ui/dialog/dialog-context';
import { CreateTopicInput, UpdateTopicInput } from '@api/topic';
import { Controller, useForm } from 'react-hook-form';
import { useLabels } from '@/contexts/labels/label-context';
import { localeOptions } from '@lti/server/src/labels';
import FormField from './ui/form-field';
import { cn } from '@/utils';
import Dialog from './ui/dialog/dialog';

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
      language: 'hu',
      type: 'normal',
      capacity: 1,
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
        <div className="my-3">
          <FormField
            label={labels.TITLE}
            required
            errorMessage={errors.title?.message}
          >
            <Input
              id="title"
              className="w-full"
              placeholder={labels.ENTER_TOPIC_TITLE}
              aria-invalid={!!errors.title}
              {...register('title', { required: labels.TITLE_REQUIRED })}
            />
          </FormField>

          <FormField
            label={labels.DESCRIPTION}
            required
            errorMessage={errors.description?.message}
          >
            <textarea
              id="description"
              className={cn(
                'textarea min-h-[4rem] min-w-[13rem] max-w-3xl resize',
                {
                  'textarea-error': !!errors.description,
                },
              )}
              cols={45}
              rows={3}
              placeholder={labels.ENTER_TOPIC_DESCRIPTION}
              maxLength={500}
              {...register('description', {
                required: labels.DESCRIPTION_REQUIRED,
              })}
            />
          </FormField>

          <FormField
            label={labels.LANGUAGE}
            required
            errorMessage={errors.language?.message}
            preventLabelClick
          >
            <Controller
              name="language"
              control={control}
              rules={{ required: labels.TYPE_REQUIRED }}
              render={({ field }) => (
                <ComboBox
                  {...field}
                  ref={null}
                  fullWidth
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
          </FormField>

          <FormField
            label={labels.TYPE}
            errorMessage={errors.type?.message}
            required
            preventLabelClick
          >
            <Controller
              name="type"
              control={control}
              rules={{ required: labels.TYPE_REQUIRED }}
              render={({ field }) => (
                <ComboBox
                  {...field}
                  ref={null}
                  withoutSearch
                  fullWidth
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
          </FormField>

          <FormField
            label={labels.CAPACITY}
            errorMessage={errors.capacity?.message}
            required
          >
            <Input
              id="capacity"
              className="w-full"
              type="number"
              aria-invalid={!!errors.capacity}
              min={topicToEdit?._count.assignedStudents ?? 1}
              {...register('capacity', {
                required: labels.CAPACITY_REQUIRED,
                valueAsNumber: true,
                min: {
                  value: topicToEdit?._count.assignedStudents ?? 1,
                  message: labels.CAPACITY_CAN_NOT_BE_LOWER_THAN.replace(
                    '${}',
                    topicToEdit?._count.assignedStudents.toString() ?? '1',
                  ),
                },
              })}
            />
          </FormField>

          <FormField
            label={labels.RESEARCH_QUESTION}
            errorMessage={errors.researchQuestion?.message}
          >
            <Input
              id="research-question"
              className="w-full"
              placeholder={labels.ENTER_RESEARCH_QUESTION}
              aria-invalid={!!errors.researchQuestion}
              {...register('researchQuestion')}
            />
          </FormField>

          <FormField
            label={labels.RECOMMENDED_LITERATURE}
            errorMessage={errors.recommendedLiterature?.message}
          >
            <textarea
              id="recommended-literature"
              className={cn(
                'textarea min-h-[4rem] min-w-[13rem] max-w-3xl resize',
                {
                  'textarea-error': !!errors.recommendedLiterature,
                },
              )}
              cols={45}
              rows={3}
              placeholder={labels.ENTER_RECOMMENDED_LITERATURE}
              maxLength={500}
              {...register('recommendedLiterature')}
            />
          </FormField>
        </div>

        <Dialog.Footer
          okButton={
            <button type="submit" className="btn btn-accent btn-sm">
              {createTopicMutation.isLoading ? (
                <UpdateIcon className="animate-spin" />
              ) : topicToEdit ? (
                labels.UPDATE
              ) : (
                labels.CREATE
              )}
            </button>
          }
        />
      </form>
    </>
  );
}
