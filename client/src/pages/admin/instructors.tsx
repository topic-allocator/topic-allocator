import Input from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import Table from '@/components/ui/table';
import { useLabels } from '@/contexts/labels/label-context';
import { useGetInstructors, useUpdateInstructorMinMax } from '@/queries';
import { cn } from '@/utils';
import { Instructor } from '@lti/server/src/db';
import { CaretUpIcon, GearIcon } from '@radix-ui/react-icons';
import { useMemo, useState } from 'react';

export default function Instructors() {
  const { labels } = useLabels();
  const columns = {
    name: labels.NAME,
    email: labels.EMAIL,
    min: labels.MIN,
    max: labels.MAX,
    capacityCoefficient: labels.CAPACITY_COEFFICIENT,
  } satisfies Partial<Record<keyof Instructor, string>>;
  const [sorting, setSorting] = useState<{
    key: keyof typeof columns;
    order: 'asc' | 'desc';
  }>({
    key: 'name',
    order: 'asc',
  });

  const updateInstructorMinMax = useUpdateInstructorMinMax();

  const [minBase, setMinBase] = useState(1);
  const [maxBase, setMaxBase] = useState(1);

  const { data: instructors, isLoading, isError } = useGetInstructors();

  const sortedInstructors = useMemo(() => {
    return instructors?.toSorted((a, b) => {
      if (sorting.order === 'asc') {
        return a[sorting.key] > b[sorting.key] ? 1 : -1;
      }

      return a[sorting.key] < b[sorting.key] ? 1 : -1;
    });
  }, [instructors, sorting]);

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

  function updateMinMax() {
    if (!instructors?.length) {
      return;
    }

    const data = instructors.map((instructor) => ({
      id: instructor.id,
      min: minBase * instructor.capacityCoefficient,
      max: maxBase * instructor.capacityCoefficient,
    }));

    return updateInstructorMinMax.mutate(data);
  }

  if (isError) {
    return <div>{labels.ERROR}</div>;
  }

  return (
    <main className="mx-auto max-w-4xl p-3 flex flex-col gap-3">
      <h2 className="text-2xl">{labels.INSTRUCTORS}</h2>

      <hr />

      <div className="grid gap-1 w-min md:grid-cols-[auto_1fr]">
        <label className="flex items-center whitespace-nowrap" htmlFor="min">
          {labels.MIN_BASE}
        </label>
        <div className="flex gap-3 items-center">
          <Input
            id="min"
            type="number"
            className="w-20"
            min={0}
            value={minBase}
            onChange={(e) => setMinBase(Number(e.target.value))}
          />
        </div>

        <label
          className="flex items-center whitespace-nowrap"
          htmlFor="capacity"
        >
          {labels.MAX_BASE}
        </label>
        <div className="flex gap-3 items-center">
          <Input
            id="capacity"
            type="number"
            className="w-20"
            min={0}
            value={maxBase}
            onChange={(e) => setMaxBase(Number(e.target.value))}
          />
        </div>
      </div>

      <button
        className="flex text-xl justify-between gap-1 items-center rounded-md bg-emerald-200 px-2 py-1 w-min text-emerald-950 transition hover:bg-emerald-300"
        onClick={updateMinMax}
      >
        <span className="whitespace-nowrap">{labels.CALCULATE_VALUES}</span>
        {updateInstructorMinMax.isLoading ? (
          <Spinner width={25} height={25} />
        ) : (
          <GearIcon width={25} height={25} />
        )}
      </button>

      <hr />

      <div className="overflow-x-auto rounded-md border md:p-10">
        <Table>
          <Table.Caption>{labels.INSTRUCTORS}</Table.Caption>
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
            ) : instructors?.length === 0 ? (
              <tr>
                {
                  // @ts-ignore reason: colspan expects number, but "100%" is valid
                  <td colSpan="100%">
                    <p className="text-center text-xl">
                      {labels.NO_RECORDS_FOUND}...
                    </p>
                  </td>
                }
              </tr>
            ) : (
              sortedInstructors!.map((instructor) => (
                <Table.Row key={instructor.id}>
                  <Table.Cell primary>{instructor.name}</Table.Cell>

                  <Table.Cell label={`${labels.EMAIL}: `}>
                    {instructor.email}
                  </Table.Cell>

                  <Table.Cell label={`${labels.LANGUAGE}: `}>
                    {instructor.min}
                  </Table.Cell>

                  <Table.Cell label={`${labels.INSTRUCTOR}: `}>
                    {instructor.max}
                  </Table.Cell>

                  <Table.Cell label={`${labels.CAPACITY_COEFFICIENT}: `}>
                    {instructor.capacityCoefficient}
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </main>
  );
}
