import Assignments from '@/components/assignments';
import Spinner from '@/components/ui/spinner';
import { useLabel } from '@/contexts/labels/label-context';
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
  const { labels } = useLabel();
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
    <main className="mx-auto max-w-4xl p-3 flex flex-col gap-3">
      <h2 className="text-2xl">{labels.SOLVER}</h2>

      {!studentsLoading &&
        (numberOfUnassignedStudents > 0 ? (
          <p className="rounded-md bg-yellow-200 py-2 text-center">
            <ExclamationTriangleIcon className="mr-3 inline" />
            <span>{`${numberOfUnassignedStudents} diák még nem került beosztásra`}</span>
            <ExclamationTriangleIcon className="ml-3 inline" />
          </p>
        ) : (
          <p className="rounded-md bg-emerald-200 py-2 text-center">
            <CheckIcon className="mr-3 inline" />
            <span>Minden diák beosztásra került</span>
            <CheckIcon className="ml-3 inline" />
          </p>
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
            <Spinner width={20} height={20} />
          ) : (
            assignedStudents?.length
          )}
        </span>

        <span>Nem adott meg preferenciát</span>
        <span>
          {studentsLoading ? (
            <Spinner width={20} height={20} />
          ) : (
            students?.filter((s) => s.studentTopicPreferences.length === 0)
              .length
          )}
        </span>

        <span>Oktatók száma</span>
        <span>
          {instructorsLoading ? (
            <Spinner width={20} height={20} />
          ) : (
            instructors.length
          )}
        </span>

        <span>Témák száma</span>
        <span>
          {topicsLoading ? <Spinner width={20} height={20} /> : topics.length}
        </span>
      </div>

      <button
        className="flex text-xl items-center rounded-md bg-emerald-200 gap-1 px-2 py-1 w-min text-emerald-950 transition hover:bg-emerald-300"
        onClick={() => runSolver.mutate()}
      >
        <span className="whitespace-nowrap">Solver futtatása</span>
        {runSolver.isLoading ? (
          <Spinner width={25} height={25} />
        ) : (
          <PlayIcon className="pointer-events-none" width={25} height={25} />
        )}
      </button>

      <hr />

      <Assignments />
    </main>
  );
}
