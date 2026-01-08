import { DateTimeFormatter, ZonedDateTime } from '@js-joda/core'

export function toFullUserDate(str: string): string {
  if (str) {
    const timeStrippedString = str.includes('T') ? str.split('T')[0] : str
    return DateTimeFormatter.ofPattern('dd/MM/yyyy').format(DateTimeFormatter.ISO_LOCAL_DATE.parse(timeStrippedString))
  }
  return ''
}

export function toUserDateTime(timestamp: ZonedDateTime): string {
  if (timestamp) {
    return DateTimeFormatter.ofPattern('d/M/yyyy HH:mm').format(timestamp.toLocalDateTime())
  }
  return ''
}
