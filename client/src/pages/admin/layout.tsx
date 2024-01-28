import { useLabels } from '@/contexts/labels/label-context';
import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  const { labels } = useLabels();

  return (
    <>
      <div className="header z-40 flex sticky top-[3rem] min-h-[2.5rem] items-center justify-center border-b bg-opacity-80 text-lg backdrop-blur-sm">
        <nav className="flex self-stretch">
          <ul className="flex items-center gap-3">
            <li className="h-full">
              <NavLink
                className="flex h-full items-center"
                to="/app/admin/instructors"
              >
                {labels.INSTRUCTORS}
              </NavLink>
            </li>
            <li className="h-full">
              <NavLink
                className="flex h-full items-center"
                to="/app/admin/solver"
              >
                {labels.SOLVER}
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <Outlet />
    </>
  );
}
