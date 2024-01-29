import Dialog from '@/components/ui/dialog/dialog';
import { useLabels } from '@/contexts/labels/label-context';
import { useGetAssignedTopicsForStudent } from '@/queries';

export default function AssignedTopicModal() {
  const { labels } = useLabels();
  const { data, isSuccess } = useGetAssignedTopicsForStudent();

  if (!isSuccess) {
    return;
  }

  const assignedTopic = data.assignedTopic;
  if (!assignedTopic) {
    return;
  }

  return (
    <Dialog initiallyOpen={true} clickOutsideToClose={false}>
      <Dialog.Body className="animate-pop-in rounded-md px-3 py-0 text-base shadow-2xl">
        <Dialog.Header
          headerTitle={labels.YOU_HAVE_BEEN_ASSIGNED_TO_TOPIC + ':'}
        />

        <p>
          <span className="font-bold">{labels.TITLE}:</span>{' '}
          {assignedTopic.title}
        </p>
        <p>
          <span className="font-bold">{labels.INSTRUCTOR}:</span>{' '}
          {assignedTopic.instructorName}
        </p>
        <p>
          <span className="font-bold">{labels.TYPE}:</span>{' '}
          {labels[assignedTopic.type.toUpperCase() as keyof typeof labels]}
        </p>
        <p>
          <span className="font-bold">{labels.DESCRIPTION}:</span>
          <br />
          <span>{assignedTopic.description}</span>
        </p>
      </Dialog.Body>
    </Dialog>
  );
}
