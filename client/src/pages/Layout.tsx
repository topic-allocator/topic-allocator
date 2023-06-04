import { NavLink, Outlet } from 'react-router-dom';
import { Locales, useLabelContext } from '../labels';
import * as Select from '@radix-ui/react-select';
import { CheckIcon, GlobeIcon } from '@radix-ui/react-icons';

export default function Layout() {
  const { labels, setLocale, locale } = useLabelContext();

  return (
    <>
      <div
        className="header sticky top-0 grid min-h-[3rem] grid-cols-[auto_1fr_auto] 
        items-center border-b-[1px] border-gray-200 bg-sky-50 bg-opacity-80 text-xl 
        backdrop-blur-sm"
      >
        <div>&nbsp;</div>

        <nav className="flex self-stretch justify-self-center">
          <ul className="flex items-center gap-3">
            <li className="h-full">
              <NavLink className="flex h-full items-center align-middle" to="/app/preferences">
                {labels.TOPIC_PREFERENCES}
              </NavLink>
            </li>

            <li className="h-full">
              <NavLink className="flex h-full items-center align-middle" to="/app/topic-list">
                {labels.TOPIC_LIST}
              </NavLink>
            </li>

            <li className="h-full">
              <NavLink className="flex h-full items-center align-middle" to="/app/own-topics">
                {labels.OWN_TOPICS}
              </NavLink>
            </li>
          </ul>
        </nav>

        <Select.Root value={locale} onValueChange={(value) => setLocale(value as Locales)}>
          <Select.Trigger className="mx-3 justify-self-end outline-gray-300">
            <Select.Icon>
              <GlobeIcon
                width={25}
                height={25}
                className="p-1 hover:rounded-full hover:bg-gray-300"
              />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              className="overflow-hidden rounded-md bg-white shadow-lg "
              position="popper"
              sideOffset={5}
            >
              <SelectItem locale="hu" />
              <SelectItem locale="en" />
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      <Outlet />
    </>
  );
}

function SelectItem({ locale }: { locale: Locales }) {
  return (
    <Select.Item
      className="flex cursor-pointer items-center justify-end p-1 outline-none hover:bg-gray-300"
      value={locale}
    >
      <Select.ItemIndicator>
        <CheckIcon />
      </Select.ItemIndicator>
      <Select.ItemText>{locale}</Select.ItemText>
    </Select.Item>
  );
}
