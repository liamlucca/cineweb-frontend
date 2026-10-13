import { useParams, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import type { Episode, Season, Series } from "../types/index.ts"
import { getEpisodes, getSeason, getSeries } from "../services/seriesService.ts"
import { errorMessage } from "../services/api.ts"
import RequestStatus from "../components/RequestStatus.tsx"
import EpisodeList from "../components/EpisodeList.tsx"
import useDocumentTitle from "../hooks/useDocumentTitle.ts"

// The episodes of one season (the upload form links here after adding an episode)
function EpisodeListPage() {
  // names must match the route in App.tsx: /series/:id/season/:seasonId/episodes
  const { id = '', seasonId = '' } = useParams()

  const [series, setSeries] = useState<Series | null>(null)
  const [season, setSeason] = useState<Season | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    Promise.all([getSeries(id), getSeason(seasonId), getEpisodes(seasonId)])
      .then(([seriesData, seasonData, episodesData]) => {
        if (cancelled) return
        setSeries(seriesData)
        setSeason(seasonData)
        setEpisodes(episodesData)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id, seasonId])

  // browser tab title
  useDocumentTitle(season && series ? `${series.title} · Season ${season.seasonNumber}` : 'Episodes')

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Link to={`/series/${id}/seasons`} className="link text-sm">← {series?.title ?? 'Back to the series'}</Link>
      <RequestStatus loading={loading} error={error} isEmpty={false} emptyMessage="">
        <h1 className="text-2xl md:text-3xl font-bold mt-2">{series?.title}</h1>
        <p className="opacity-70 mb-6">Season {season?.seasonNumber}{season?.description ? ` · ${season.description}` : ''}</p>
        <EpisodeList seriesId={id} seasonId={seasonId} episodes={episodes} />
      </RequestStatus>
    </div>
  )
}

export default EpisodeListPage
