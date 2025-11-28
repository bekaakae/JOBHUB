// src/utils/dateUtils.js
import { format, formatDistanceToNow, isAfter, differenceInDays } from 'date-fns'

export const formatDate = (date) => {
  return format(new Date(date), 'MMM dd, yyyy')
}

export const formatDateTime = (date) => {
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

export const timeAgo = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export const isDeadlineApproaching = (deadline, days = 2) => {
  const deadlineDate = new Date(deadline)
  const now = new Date()
  const daysUntilDeadline = differenceInDays(deadlineDate, now)
  return daysUntilDeadline <= days && daysUntilDeadline >= 0
}

export const isExpired = (deadline) => {
  return new Date(deadline) < new Date()
}

