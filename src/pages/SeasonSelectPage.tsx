import { Link, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import type { Episode, Season, Series } from "../types/index.ts"
import { getEpisodes, getSeasons, getSeries } from "../services/seriesService.ts"
import { errorMessage } from "../services/api.ts"
import useAuth from "../hooks/useAuth.ts"
import RequestStatus from "../components/RequestStatus.tsx"
import Thumbnail from "../components/Thumbnail.tsx"
import EpisodeList from "../components/EpisodeList.tsx"
import WatchLaterButton from "../components/WatchLaterButton.tsx"
import useDocumentTitle from "../hooks/useDocumentTitle.ts"

// Page of a series (sketch 4): its details, a season selector and the episodes of that season
function SeasonSelectPage() {
  // the route is /series/:id/seasons, so there is no season in the URL: start with the first one
  const { id = '' } = useParams()
  const { user } = useAuth()

  const [series, setSeries] = useState<Series | null>(null)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeSeasonId, setActiveSeasonId] = useState<number | null>(null)

  // episodes of the active season, loaded each time the season changes
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loadingEpisodes, setLoadingEpisodes] = useState(false)
  const [episodesError, setEpisodesError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setActiveSeasonId(null)

    // both requests run at the same time
    Promise.all([getSeries(id), getSeasons(id)])
      .then(([seriesData, seasonsData]) => {
        if (cancelled) return
        setSeries(seriesData)
        setSeasons(seasonsData)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id])

  // until the user picks one, the first season is the active one
  const activeSeason = seasons.find(s => s.id === activeSeasonId) ?? seasons[0]
  const activeId = activeSeason?.id

  useEffect(() => {
    if (activeId === undefined) return undefined
    let cancelled = false
    setLoadingEpisodes(true)
    setEpisodesError('')
    getEpisodes(String(activeId))
      .then((data) => {
        if (!cancelled) setEpisodes(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) setEpisodesError(errorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoadingEpisodes(false)
      })
    return () => { cancelled = true }
  }, [activeId])

  // browser tab title
  useDocumentTitle(series?.title ?? 'Series')

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <RequestStatus loading={loading} error={error} isEmpty={!series} emptyMessage="We couldn't find that series.">
        {series && (
          <>
            <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start">
              <figure className="aspect-video rounded-box overflow-hidden bg-base-300 shadow-lg">
                <Thumbnail path={series.thumbnailPath} title={series.title} />
              </figure>
              <div className="space-y-3">
                <h1 className="text-2xl md:text-4xl font-bold leading-tight">{series.title}</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="badge badge-secondary">Series</span>
                  {series.category && <span className="badge badge-outline">{series.category}</span>}
                  <span className="opacity-70">{seasons.length} {seasons.length === 1 ? "season" : "seasons"}</span>
                </div>
                {series.uploaderUsername && <p className="text-sm opacity-70">Uploaded by @{series.uploaderUsername}</p>}
                {series.description && <p className="opacity-90 whitespace-pre-line">{series.description}</p>}
                <div className="flex flex-wrap items-center gap-2">
                  <WatchLaterButton type="series" id={series.id} />
                  {/* nobody can report their own series (the backend rejects it too) */}
                  {series.uploaderId !== user?.id && (
                    <Link to={`/report/series/${series.id}`} className="btn btn-ghost btn-sm text-error">⚑ Report series</Link>
                  )}
                </div>
              </div>
            </section>

            <section className="mt-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-bold">Episodes</h2>
                {seasons.length > 0 && (
                  <label className="flex items-center gap-2">
                    <span className="text-sm opacity-70">Season</span>
                    <select
                      className="select select-sm w-auto"
                      aria-label="Select a season"
                      value={activeSeason?.id}
                      onChange={(e) => setActiveSeasonId(Number(e.target.value))}
                    >
                      {seasons.map((season) => (
                        <option key={season.id} value={season.id}>Season {season.seasonNumber}</option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              {seasons.length === 0 && <p className="opacity-70">This series has no seasons yet.</p>}
              {activeSeason?.description && <p className="opacity-80 mb-4">{activeSeason.description}</p>}
              {activeSeason && (
                <RequestStatus loading={loadingEpisodes} error={episodesError} isEmpty={false} emptyMessage="">
                  <EpisodeList seriesId={series.id} seasonId={activeSeason.id} episodes={episodes} />
                </RequestStatus>
              )}
            </section>
          </>
        )}
      </RequestStatus>
    </div>
  )
}

export default SeasonSelectPage
