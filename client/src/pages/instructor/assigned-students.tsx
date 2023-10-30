import ComboBox from '@/components/ui/ComboBox';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import Table from '@/components/ui/Table';
import { useLabel } from '@/contexts/labels/labelContext';
import { useGetAssignedStudentsForInstructor } from '@/queries';
import { cn } from '@/utils';
import { CaretUpIcon } from '@radix-ui/react-icons';
import { SetStateAction, useMemo, useState } from 'react';

const columns = {
  name: 'Név',
  email: 'Email',
  topicTitle: 'Téma címe',
  topicType: 'Típus',
};

export default function AssignedStudents() {
  const { labels } = useLabel();
  const {
    data: students,
    isLoading,
    isError,
  } = useGetAssignedStudentsForInstructor();

  const [filter, setFilter] = useState({
    name: '',
    email: '',
    title: '',
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
        topicTitle: s.assignedTopic.title,
        topicType: s.assignedTopic.type,
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

        const typeMatch =
          filter.type === 'all' || student.topicType === filter.type;

        return nameMatch && emailMatch && titleMatch && typeMatch;
      });
  }, [students, filter]);

  const sortedStudents = useMemo(() => {
    return filteredStudents?.toSorted((a, b) => {
      if (sorting.order === 'asc') {
        return a[sorting.key] > b[sorting.key] ? 1 : -1;
      }

      return a[sorting.key] < b[sorting.key] ? 1 : -1;
    });
  }, [filteredStudents, sorting]);

  if (isError) {
    return <div>Error</div>;
  }
  return (
    <div className="mx-auto max-w-4xl p-3 flex flex-col gap-3">
      <h2 className="text-2xl">{labels.ASSIGNED_STUDENTS}</h2>
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
                      Nincsenek megjeleníthető találatok...
                    </p>
                  </td>
                }
              </tr>
            ) : (
              sortedStudents!.map((student) => (
                <Table.Row key={student.id}>
                  <Table.Cell primary>{student.name}</Table.Cell>

                  <Table.Cell label="Email: ">{student.email}</Table.Cell>

                  <Table.Cell label="Téma címe: ">
                    {student.topicTitle}
                  </Table.Cell>

                  <Table.Cell label="Típus: ">{student.topicType}</Table.Cell>
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
    type: string;
  };
  setFilter: React.Dispatch<SetStateAction<typeof filter>>;
}) {
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
            Név:
          </label>
          <Input
            id="titleFilter"
            placeholder="Név..."
            value={filter.name}
            onChange={(e) => handleFilterChange('name', e.target.value)}
          />
        </div>

        <div className="flex gap-1 items-center p-1 rounded-md">
          <label className="min-w-[7ch] md:min-w-fit" htmlFor="titleFilter">
            Email:
          </label>
          <Input
            id="titleFilter"
            placeholder="Email..."
            value={filter.email}
            onChange={(e) => handleFilterChange('email', e.target.value)}
          />
        </div>

        <div className="flex gap-1 items-center p-1 rounded-md">
          <label className="min-w-[7ch] md:min-w-fit" htmlFor="titleFilter">
            Cím:
          </label>
          <Input
            id="titleFilter"
            placeholder="Téma címe..."
            value={filter.title}
            onChange={(e) => handleFilterChange('title', e.target.value)}
          />
        </div>

        <div className="flex gap-1 items-center p-1 rounded-md">
          <label className="min-w-[7ch] md:min-w-fit">Típus:</label>
          <ComboBox
            withoutSearch
            value={filter.type}
            options={[
              {
                value: 'all',
                label: 'Összes',
              },
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
          filter.type === 'all'
        }
        onClick={() =>
          setFilter({
            name: '',
            email: '',
            title: '',
            type: 'all',
          })
        }
      >
        Szűrők törlése
      </button>
    </div>
  );
}
