import { cn } from '../../utils';

export default function Table({ children }: { children: React.ReactNode }) {
  return (
    <table
      className="h-1 min-h-[300px] w-full caption-bottom md:min-w-[700px]"
      border={1}
      rules="rows"
    >
      {children}
    </table>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return <caption className="mt-4 text-gray-500">{children}</caption>;
}

function Head({ children }: { children: React.ReactNode }) {
  return (
    <thead className="hidden border-b bg-gray-100 text-left md:table-header-group">
      {children}
    </thead>
  );
}

type RowProps = {
  children: React.ReactNode;
} & JSX.IntrinsicElements['tr'];
function Row({ children, className, ...props }: RowProps) {
  return (
    <tr
      className={cn(
        'mb-3 border md:border-x-0 md:border-b md:border-t-0',
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

function Cell({
  children,
  primary,
  label,
}: {
  children: React.ReactNode;
  primary?: boolean;
  label?: string;
}) {
  return (
    <td
      className={
        primary
          ? 'block bg-gray-100 p-3 text-xl font-bold md:table-cell md:bg-inherit md:text-base md:font-normal'
          : 'block px-3 py-1 md:table-cell'
      }
    >
      {label && !primary && (
        <span className="font-bold md:hidden">{label}</span>
      )}
      {children}
    </td>
  );
}

Table.Caption = Caption;
Table.Head = Head;
Table.Row = Row;
Table.Cell = Cell;
