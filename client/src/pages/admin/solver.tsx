import Assignments from '@/components/assignments-list';
import Button from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { useLabels } from '@/contexts/labels/label-context';
import {
  useGetInstructors,
  useGetStudents,
  useGetTopics,
  useRunSolver,
} from '@/queries';
import {
  CheckIcon,
  ExclamationTriangleIcon,
  PlayIcon,
} from '@radix-ui/react-icons';

export default function Solver() {
  const { labels } = useLabels();
  const {
    data: students,
    isPending: studentsLoading,
    isError: studentsError,
  } = useGetStudents();
  const {
    data: instructors,
    isPending: instructorsLoading,
    isError: instructorsError,
  } = useGetInstructors();
  const {
    data: topics,
    isPending: topicsLoading,
    isError: topicsError,
  } = useGetTopics();
  const runSolver = useRunSolver();

  if (studentsError) {
    return <p>{labels.ERROR_LOADING_STUDENTS}</p>;
  }

  if (instructorsError) {
    return <p>{labels.ERROR_LOADING_INSTRUCTORS}</p>;
  }

  if (topicsError) {
    return <p>{labels.ERROR_LOADING_TOPICS}</p>;
  }

  const assignedStudents = students?.filter((s) => s.assignedTopicId);
  const numberOfUnassignedStudents =
    (students?.length ?? 0) - (assignedStudents?.length ?? 0);

  return (
    <>
      <h2 className="text-2xl">{labels.SOLVER}</h2>

      {!studentsLoading &&
        (numberOfUnassignedStudents > 0 ? (
          <div
            role="alert"
            className="alert alert-warning justify-items-center"
          >
            <ExclamationTriangleIcon width={20} height={20} />
            <span>{`${numberOfUnassignedStudents} students remain unassigned`}</span>
            <ExclamationTriangleIcon width={20} height={20} />
          </div>
        ) : (
          <div
            role="alert"
            className="alert alert-success justify-items-center"
          >
            <CheckIcon width={20} height={20} />
            <span>{labels.EVERY_STUDENT_HAS_BEEN_ASSIGNED}</span>
            <CheckIcon width={20} height={20} />
          </div>
        ))}
      <div className="grid md:grid-cols-4">
        <span>{labels.NUMBER_OF_STUDENTS}</span>
        <span>
          {studentsLoading ? (
            <Spinner className="w-min" width={20} height={20} />
          ) : (
            students?.length
          )}
        </span>

        <span>{labels.NUMBER_OF_ASSIGNED_STUDENTS}</span>
        <span>
          {studentsLoading ? (
            <Spinner className="w-min" width={20} height={20} />
          ) : (
            assignedStudents?.length
          )}
        </span>

        <span>{labels.STUDENTS_WITHOUT_PREFERENCES}</span>
        <span>
          {studentsLoading ? (
            <Spinner className="w-min" width={20} height={20} />
          ) : (
            students?.filter((s) => s.studentTopicPreferences.length === 0)
              .length
          )}
        </span>

        <span>{labels.NUMBER_OF_INSTRUCTORS}</span>
        <span>
          {instructorsLoading ? (
            <Spinner className="w-min" width={20} height={20} />
          ) : (
            instructors.length
          )}
        </span>

        <span>{labels.NUMBER_OF_TOPICS}</span>
        <span>
          {topicsLoading ? (
            <Spinner className="w-min" width={20} height={20} />
          ) : (
            topics.length
          )}
        </span>
      </div>

      <Button
        label={labels.RUN_SOLVER}
        className="btn-outline btn-success w-min whitespace-nowrap"
        icon={<PlayIcon width={20} height={20} />}
        isPending={runSolver.isPending}
        onClick={() => runSolver.mutate()}
      />

      <Assignments />
    </>
  );
}
