// CATALOG (landing page and search show movies and series together)

// one movie or series as shown in the catalog; "kind" tells them apart
export interface CatalogItem {
  kind: 'movie' | 'series'
  id: number
  title: string
  category: string
}

export type CatalogType = 'all' | CatalogItem['kind']

export interface CatalogFilters {
  query: string
  type: CatalogType
  // key of the category (lowercase), or '' for every category
  category: string
}

// MOVIES

// shape coming from the backend (only 'active' movies are listed by it)
export interface MovieDTO {
  id: number
  id_author: number
  path: string
  title: string
  category: string
  views: number
  description: string
  state: string
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
  // the backend only lists movies whose state is exactly 'active'
  state: 'active'
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


/** REVIEWS (like / dislike) */

// the backend only accepts reviews of movies and episodes (not whole series)
export type ReviewTargetType = 'movie' | 'episode'

// the backend already uses camelCase for reviews
export interface Review {
  id: number
  viewerId: number
  // true = like, false = dislike
  rating: boolean
  audiovisualId: number
  audiovisualType: ReviewTargetType
}

export type ReviewRequest = Omit<Review, 'id'>

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

// what can be reported (episodes are reported through their series)
export type ReportTargetType = 'movie' | 'series'

// body of POST /api/reports: the backend takes the reporter from the token
export interface ReportRequest {
  targetType: ReportTargetType
  targetId: number
  // one free-text reason (max 1000 characters); the form sends the chosen label or "Other: <text>"
  reason: string
}
/** APPEALS */

export type AppealDecision = 'approved' | 'rejected'
// "pending" until an administrator decides
export type AppealStatus = 'pending' | AppealDecision

// appeal as the backend sends it (camelCase; reportId is the moderation case id)
export interface AppealDTO {
  id: number
  description: string
  reportId: number
  administratorId: number | null
  reviewed: boolean
  decision: AppealDecision | null
}

// "reviewed" and "decision" say the same thing twice, so the app keeps a single status
export interface Appeal {
  id: number
  description: string
  reportId: number
  administratorId: number | null
  status: AppealStatus
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

// fields a user can change in their own profile
export type ProfileUpdate = Partial<Pick<User, 'username' | 'firstName' | 'lastName' | 'email'>>

// GET /api/viewers/me, converted: the viewer's account plus their activity
export interface ViewerProfile {
  user: User
  uploadedCount: number
  reviewsCount: number
  // computed by the backend: reports received by content this viewer uploaded
  reportsReceivedCount: number
  appeals: Appeal[]
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
