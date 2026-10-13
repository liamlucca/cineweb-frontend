// CATALOG (landing page and search show movies and series together)

// one movie or series as shown in the catalog; "kind" tells them apart
export interface CatalogItem {
  kind: 'movie' | 'series'
  id: number
  title: string
  category: string
  description: string
  // "/thumbnails/..." (for a series, its cover or first episode); null shows a gradient instead
  thumbnailPath: string | null
  // seconds, only for movies; null when unknown
  duration: number | null
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
  // username of the uploader, joined by the backend
  uploader_user_name?: string
  // "/thumbnails/..." captured when it was uploaded; null for old movies
  thumbnail_path?: string | null
  // length in seconds; null for old movies
  duration?: number | null
}

// fields a viewer can change from "My Videos"
export type MovieUpdate = Pick<MovieDTO, 'title' | 'category' | 'description'>

// JSON sent in the "data" part of the upload request.
// The backend takes the uploader from the token and sets views and state itself.
export interface MovieUploadData {
  title: string
  category: string
  description: string
  // seconds, read from the file in the browser (left out when unknown)
  duration?: number
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
  // username of that user, or null if the backend did not send it
  uploaderUsername: string | null
  // cover, or the thumbnail of the first episode (the backend chooses); null when there is none
  thumbnailPath: string | null
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
  thumbnailPath: string | null
  duration: number | null
}

// shapes coming from the backend (snake_case, converted by seriesService)
export interface SeriesDTO {
  id: number
  id_author: number
  title: string
  category: string
  description: string
  state: boolean | string
  uploader_user_name?: string
  thumbnail_path?: string | null
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
  thumbnail_path?: string | null
  duration?: number | null
}

// fields an uploader can change from "My Videos"
export type SeriesUpdate = Pick<Series, 'title' | 'category' | 'description'>

// JSON bodies sent to create series content (the backend takes the uploader from the token)
export interface SeriesUploadData {
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
  // seconds, read from the file in the browser (left out when unknown)
  duration?: number
}

// fields an uploader can change in a season or an episode (they cannot move to another series or season)
export type SeasonUpdate = Partial<Pick<SeasonUploadData, 'season_number' | 'description'>>
export type EpisodeUpdate = Partial<Pick<EpisodeUploadData, 'episode_number' | 'title' | 'description'>>


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

// the backend takes the viewer from the token
export type ReviewRequest = Omit<Review, 'id' | 'viewerId'>

/** WATCH LATER (sketch 3) */

// what can be saved for later: a movie or a whole series
export type WatchLaterType = 'movie' | 'series'

// one item of the viewer's list ("WatchLater" in the diagram), with the content it points to
export interface WatchLaterItem {
  id: number
  viewerId: number
  audiovisualId: number
  audiovisualType: WatchLaterType
  addedAt: string
  title: string
  category: string
  description: string
}

/** REPORTS */

// A reason a viewer can choose when reporting ("ReportReason" in the diagram).
// Administrators manage the catalog (GET/POST/PATCH/DELETE /api/report-types).
export interface ReportType {
  id: number
  name: string
  // true for types such as "Other", which need an explanation in the report
  requiresDetails: boolean
}

// what an administrator sends to create or edit a report type
export type ReportTypeInput = Pick<ReportType, 'name' | 'requiresDetails'>

// what can be reported (episodes are reported through their series)
export type ReportTargetType = 'movie' | 'series'

// body of POST /api/reports: the backend takes the reporter from the token
export interface ReportRequest {
  targetType: ReportTargetType
  targetId: number
  reportTypeId: number
  // optional explanation (max 1000 characters); required when the type requiresDetails
  details?: string
}
// A moderation case opens when content gets 3 reports; it is what an appeal is about.
// pending: the owner can appeal · appealed: waiting for an administrator ·
// upheld: the appeal was rejected and the content suspended · dismissed: the content stays online
export type ModerationCaseStatus = 'pending' | 'appealed' | 'upheld' | 'dismissed'

// how many reports of one type a case has (computed by the backend)
export interface ReasonCount {
  reportTypeId: number
  reportType: string
  count: number
}

// the appeal of a case, if the owner sent one
export interface CaseAppeal {
  id: number
  description: string
  status: AppealStatus
}

// A case as GET /api/reports and GET /api/viewers/me/reports list it: the case, the reported
// content and its owner (the reported user), the reasons grouped by type, and the appeal
export interface ModerationCase {
  id: number
  targetType: ReportTargetType
  targetId: number
  status: ModerationCaseStatus
  reportCount: number
  createdAt: string
  content: {
    // null if the content no longer exists
    title: string | null
    // 'active', 'suspended' or 'deleted'
    state: string | null
    ownerId: number | null
    ownerUsername: string | null
  }
  reasons: ReasonCount[]
  appeal: CaseAppeal | null
}

// one report of a case; only administrators see them (GET /api/reports/:id)
export interface CaseReport {
  id: number
  reporterId: number
  reportType: string
  details: string | null
}

export interface ModerationCaseDetail extends ModerationCase {
  reports: CaseReport[]
}

// optional filters of the administrators' case list
export interface CaseFilters {
  id?: number
  status?: ModerationCaseStatus
  reportTypeId?: number
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

// a user as administrators see it: it can be deactivated
export interface Account extends User {
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
