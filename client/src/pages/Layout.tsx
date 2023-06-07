import { NavLink, Outlet } from 'react-router-dom';
import { Locales, useLabelContext } from '../contexts/labels/labelContext';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectIcon,
} from '../components/ui/Select';
import { GlobeIcon } from '@radix-ui/react-icons';

export default function Layout() {
  const { labels, locale, setLocale } = useLabelContext();

  return (
    <>
      <div
        className="header sticky top-0 flex min-h-[3rem] items-center justify-center  
         border-b-[1px] border-gray-200 bg-sky-50 bg-opacity-80 text-xl 
        backdrop-blur-sm"
      >
        <div>&nbsp;</div>

        <nav className="flex self-stretch">
          <ul className="flex items-center gap-3">
            <li className="h-full">
              <NavLink className="flex h-full items-center" to="/app/preferences">
                {labels.TOPIC_PREFERENCES}
              </NavLink>
            </li>

            <li className="h-full">
              <NavLink className="flex h-full items-center" to="/app/topic-list">
                {labels.TOPIC_LIST}
              </NavLink>
            </li>

            <li className="h-full">
              <NavLink className="flex h-full items-center" to="/app/own-topics">
                {labels.OWN_TOPICS}
              </NavLink>
            </li>
          </ul>
        </nav>

        <Select value={locale} onValueChange={(value) => setLocale(value as Locales)}>
          <SelectTrigger className="right-1 ml-auto w-min sm:absolute">
            <SelectValue />
            <SelectIcon>
              <GlobeIcon width={25} height={25} className="rounded-full p-1 " />
            </SelectIcon>
          </SelectTrigger>
          <SelectContent className="w-min">
            <Item locale="hu" />
            <Item locale="en" />
          </SelectContent>
        </Select>
      </div>

      <Outlet />
    </>
  );
}

function Item({ locale }: { locale: Locales }) {
  return (
    <SelectItem
      className="flex cursor-pointer items-center justify-end p-1 outline-none"
      value={locale}
    >
      {locale}
    </SelectItem>
  );
}
