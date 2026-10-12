import { Link } from 'react-router-dom';
import type { ModerationCase } from '../types/index.ts';
import {
  APPEAL_STATUS_BADGE, APPEAL_STATUS_TEXT, CASE_STATUS_BADGE, CASE_STATUS_TEXT, contentPath, formatDate,
} from '../utils/moderation.ts';

interface CaseSummaryProps {
  moderationCase: ModerationCase
  // whether to show who uploaded the content (administrators see it; the owner already knows)
  showOwner?: boolean
}

// What every case card shows: number, state, reported content, owner, reasons and appeal
function CaseSummary({ moderationCase, showOwner = true }: CaseSummaryProps) {
  const { content } = moderationCase;
  const isActive = content.state === 'active';

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-bold">Case #{moderationCase.id}</h3>
        <span className={`badge badge-sm ${CASE_STATUS_BADGE[moderationCase.status]}`}>
          {CASE_STATUS_TEXT[moderationCase.status]}
        </span>
        {moderationCase.createdAt && (
          <span className="text-xs opacity-60">{formatDate(moderationCase.createdAt)}</span>
        )}
      </div>

      <p className="text-sm">
        <span className="badge badge-ghost badge-sm mr-2">{moderationCase.targetType === 'movie' ? 'Movie' : 'Series'}</span>
        {/* suspended or deleted content is hidden by the backend, so it is not linked */}
        {isActive
          ? <Link to={contentPath(moderationCase.targetType, moderationCase.targetId)} className="link font-semibold">{content.title}</Link>
          : <span className="font-semibold">{content.title ?? 'Content no longer available'}</span>}
        {!isActive && content.state && <span className="opacity-60"> ({content.state})</span>}
        {showOwner && content.ownerUsername && <span className="opacity-80"> · uploaded by @{content.ownerUsername}</span>}
      </p>

      <ul className="flex flex-wrap gap-2" aria-label="Reasons">
        {moderationCase.reasons.map((reason) => (
          <li key={reason.reportTypeId} className="badge badge-outline">
            {reason.reportType} × {reason.count}
          </li>
        ))}
      </ul>

      <p className="text-sm">
        {moderationCase.appeal
          ? (
            <>
              Appeal:{' '}
              <span className={`badge badge-sm ${APPEAL_STATUS_BADGE[moderationCase.appeal.status]}`}>
                {APPEAL_STATUS_TEXT[moderationCase.appeal.status]}
              </span>
            </>
          )
          : <span className="opacity-70">No appeal</span>}
      </p>
    </div>
  );
}

export default CaseSummary;
