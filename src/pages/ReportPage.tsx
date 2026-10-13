import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link, useParams } from "react-router-dom"
import type { ReportType } from "../types/index.ts"
import { getMovie } from "../services/movieService.ts"
import { getSeries } from "../services/seriesService.ts"
import { isReportTargetType, reportContent } from "../services/reportService.ts"
import { getReportTypes } from "../services/reportTypeService.ts"
import { errorMessage } from "../services/api.ts"
import RequestStatus from "../components/RequestStatus.tsx"
import useDocumentTitle from "../hooks/useDocumentTitle.ts"

const MAX_DETAILS_LENGTH = 1000

export default function ReportPage() {
  // route: /report/:type/:id, e.g. /report/movie/3 or /report/series/1
  const { type, id = '' } = useParams()
  const targetType = isReportTargetType(type) ? type : null

  // title of what is being reported, so the user knows what they report
  const [title, setTitle] = useState('')
  // the reasons come from the backend's catalog, managed by administrators
  const [reportTypes, setReportTypes] = useState<ReportType[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  //holds the selected report type
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null)
  //optional explanation, required for types such as "Other"
  const [details, setDetails] = useState("")

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!targetType) return undefined
    let cancelled = false
    setLoading(true)
    setLoadError('')

    const loadContent = targetType === 'movie' ? getMovie(id) : getSeries(id)
    Promise.all([loadContent, getReportTypes()])
      .then(([content, types]) => {
        if (cancelled) return
        setTitle(content.title)
        setReportTypes(types)
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(errorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [targetType, id])

  const selectedType = reportTypes.find((item) => item.id === selectedTypeId)
  // a reason is required, and types such as "Other" also need the explanation
  const canSave = selectedType !== undefined
    && (!selectedType.requiresDetails || details.trim() !== "")

  // the form only opens the confirmation box
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (canSave) setShowConfirmation(true)
  }

  async function confirmReport() {
    if (!targetType || !selectedType) return
    setSending(true)
    setSendError('')
    try {
      await reportContent({
        targetType,
        targetId: Number(id),
        reportTypeId: selectedType.id,
        ...(details.trim() ? { details: details.trim() } : {}),
      })
      setSent(true)
    } catch (err) {
      setSendError(errorMessage(err))
    }
    setSending(false)
    setShowConfirmation(false)
  }

  // browser tab title
  useDocumentTitle(title ? `Report "${title}"` : 'Report a video')

  if (!targetType) {
    return <div role="alert" className="alert alert-error m-4">We couldn't find that video.</div>
  }

  // where "Back" goes: the movie or the series that was being watched
  const backLink = targetType === 'movie' ? `/watch/${id}` : `/series/${id}/seasons`

  return (
    <div className="flex justify-center p-4 sm:p-6">
      <div className="card bg-neutral w-full max-w-lg shadow-xl">
        <RequestStatus
          loading={loading}
          error={loadError}
          isEmpty={reportTypes.length === 0}
          emptyMessage="Reporting is not available right now. Please try again later."
        >
          {sent ? (
            <div className="card-body gap-4">
              <h1 className="card-title">Thanks for your report</h1>
              <p>An administrator will review "{title}" if it receives enough reports.</p>
              <Link to={backLink} className="btn btn-primary">Back</Link>
            </div>
          ) : (
            <form className="card-body gap-3" onSubmit={handleSubmit}>
              <h1 className="card-title">Report "{title}"</h1>
              <p className="text-sm opacity-70">Why are you reporting this {targetType}?</p>

              {/*options: radio buttons only allow one to be selected*/}
              {reportTypes.map((reportType) => (
                <label className="label cursor-pointer justify-between" key={reportType.id}>
                  <span>{reportType.name}</span>
                  <input
                    type="radio"
                    className="radio radio-primary"
                    name="reportType"
                    value={reportType.id}
                    checked={selectedTypeId === reportType.id}
                    onChange={() => setSelectedTypeId(reportType.id)}
                  />
                </label>
              ))}

              {/*the explanation is optional, except for types such as "Other"*/}
              {selectedType && (
                <label className="flex flex-col gap-1">
                  <span className="text-sm">
                    {selectedType.requiresDetails ? 'Explain the reason' : 'Add details (optional)'}
                  </span>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="Write the reason..."
                    required={selectedType.requiresDetails}
                    maxLength={MAX_DETAILS_LENGTH}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                  />
                </label>
              )}

              {sendError && <div role="alert" className="alert alert-error text-sm">{sendError}</div>}

              <div className="card-actions justify-end mt-2">
                <Link to={backLink} className="btn btn-ghost">Close</Link>
                <button type="submit" className="btn btn-error" disabled={!canSave}>
                  Report
                </button>
              </div>
            </form>
          )}
        </RequestStatus>
      </div>

      {/*confirmation box: a DaisyUI modal opened with the modal-open class */}
      <div className={`modal ${showConfirmation ? 'modal-open' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-box">
          <p>Do you want to send this report?</p>
          <div className="modal-action">
            {/* only closes the box, so the user can still change the report */}
            <button type="button" className="btn btn-ghost" onClick={() => setShowConfirmation(false)} disabled={sending}>
              Cancel
            </button>
            <button type="button" className="btn btn-error" onClick={confirmReport} disabled={sending}>
              {sending && <span className="loading loading-spinner loading-sm" />}
              Send report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
