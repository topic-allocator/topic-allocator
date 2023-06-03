import { Dispatch, SetStateAction, useContext } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LabelContext, Locales } from '../labels';

export default function Layout({
  setLocale,
}: {
  setLocale: Dispatch<SetStateAction<Locales | undefined>>;
}) {
  const { TOPIC_LIST, TOPIC_PREFERENCES } = useContext(LabelContext);

  return (
    <>
      <div className="relative flex h-10 justify-center bg-blue-200">
        <nav className="flex items-center justify-self-center">
          <ul className="flex gap-3">
            <li>
              <NavLink to="/app/preferences">{TOPIC_PREFERENCES}</NavLink>
            </li>
            <li>
              <NavLink to="/app/topic-list">{TOPIC_LIST}</NavLink>
            </li>
          </ul>
        </nav>

        <button
          className="absolute right-[1rem] top-1/2 -translate-y-1/2"
          onClick={() => setLocale('hu')}
        >
          asd
        </button>
      </div>

      <Outlet />
    </>
  );
}
