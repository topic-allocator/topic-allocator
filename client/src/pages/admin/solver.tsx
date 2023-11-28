import Assignments from '@/components/assignments-list';
import Input from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import { useLabels } from '@/contexts/labels/label-context';
import {
  useGetInstructors,
  useGetStudents,
  useGetTopics,
  useRunSolver,
} from '@/queries';
import { Instructor } from '@lti/server/src/db';
import {
  CheckIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  ReloadIcon,
} from '@radix-ui/react-icons';
import { useState } from 'react';

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

      <hr />
      {instructors && <SolverPanel instructors={instructors} />}
      <hr />

      <Assignments />
    </main>
  );
}

function SolverPanel({ instructors }: { instructors: Instructor[] }) {
  const runSolver = useRunSolver();

  const lowestMinimum = instructors.reduce(
    (min, curr) => Math.min(min, curr.min),
    0,
  );
  const highestMaximum = instructors.reduce(
    (max, curr) => Math.max(max, curr.max),
    0,
  );

  const [commonMinimum, setCommonMinimum] = useState(lowestMinimum);
  const [commonMaximum, setCommonMaximum] = useState(highestMaximum);

  const instructorsUnderMinimum = instructors.filter(
    (instructor) => instructor.min < commonMinimum,
  ).length;
  const instructorsOverMaximum = instructors.filter(
    (instructor) => instructor.max > commonMaximum,
  ).length;

  return (
    <>
      <div className="grid gap-3 md:grid-cols-[auto_1fr]">
        <label className="flex items-center" htmlFor="capacity">
          Közös minimum
        </label>
        <div className="flex gap-1 items-center">
          <Input
            id="capacity"
            type="number"
            className="w-20"
            min={0}
            value={commonMinimum}
            onChange={(e) => setCommonMinimum(Number(e.target.value))}
          />

          {commonMinimum !== lowestMinimum && (
            <button
              className="text-sky-500 hover:bg-sky-200 p-0.5 bg-sky-50 rounded-md"
              onClick={() => setCommonMinimum(lowestMinimum)}
            >
              <ReloadIcon className="-scale-x-100" />
            </button>
          )}
          {instructorsUnderMinimum > 0 && (
            <span className="text-red-500 text-sm">
              (
              {`${instructorsUnderMinimum} oktató nem éri el a közös minimumot`}
              )
            </span>
          )}
        </div>

        <label className="flex items-center" htmlFor="capacity">
          Közös maximum
        </label>
        <div className="flex gap-1 items-center">
          <Input
            id="capacity"
            type="number"
            className="w-20"
            min={0}
            value={commonMaximum}
            onChange={(e) => setCommonMaximum(Number(e.target.value))}
          />

          {commonMaximum !== highestMaximum && (
            <button
              className="text-sky-500 hover:bg-sky-200 p-0.5 bg-sky-50 rounded-md"
              onClick={() => setCommonMaximum(highestMaximum)}
            >
              <ReloadIcon className="-scale-x-100" />
            </button>
          )}
          {instructorsOverMaximum > 0 && (
            <span className="text-red-500 text-sm">
              ({`${instructorsOverMaximum} oktató meghaladja a közös maximumot`}
              )
            </span>
          )}
        </div>
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
    </>
  );
}
