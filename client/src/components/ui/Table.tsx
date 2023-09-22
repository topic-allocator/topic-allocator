import { ReactElement } from 'react';
import Spinner from './Spinner';

type Data = Array<
  Record<string, string | ReactElement | null> & { id: string | number }
>;

type TableProps = {
  data?: Data;
  labels: Record<keyof Data[number], string>;
  buttons?: (item: Data[number]) => ReactElement[];
  rowClassName?: (item: Data[number]) => string;
  onRowDoubleClick?: (item: Data[number]) => void;
};

export default function Table({
  data,
  buttons,
  labels,
  rowClassName,
  onRowDoubleClick,
}: TableProps) {
  return (
    <table
      className="h-1 w-full caption-bottom md:min-w-[700px]"
      border={1}
      rules="rows"
    >
      <caption className="mt-4 text-gray-500">Meghirdetett témák</caption>
      <thead className="hidden border-b text-left md:table-header-group">
        <tr>
          <th className="p-3">Cím</th>
          <th className="p-3">Leírás</th>
          <th className="p-3">Típus</th>
          <th className="p-3">Oktató</th>
        </tr>
      </thead>
      <tbody>
        {!data ? (
          <tr>
            {
              // @ts-ignore reason: colspan expects number, but "100%" is valid
              <td colSpan="100%">
                <Spinner className="p-52" />
              </td>
            }
          </tr>
        ) : (
          data.map((item) => (
            <tr
              key={item.id}
              className={rowClassName?.(item)}
              onDoubleClick={() => onRowDoubleClick?.(item)}
            >
              {Object.entries(item)
                .filter(([key, _]) => key !== 'id')
                .filter(([_, value]) => value !== null)
                .map(([key, value]) => (
                  <td className="block p-3 md:table-cell">
                    <span className="font-bold md:hidden">
                      {labels[key as keyof Data[number]]}:&nbsp;
                    </span>
                    {value}
                  </td>
                ))}

              {buttons?.(item)}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
