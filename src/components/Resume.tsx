import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'
import { sortByEventDate } from '@/libs/microCMS/utils'
import BriefcaseIcon from '@/components/tailwindui/Icons/BriefcaseIcon'

export default async function Resume() {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const spokenEvents = sortByEventDate(await microCMS.listEndedEvents())

  return (
    <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <BriefcaseIcon className="h-6 w-6 flex-none" />
        <span className="ml-3">Spoken events</span>
      </h2>
      <ol className="mt-6 space-y-4">
        {spokenEvents.map((event) => (
          <li key={event.id} className="flex gap-4">
            <dl className="flex flex-auto flex-wrap gap-x-2">
              <dt className="sr-only">Company</dt>
              <dd className="w-full flex-none text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {event.title}
              </dd>
              <dt className="sr-only">Role</dt>
              <dd className="text-xs text-zinc-500 dark:text-zinc-400">
                {event.session_title}
              </dd>
              <dt className="sr-only">Date</dt>
              <dd className="ml-auto text-xs text-zinc-400 dark:text-zinc-500">
                {event.date}
              </dd>
            </dl>
          </li>
        ))}
      </ol>
    </div>
  )
}

