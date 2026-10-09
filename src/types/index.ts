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

// fields a viewer can change from "My Videos"
export type MovieUpdate = Pick<MovieDTO, 'title' | 'category' | 'description'>

// JSON sent in the "data" part of the upload request (the backend requires id_author for now)
export interface MovieUploadData {
  id_author: number
  title: string
  category: string
  views: number
  description: string
  report: boolean
  state: boolean
}

// SERIES

// Shapes the pages use. Names follow the diagram, except where it is known to be wrong:
// Series uses "id" (not "idSerie") and Season points to its series with "seriesId" (not "audiovisualId").
// Seasons and episodes are fetched separately, so there are no "seasons" / "episodes" arrays here.

export interface Series {
  id: number
  title: string
  category: string
  description: string
  // id of the user who uploaded it ("upladerId" in the diagram, a typo)
  uploaderId: number
}

export interface Season {
  id: number
  seriesId: number
  seasonNumber: number
  description: string
}

export interface Episode {
  id: number
  seasonId: number
  number: number
  title: string
  description: string
  path: string
}

// shapes coming from the backend (snake_case, converted by seriesService)
export interface SeriesDTO {
  id: number
  id_author: number
  title: string
  category: string
  description: string
  state: boolean | string
}

export interface SeasonDTO {
  id: number
  id_serie: number
  season_number: number
  description: string
}

export interface EpisodeDTO {
  id: number
  id_season: number
  episode_number: number
  title: string
  description: string
  path: string
  views: number
  state: string
  id_author: number
}

// JSON bodies sent to create series content (the backend requires id_author for now)
export interface SeriesUploadData {
  id_author: number
  title: string
  category: string
  description: string
}

export interface SeasonUploadData {
  id_serie: number
  season_number: number
  description: string
}

export interface EpisodeUploadData {
  id_season: number
  episode_number: number
  title: string
  description: string
  id_author: number
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


/** USERS */

export type UserRole = 'administrator' | 'viewer'

export interface User {
  id: number
  username: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  role: UserRole
}

// user as the backend sends it (snake_case, converted to User by authService)
export interface UserDTO {
  id_user: number
  user_name: string
  first_name: string
  last_name: string
  email: string
  role: UserRole
  active: boolean
}

/** AUTH - request/response DTOs */

export interface LoginRequest {
  // email or username: the backend accepts either one
  login: string
  password: string
}

// public registration always creates a viewer, so there is no role here
export interface RegisterRequest {
  username: string
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
}

export interface AuthResponse {
  token: string
  user: User
}
