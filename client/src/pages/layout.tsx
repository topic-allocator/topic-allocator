import { NavLink, Outlet } from 'react-router-dom';
import { useLabels } from '@/contexts/labels/label-context';
import { GlobeIcon } from '@radix-ui/react-icons';
import { useSession } from '@/contexts/session/session-context';
import type { Locale } from '@lti/server/src/labels';
import ComboBox from '@/components/ui/combo-box';
import AssignedTopicModal from '@/components/assigned-topic-modal';
import { useGetAssignedTopicsForStudent } from '@/queries';

export default function Layout() {
  const session = useSession();
  const { labels, locale, setLocale } = useLabels();

  return (
    <>
      {session.isStudent && <AssignedTopicModal />}

      <header className="navbar sticky top-0 z-50 min-h-0 bg-base-200 p-0">
        <div className="navbar-start">
          <MobileNav />

          <NavLink to={'/app/topic-list'} className="btn btn-ghost text-xl">
            Topic Allocator
          </NavLink>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-1 p-0 text-lg">
            {session.isStudent && (
              <li>
                <PreferenceListLink />
              </li>
            )}
            <li>
              <NavLink to="/app/topic-list">{labels.TOPIC_LIST}</NavLink>
            </li>
            {session.isInstructor && (
              <li>
                <NavLink to="/app/instructor">{labels.INSTRUCTOR}</NavLink>
              </li>
            )}
            {session.isAdmin && (
              <li>
                <NavLink to="/app/admin">{labels.ADMIN}</NavLink>
              </li>
            )}
          </ul>
        </div>

        <div className="navbar-end">
          <ComboBox
            className="m-1 w-fit"
            withoutSearch
            options={[
              { value: 'hu', label: 'hu' },
              { value: 'en', label: 'en' },
            ]}
            value={locale}
            onChange={(value) => setLocale(value as Locale)}
            icon={<GlobeIcon />}
          />
        </div>
      </header>

      <Outlet />
    </>
  );
}

function PreferenceListLink() {
  const { data, isPending, isError } = useGetAssignedTopicsForStudent();
  const { labels } = useLabels();

  if (isPending) {
    return;
  }

  if (isError) {
    return <div>{labels.ERROR}</div>;
  }

  if (data.assignedTopic) {
    return;
  }

  return <NavLink to="/app/preferences">{labels.PREFERENCE_LIST}</NavLink>;
}

function MobileNav() {
  const { labels } = useLabels();
  const session = useSession();

  return (
    <div className="dropdown">
      <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h8m-8 6h16"
          />
        </svg>
      </div>
      <ul
        tabIndex={0}
        className="menu dropdown-content menu-sm z-[1] mt-3 w-52 rounded-box bg-base-200 p-2 shadow-2xl"
      >
        {session.isStudent && (
          <li>
            <PreferenceListLink />
          </li>
        )}

        <li>
          <NavLink to="/app/topic-list">{labels.TOPIC_LIST}</NavLink>
        </li>

        {session.isInstructor && (
          <li>
            <NavLink to="/app/instructor">{labels.INSTRUCTOR}</NavLink>
            <ul className="p-2">
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
          </li>
        )}
        {session.isAdmin && (
          <li>
            <NavLink to="/app/admin">{labels.ADMIN}</NavLink>
            <ul className="p-2">
              <li>
                <NavLink to="/app/admin/instructors">
                  {labels.INSTRUCTORS}
                </NavLink>
              </li>
              <li>
                <NavLink to="/app/admin/solver">{labels.SOLVER}</NavLink>
              </li>
            </ul>
          </li>
        )}
      </ul>
    </div>
  );
}
