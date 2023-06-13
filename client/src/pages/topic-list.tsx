import { PlusIcon } from '@radix-ui/react-icons';
import { useGetTopics } from '../queries';
import Spinner from '../components/ui/Spinner';
import { useToast } from '../contexts/toast/toastContext';

export default function TopicList() {
  const { data: topics, isLoading, isError } = useGetTopics();
  const { pushToast } = useToast();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-3">
      <h2 className="p-3 text-2xl">Meghirdetett témák</h2>

      <div className="overflow-x-auto rounded-md border p-10">
        <table className="h-1 w-full min-w-[700px] caption-bottom" border={1} rules="rows">
          <caption className="mt-4 text-gray-500">Meghirdetett témák</caption>
          <thead className="border-b text-left">
            <tr>
              <th className="p-3">Cím</th>
              <th className="p-3">Leírás</th>
              <th className="p-3">Típus</th>
              <th className="p-3">Oktató</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // @ts-ignore colspan expects number, but "100%" is valid
              <td colSpan="100%">
                <Spinner className="p-52" />
              </td>
            ) : (
              topics.map((topic) => (
                <tr key={topic.id} className="border-b transition hover:bg-gray-100">
                  <td className="p-3">{topic.title}</td>
                  <td className="p-3">{topic.description}</td>
                  <td className="p-3">{topic.type}</td>
                  <td className="p-3">{topic.instructor.name}</td>

                  <td>
                    <button
                      className="flex items-center rounded-full bg-emerald-100 text-emerald-800 transition hover:bg-emerald-300"
                      onClick={() =>
                        pushToast({
                          message: 'Preferencia listához adva',
                          type: 'success',
                        })
                      }
                    >
                      <PlusIcon className="pointer-events-none" width={30} height={30} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
