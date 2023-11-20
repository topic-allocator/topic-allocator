import ComboBox from '@/components/ui/combo-box';
import Input from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import Table from '@/components/ui/table';
import { useLabels } from '@/contexts/labels/label-context';
import { useGetInstructors, useGetStudents, useUpdateStudent } from '@/queries';
import { cn } from '@/utils';
import { Student } from '@lti/server/src/db';
import {
  CaretUpIcon,
  ExclamationTriangleIcon,
  PlusIcon,
} from '@radix-ui/react-icons';
import { SetStateAction, useMemo, useState } from 'react';
import Dialog from './ui/dialog/dialog';
import TopicList from '@/pages/topic-list';

export default function AssignedStudents() {
  const { labels } = useLabels();
  const { data: students, isLoading, isError, isSuccess } = useGetStudents();

  const columns = {
    name: labels.NAME,
    email: labels.EMAIL,
    topicTitle: labels.TOPIC_TITLE,
    assignedInstructorId: labels.INSTRUCTOR,
    topicType: labels.TYPE,
  };

  const [filter, setFilter] = useState({
    name: '',
    email: '',
    title: '',
    instructorId: 'all',
    type: 'all',
  });

  const [sorting, setSorting] = useState<{
    key: keyof typeof columns;
    order: 'asc' | 'desc';
  }>({
    key: 'name',
    order: 'asc',
  });

  function handleChangeSorting(key: keyof typeof columns) {
    setSorting((prev) => {
      if (prev.key === key) {
        return {
          key,
          order: prev.order === 'asc' ? 'desc' : 'asc',
        };
      }

      return {
        key,
        order: 'asc',
      };
    });
  }

  const filteredStudents = useMemo(() => {
    return students
      ?.map((s) => ({
        ...s,
        topicTitle: s.assignedTopic?.title ?? '',
        topicType: s.assignedTopic?.type ?? '',
        assignedInstructorId: s.assignedTopic?.instructor?.id ?? '',
        assignedInstructorName: s.assignedTopic?.instructor?.name ?? '',
      }))
      .filter((student) => {
        const nameMatch = student.name
          .toLowerCase()
          .includes(filter.name.toLowerCase());
        const emailMatch = student.email
          .toLowerCase()
          .includes(filter.email.toLowerCase());
        const titleMatch = student.topicTitle
          .toLowerCase()
          .includes(filter.title.toLowerCase());

        const instructorMatch =
          filter.instructorId === 'all' ||
          student.assignedTopic?.instructor.id === filter.instructorId;

        const typeMatch =
          filter.type === 'all' || student.topicType === filter.type;

        return (
          nameMatch && instructorMatch && emailMatch && titleMatch && typeMatch
        );
      });
  }, [students, filter]);

  const sortedStudents = useMemo(() => {
    return filteredStudents
      ?.toSorted((a, b) => {
        if (sorting.order === 'asc') {
          return a[sorting.key] > b[sorting.key] ? 1 : -1;
        }

        return a[sorting.key] < b[sorting.key] ? 1 : -1;
      })
      .toSorted((a, _) => (a.assignedTopicId ? 1 : -1));
  }, [filteredStudents, sorting]);

  if (isError) {
    return <div>Error</div>;
  }
  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-3">
      <h2 className="text-2xl">
        {labels.ASSIGNED_STUDENTS}{' '}
        {isSuccess &&
          `(${students.filter((s) => s.assignedTopicId).length}/${
            students.length
          })`}
      </h2>
      <Filter filter={filter} setFilter={setFilter} />

      <div className="overflow-x-auto rounded-md border md:p-10">
        <Table>
          <Table.Caption>{labels.ASSIGNED_STUDENTS}</Table.Caption>
          <Table.Head>
            <tr>
              {Object.entries(columns).map(([key, label]) => (
                <th
                  key={key}
                  className="cursor-pointer p-3 hover:bg-gray-200"
                  onClick={() =>
                    handleChangeSorting(key as keyof typeof columns)
                  }
                >
                  <div className="flex items-center">
                    {label}

                    <CaretUpIcon
                      className={cn('inline invisible', {
                        visible: sorting.key === key,
                        'rotate-180':
                          sorting.key === key && sorting.order === 'desc',
                      })}
                      width={20}
                      height={20}
                    />
                  </div>
                </th>
              ))}
              <th></th>
            </tr>
          </Table.Head>
          <tbody>
            {isLoading ? (
              <tr>
                {
                  // @ts-ignore reason: colspan expects number, but "100%" is valid
                  <td colSpan="100%">
                    <Spinner className="p-52" />
                  </td>
                }
              </tr>
            ) : sortedStudents?.length === 0 ? (
              <tr>
                {
                  // @ts-ignore reason: colspan expects number, but "100%" is valid
                  <td colSpan="100%">
                    <p className="text-center text-xl">
                      {labels.NO_RECORDS_FOUND}
                    </p>
                  </td>
                }
              </tr>
            ) : (
              sortedStudents!.map((student) => (
                <Table.Row
                  className={cn({
                    'bg-yellow-200': !student.assignedTopicId,
                  })}
                  key={student.id}
                >
                  <Table.Cell primary>{student.name}</Table.Cell>

                  <Table.Cell label={`${labels.EMAIL}: `}>
                    {student.email}
                  </Table.Cell>

                  <Table.Cell label={`${labels.TOPIC_TITLE}: `}>
                    {student.topicTitle || (
                      <AssignTopicButton studentId={student.id} />
                    )}
                  </Table.Cell>

                  <Table.Cell label={`${labels.INSTRUCTOR}: `}>
                    {student.assignedInstructorName || (
                      <ExclamationTriangleIcon width={25} height={25} />
                    )}
                  </Table.Cell>

                  <Table.Cell label={`${labels.TYPE}: `}>
                    {student.topicType ? (
                      labels[
                        student.topicType.toUpperCase() as keyof typeof labels
                      ]
                    ) : (
                      <ExclamationTriangleIcon width={25} height={25} />
                    )}
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

function Filter({
  filter,
  setFilter,
}: {
  filter: {
    name: string;
    email: string;
    title: string;
    instructorId: string;
    type: string;
  };
  setFilter: React.Dispatch<SetStateAction<typeof filter>>;
}) {
  const { data: instructors } = useGetInstructors();
  const { labels: labels } = useLabels();

  function handleFilterChange(
    key: keyof typeof filter,
    value: string | number,
  ) {
    setFilter((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  return (
    <div className="bg-gray-50 rounded-md flex flex-col gap-3 items-start p-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 items-center p-1 rounded-md">
          <label className="min-w-[7ch] md:min-w-fit" htmlFor="titleFilter">
            {labels.NAME}:
          </label>
          <Input
            id="titleFilter"
            placeholder={`${labels.NAME}...`}
            value={filter.name}
            onChange={(e) => handleFilterChange('name', e.target.value)}
          />
        </div>

        <div className="flex gap-1 items-center p-1 rounded-md">
          <label className="min-w-[7ch] md:min-w-fit" htmlFor="titleFilter">
            {labels.EMAIL}:
          </label>
          <Input
            id="titleFilter"
            placeholder={`${labels.EMAIL}...`}
            value={filter.email}
            onChange={(e) => handleFilterChange('email', e.target.value)}
          />
        </div>

        <div className="flex gap-1 items-center p-1 rounded-md">
          <label className="min-w-[7ch] md:min-w-fit" htmlFor="titleFilter">
            {labels.TITLE}:
          </label>
          <Input
            id="titleFilter"
            placeholder={`${labels.TOPIC_TITLE}...`}
            value={filter.title}
            onChange={(e) => handleFilterChange('title', e.target.value)}
          />
        </div>

        <div className="flex gap-1 items-center p-1 rounded-md">
          <label className="min-w-[7ch] md:min-w-fit">
            {labels.INSTRUCTOR}:
          </label>
          <ComboBox
            value={filter.instructorId}
            options={[
              {
                label: labels.ALL,
                value: 'all',
              },
              ...(instructors
                ?.toSorted((a, b) => a.name.localeCompare(b.name))
                .map((instructor) => ({
                  value: instructor.id,
                  label: instructor.name,
                })) ?? []),
            ]}
            placeholder={labels.SELECT_INSTRUCTOR}
            onChange={(value) =>
              handleFilterChange('instructorId', value.toString())
            }
          />
        </div>

        <div className="flex gap-1 items-center p-1 rounded-md">
          <label className="min-w-[7ch] md:min-w-fit">{labels.TYPE}</label>
          <ComboBox
            withoutSearch
            value={filter.type}
            options={[
              {
                value: 'all',
                label: labels.ALL,
              },
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
            onChange={(value) => handleFilterChange('type', value.toString())}
          />
        </div>
      </div>
      <button
        className="px-3 py-1 bg-sky-200 rounded-md hover:bg-sky-300 disabled:hover:bg-gray-300 disabled:bg-gray-300 transition"
        disabled={
          filter.name === '' &&
          filter.email === '' &&
          filter.title === '' &&
          filter.instructorId === 'all' &&
          filter.type === 'all'
        }
        onClick={() =>
          setFilter({
            name: '',
            email: '',
            title: '',
            instructorId: 'all',
            type: 'all',
          })
        }
      >
        {labels.CLEAR_FILTERS}
      </button>
    </div>
  );
}

function AssignTopicButton({ studentId }: { studentId: Student['id'] }) {
  const updateStudent = useUpdateStudent();

  return (
    <Dialog>
      <Dialog.Trigger
        className="flex text-lg items-center rounded-md bg-yellow-300 gap-1 px-2 py-1 w-min text-yellow-950 transition hover:bg-yellow-400"
        onClick={() => console.log('hello')}
        buttonIcon={
          updateStudent.isLoading ? (
            <Spinner width={20} height={20} />
          ) : (
            <PlusIcon className="pointer-events-none" width={20} height={20} />
          )
        }
        buttonTitle={
          <span className="whitespace-nowrap">Téma hozzárendelése</span>
        }
      />

      <Dialog.Body className="animate-pop-in rounded-md px-3 py-0 shadow-2xl max-w-[90vw]">
        <Dialog.Header headerTitle="Téma hozzárendelése" />

        <TopicList
          onSelectTopicId={(topicId) =>
            updateStudent.mutate({
              id: studentId,
              assignedTopicId: topicId,
            })
          }
        />
      </Dialog.Body>
    </Dialog>
  );
}
