import Dialog from '@/components/ui/dialog/dialog';
import { useLabels } from '@/contexts/labels/label-context';
import { useGetAssignedTopicsForStudent } from '@/queries';
import { useDialog } from './ui/dialog/dialog-context';
import { useEffect } from 'react';

export default function AssignedTopicModal() {
  return (
    <Dialog clickOutsideToClose={false}>
      <ModalBody />
    </Dialog>
  );
}

function ModalBody() {
  const { labels } = useLabels();
  const { data, isSuccess } = useGetAssignedTopicsForStudent();
  const { openDialog } = useDialog();

  useEffect(() => {
    if (isSuccess && data.assignedTopic) {
      openDialog();
    }
  }, [isSuccess, data?.assignedTopic, openDialog]);

  if (!isSuccess) {
    return;
  }

  const assignedTopic = data.assignedTopic;
  if (!assignedTopic) {
    return;
  }

  return (
    <Dialog.Body>
      <Dialog.Header
        headerTitle={labels.YOU_HAVE_BEEN_ASSIGNED_TO_TOPIC + ':'}
      />

      <div className="flex flex-col">
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
      </div>
    </Dialog.Body>
  );
}
