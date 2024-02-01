import Button from '@/components/ui/button';
import FormField from '@/components/ui/form-field';
import Input from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import Table from '@/components/ui/table';
import { useLabels } from '@/contexts/labels/label-context';
import { useGetInstructors, useUpdateInstructorMinMax } from '@/queries';
import { cn } from '@/utils';
import { Instructor } from '@lti/server/src/db';
import { CaretUpIcon, GearIcon, ReloadIcon } from '@radix-ui/react-icons';
import { useEffect, useMemo, useState } from 'react';

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

  const [instructorSnapshot, setInstructorSnapshot] = useState<Instructor[]>(
    [],
  );
  const { data: instructors, isLoading, isError } = useGetInstructors();
  useEffect(() => {
    setInstructorSnapshot(instructors ?? []);
  }, [instructors]);

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
    <>
      <h2 className="text-2xl">{labels.INSTRUCTORS}</h2>

      <div className="join gap-1">
        <FormField label={labels.MIN_BASE}>
          <Input
            id="min"
            type="number"
            className="w-20"
            min={0}
            value={minBase}
            onChange={(e) => setMinBase(Number(e.target.value))}
          />
        </FormField>

        <FormField label={labels.MAX_BASE}>
          <Input
            id="capacity"
            type="number"
            className="w-20"
            min={0}
            value={maxBase}
            onChange={(e) => setMaxBase(Number(e.target.value))}
          />
        </FormField>
      </div>

      <Button
        className="btn-outline btn-success w-min whitespace-nowrap"
        label={labels.CALCULATE_VALUES}
        onClick={updateMinMax}
        icon={<GearIcon width={20} height={20} />}
      />

      <div className="card overflow-x-auto border border-neutral-500/50 bg-base-300 md:p-5">
        <Table>
          <Table.Caption>{labels.INSTRUCTORS}</Table.Caption>
          <Table.Head>
            <tr>
              {Object.entries(columns).map(([key, label]) => (
                <th
                  key={key}
                  className="cursor-pointer hover:bg-base-100"
                  onClick={() =>
                    handleChangeSorting(key as keyof typeof columns)
                  }
                >
                  <div className="flex items-center">
                    <p className="w-min">{label}</p>

                    <CaretUpIcon
                      className={cn('invisible inline transition', {
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
              instructorSnapshot.length &&
              sortedInstructors!.map((instructor) => (
                <Row
                  key={instructor.id}
                  instructor={instructor}
                  instructorSnapshot={
                    instructorSnapshot.find((i) => i.id === instructor.id)!
                  }
                />
              ))
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}

function Row({
  instructor,
  instructorSnapshot,
}: {
  instructor: Instructor;
  instructorSnapshot: Instructor;
}) {
  const { labels } = useLabels();
  const updateInstructorMinMax = useUpdateInstructorMinMax();

  const [editedInstructor, setEditedInstructor] = useState(instructor);
  useEffect(() => {
    setEditedInstructor(instructor);
  }, [instructor]);

  const didChange =
    editedInstructor.min !== instructorSnapshot.min ||
    editedInstructor.max !== instructorSnapshot.max;

  return (
    <Table.Row key={instructor.id}>
      <Table.Cell primary>{instructor.name}</Table.Cell>

      <Table.Cell label={`${labels.EMAIL}: `}>{instructor.email}</Table.Cell>

      <Table.Cell label={`${labels.MIN}: `}>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={0}
            className="input-ghost w-20"
            value={editedInstructor.min}
            onChange={(e) =>
              void setEditedInstructor((prev) => ({
                ...prev,
                min: Number(e.target.value),
              }))
            }
          />

          <Button
            className={cn('btn-square btn-outline btn-xs', {
              invisible: editedInstructor.min === instructorSnapshot.min,
            })}
            icon={<ReloadIcon className="-scale-x-100" />}
            onClick={() =>
              setEditedInstructor((prev) => ({
                ...prev,
                min: instructorSnapshot.min,
              }))
            }
          />
        </div>
      </Table.Cell>

      <Table.Cell label={`${labels.MAX}: `}>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={0}
            className="input-ghost w-20"
            value={editedInstructor.max}
            onChange={(e) =>
              void setEditedInstructor((prev) => ({
                ...prev,
                max: Number(e.target.value),
              }))
            }
          />

          <Button
            className={cn('btn-square btn-outline btn-xs', {
              invisible: editedInstructor.max === instructorSnapshot.max,
            })}
            icon={<ReloadIcon className="-scale-x-100" />}
            onClick={() =>
              setEditedInstructor((prev) => ({
                ...prev,
                max: instructorSnapshot.max,
              }))
            }
          />
        </div>
      </Table.Cell>

      <Table.Cell label={`${labels.CAPACITY_COEFFICIENT}: `}>
        {instructor.capacityCoefficient}
      </Table.Cell>

      <Table.Cell>
        <Button
          label={labels.SAVE}
          className={cn('btn-outline btn-success invisible', {
            visible: didChange,
          })}
          icon={<GearIcon width={25} height={25} />}
          onClick={() =>
            void updateInstructorMinMax.mutate([
              {
                id: instructor.id,
                min: editedInstructor.min,
                max: editedInstructor.max,
              },
            ])
          }
        />
      </Table.Cell>
    </Table.Row>
  );
}
