import type { MicroCMSEventsRecord } from './types'

export const sortByEventDate = (events: MicroCMSEventsRecord[]) => {
  return events.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}
