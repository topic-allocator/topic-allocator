import { NavLink, Outlet } from 'react-router-dom';
import { useLabel } from '@/contexts/labels/label-context';
import { GlobeIcon } from '@radix-ui/react-icons';
import { useSession } from '@/contexts/session/session-context';
import type { Locale } from '@lti/server/src/labels';
import ComboBox from '@/components/ui/combo-box';

export default function Layout() {
  const session = useSession();
  const { labels, locale, setLocale } = useLabel();

  return (
    <>
      <div className="header z-50 sticky top-0 flex min-h-[3rem] items-center justify-center border-b bg-opacity-80 text-xl backdrop-blur-sm">
        <nav className="flex self-stretch">
          <ul className="flex items-center gap-3">
            {session.isStudent && (
              <li className="h-full">
                <NavLink
                  className="flex h-full items-center"
                  to="/app/preferences"
                >
                  {labels.PREFERENCE_LIST}
                </NavLink>
              </li>
            )}

            <li className="h-full">
              <NavLink
                className="flex h-full items-center"
                to="/app/topic-list"
              >
                {labels.TOPIC_LIST}
              </NavLink>
            </li>

            {session.isInstructor && (
              <li className="h-full">
                <NavLink
                  className="flex h-full items-center"
                  to="/app/instructor"
                >
                  {labels.INSTRUCTOR}
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        <div className="absolute right-1 text-lg">
          <ComboBox
            className="min-w-[5rem]"
            withoutSearch
            options={[
              { value: 'hu', label: 'hu' },
              { value: 'en', label: 'en' },
            ]}
            value={locale}
            onChange={(value) => setLocale(value as Locale)}
            icon={
              <GlobeIcon className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            }
          />
        </div>
      </div>
      <Outlet />
    </>
  );
}
