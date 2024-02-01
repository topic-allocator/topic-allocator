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
    isLoading: studentsLoading,
    isError: studentsError,
  } = useGetStudents();
  const {
    data: instructors,
    isLoading: instructorsLoading,
    isError: instructorsError,
  } = useGetInstructors();
  const {
    data: topics,
    isLoading: topicsLoading,
    isError: topicsError,
  } = useGetTopics();
  const runSolver = useRunSolver();

  if (studentsError) {
    return <p>Hiba történt a diákok lekérdezése során.</p>;
  }

  if (instructorsError) {
    return <p>Hiba történt az oktatók lekérdezése során.</p>;
  }

  if (topicsError) {
    return <p>Hiba történt a témák lekérdezése során.</p>;
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
            <span>{`${numberOfUnassignedStudents} diák még nem került beosztásra`}</span>
            <ExclamationTriangleIcon width={20} height={20} />
          </div>
        ) : (
          <div
            role="alert"
            className="alert alert-success justify-items-center"
          >
            <CheckIcon width={20} height={20} />
            <span>Minden diák beosztásra került</span>
            <CheckIcon width={20} height={20} />
          </div>
        ))}
      <div className="grid md:grid-cols-4">
        <span>Diákok száma</span>
        <span>
          {studentsLoading ? (
            <Spinner className="w-min" width={20} height={20} />
          ) : (
            students?.length
          )}
        </span>

        <span>Beosztott diákok száma</span>
        <span>
          {studentsLoading ? (
            <Spinner className="w-min" width={20} height={20} />
          ) : (
            assignedStudents?.length
          )}
        </span>

        <span>Nem adott meg preferenciát</span>
        <span>
          {studentsLoading ? (
            <Spinner className="w-min" width={20} height={20} />
          ) : (
            students?.filter((s) => s.studentTopicPreferences.length === 0)
              .length
          )}
        </span>

        <span>Oktatók száma</span>
        <span>
          {instructorsLoading ? (
            <Spinner className="w-min" width={20} height={20} />
          ) : (
            instructors.length
          )}
        </span>

        <span>Témák száma</span>
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
        isLoading={runSolver.isLoading}
        onClick={() => runSolver.mutate()}
      />

      <Assignments />
    </>
  );
}
