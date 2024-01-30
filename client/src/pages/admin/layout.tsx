import { useLabels } from '@/contexts/labels/label-context';
import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  const { labels } = useLabels();

  return (
    <>
      <div className="hidden w-full justify-center bg-base-200 p-0 pb-1 lg:flex">
        <ul className="menu menu-horizontal gap-1 p-0">
          <li>
            <NavLink to="/app/admin/instructors">{labels.INSTRUCTORS}</NavLink>
          </li>
          <li>
            <NavLink to="/app/admin/solver">{labels.SOLVER}</NavLink>
          </li>
        </ul>
      </div>

      <main className="mx-auto flex max-w-5xl flex-col gap-3 p-3">
        <Outlet />
      </main>
    </>
  );
}
