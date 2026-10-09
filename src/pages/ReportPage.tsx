import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link, useParams } from "react-router-dom"
import { REPORT_REASONS } from "../types/index.ts"
import type { ReportReason } from "../types/index.ts"
import { getMovie } from "../services/movieService.ts"
import { getSeries } from "../services/seriesService.ts"
import { isReportTargetType, reportContent } from "../services/reportService.ts"
import { errorMessage } from "../services/api.ts"
import RequestStatus from "../components/RequestStatus.tsx"

const MAX_REASON_LENGTH = 1000
// room for the "Other: " prefix inside the backend's 1000 characters
const MAX_OTHER_LENGTH = MAX_REASON_LENGTH - 'Other: '.length

export default function ReportPage() {
  // route: /report/:type/:id, e.g. /report/movie/3 or /report/series/1
  const { type, id = '' } = useParams()
  const targetType = isReportTargetType(type) ? type : null

  // title of what is being reported, so the user knows what they report
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  //holds the selected option
  const [selectedReason, setSelectedReason] = useState<ReportReason | "">("")
  //when the user selects "Other" - holds the description
  const [otherReasonDescription, setOtherReasonDescription] = useState("")

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!targetType) return undefined
    let cancelled = false
    setLoading(true)
    setLoadError('')

    const load = targetType === 'movie' ? getMovie(id) : getSeries(id)
    load
      .then((content) => {
        if (!cancelled) setTitle(content.title)
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(errorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [targetType, id])

  // a reason is required, and "Other" also needs its description
  const canSave = selectedReason !== ""
    && (selectedReason !== "Other" || otherReasonDescription.trim() !== "")

  // the form only opens the confirmation box
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (canSave) setShowConfirmation(true)
  }

  async function confirmReport() {
    if (!targetType || selectedReason === "") return
    setSending(true)
    setSendError('')
    try {
      await reportContent({
        targetType,
        targetId: Number(id),
        // the backend takes one free-text reason
        reason: selectedReason === "Other"
          ? `Other: ${otherReasonDescription.trim()}`
          : selectedReason,
      })
      setSent(true)
    } catch (err) {
      setSendError(errorMessage(err))
    }
    setSending(false)
    setShowConfirmation(false)
  }

  if (!targetType) {
    return <div role="alert" className="alert alert-error m-4">We couldn't find that video.</div>
  }

  // where "Back" goes: the movie or the series that was being watched
  const backLink = targetType === 'movie' ? `/watch/${id}` : `/series/${id}/seasons`

  return (
    <div className="flex justify-center p-4 sm:p-6">
      <div className="card bg-neutral w-full max-w-lg shadow-xl">
        <RequestStatus loading={loading} error={loadError} isEmpty={false} emptyMessage="">
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
              {REPORT_REASONS.map((reason) => (
                <label className="label cursor-pointer justify-between" key={reason}>
                  <span>{reason}</span>
                  <input
                    type="radio"
                    className="radio radio-primary"
                    name="reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                  />
                </label>
              ))}

              {/*if "Other" is selected */}
              {selectedReason === "Other" && (
                <textarea
                  className="textarea textarea-bordered w-full"
                  placeholder="Write the reason..."
                  aria-label="Other reason"
                  required
                  maxLength={MAX_OTHER_LENGTH}
                  value={otherReasonDescription}
                  onChange={(e) => setOtherReasonDescription(e.target.value)}
                />
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
