import { useLabels } from '@/contexts/labels/label-context';
import { NavLink, Outlet } from 'react-router-dom';

export default function InstructorLayout() {
  const { labels } = useLabels();

  return (
    <>
      <div className="bg-base-200 hidden w-full justify-center p-0 pb-1 lg:flex">
        <ul className="menu menu-horizontal gap-1 p-0">
          <li>
            <NavLink to="/app/instructor/own-topics">
              {labels.OWN_TOPICS}
            </NavLink>
          </li>
          <li>
            <NavLink to="/app/instructor/assigned-students">
              {labels.ASSIGNED_STUDENTS}
            </NavLink>
          </li>
        </ul>
      </div>

      <Outlet />
    </>
  );
}
