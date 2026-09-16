// MOVIES

export interface Movie {
  id: number
  title: string
  platform: string
  file: string
}

// shape coming from the backend
export interface MovieDTO {
  id: number
  path: string
  title: string
  category: string
  views: number
  description: string
  state: boolean
}

// SERIES

export interface Episode {
  id: number
  number: number
  title: string
  description: string
  path: string
}

export interface Season {
  id: number
  number: number
  description: string
  episodes: Episode[]
}

export interface Series {
  id: number
  title: string
  category: string
  seasons: Season[]
}


/** REPORTS */

/* Array with the possible Reasons for a Report */
export const REPORT_REASONS = [
  'Violence',
  'Sexual content',
  'Harassment and bullying',
  'Hate speech and abuse',
  'Dangerous or harmful activities',
  'Other'
] as const

/* Defines the report reason type */
export type ReportReason = typeof REPORT_REASONS[number]

/** would it be necessary to store the user id to avoid reporting more than once? */
export interface Report {
  count: number
  reason: ReportReason
  other_reason: string

  user_ids: number[]
}
 /** COMPLAINTS */

export interface Complaint {
  media_id: number

  // reason with the highest number of reports
  report_type: ReportReason

  reported_user_id: number
  admin_id: number
  status: boolean
  complaint_id: number
}

/** temporary, until the backend is further along - used to show the new/viewed state */
export type ComplaintUI = Complaint & {
  is_new: boolean
  media_name: string
}
