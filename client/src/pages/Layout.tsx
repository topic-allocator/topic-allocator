import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <div className="flex h-10 bg-blue-200">
        <h1 className="px-3 text-3xl">epikus lti</h1>

        <nav className="flex items-center justify-self-center">
          <ul className="flex gap-3">
            <li>
              <NavLink to="/app/preferences">Preferences</NavLink>
            </li>
            <li>
              <NavLink to="/app/list">List</NavLink>
            </li>
          </ul>
        </nav>
      </div>

      <Outlet />
    </>
  );
}
