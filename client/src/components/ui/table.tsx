import { cn } from '@/utils';

export default function Table({ children }: { children: React.ReactNode }) {
  return (
    <table
      className="table h-1 min-h-[300px] w-full caption-bottom md:min-w-[700px]"
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
    <thead className="hidden text-base md:table-header-group">{children}</thead>
  );
}

type RowProps = {
  children: React.ReactNode;
} & JSX.IntrinsicElements['tr'];
function Row({ children, className, ...props }: RowProps) {
  return (
    <tr className={cn('mb-3', className)} {...props}>
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
          ? 'block p-3 text-xl font-bold md:table-cell md:text-base md:font-normal'
          : 'flex items-center gap-1 px-3 py-1 text-base md:table-cell'
      }
    >
      {label && !primary && (
        <span className="inline-block min-w-[4rem] font-bold md:hidden">
          {label}
        </span>
      )}
      {children}
    </td>
  );
}

Table.Caption = Caption;
Table.Head = Head;
Table.Row = Row;
Table.Cell = Cell;
