import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Review, ReviewTargetType } from '../types/index.ts';
import {
  changeReview, createReview, deleteReview, getReviews,
} from '../services/reviewService.ts';
import { errorMessage } from '../services/api.ts';
import useAuth from '../hooks/useAuth.ts';

interface ReviewButtonsProps {
  type: ReviewTargetType
  id: number
}

// Like / dislike buttons (sketch 6). Clicking your own vote again withdraws it.
function ReviewButtons({ type, id }: ReviewButtonsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    getReviews(type, id)
      .then((data) => {
        if (!cancelled) setReviews(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [type, id]);

  const likes = reviews.filter((review) => review.rating).length;
  const dislikes = reviews.length - likes;
  const myReview = reviews.find((review) => review.viewerId === user?.id);
  // only viewers rate content; guests and administrators just see the counts
  const canVote = user?.role === 'viewer';

  async function vote(rating: boolean) {
    if (!user) return;
    setBusy(true);
    setError('');
    try {
      if (!myReview) {
        const created = await createReview({
          // TODO: the backend takes viewerId from the body; it should take it from the token
          viewerId: user.id, rating, audiovisualId: id, audiovisualType: type,
        });
        setReviews((current) => [...current, created]);
      } else if (myReview.rating === rating) {
        await deleteReview(myReview.id);
        setReviews((current) => current.filter((review) => review.id !== myReview.id));
      } else {
        const changed = await changeReview(myReview.id, rating);
        setReviews((current) => current.map((review) => (review.id === changed.id ? changed : review)));
      }
    } catch (err) {
      setError(errorMessage(err));
    }
    setBusy(false);
  }

  if (loading) return <span className="loading loading-dots loading-sm" aria-label="Loading ratings" />;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className={`btn btn-sm ${myReview?.rating === true ? 'btn-success' : 'btn-outline'}`}
        onClick={() => vote(true)}
        disabled={!canVote || busy}
        aria-pressed={myReview?.rating === true}
        aria-label={`Like (${likes})`}
      >
        👍 {likes}
      </button>
      <button
        type="button"
        className={`btn btn-sm ${myReview?.rating === false ? 'btn-error' : 'btn-outline'}`}
        onClick={() => vote(false)}
        disabled={!canVote || busy}
        aria-pressed={myReview?.rating === false}
        aria-label={`Dislike (${dislikes})`}
      >
        👎 {dislikes}
      </button>

      {!user && <Link to="/login" className="link text-sm">Log in to rate</Link>}
      {myReview && <span className="text-xs opacity-70">Click your vote again to withdraw it.</span>}
      {error && <p role="alert" className="text-sm text-error w-full">{error}</p>}
    </div>
  );
}

export default ReviewButtons;
