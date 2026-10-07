import { useEffect, useState } from 'react';
import type { Season, Series } from '../types/index.ts';
import { getAllSeries } from '../services/seriesService.ts';
import { errorMessage } from '../services/api.ts';
import useAuth from '../hooks/useAuth.ts';
import RequestStatus from '../components/RequestStatus.tsx';
import NewSeriesForm from '../components/NewSeriesForm.tsx';
import NewSeasonForm from '../components/NewSeasonForm.tsx';
import NewEpisodeForm from '../components/NewEpisodeForm.tsx';

// Upload a series step by step: create the series, add seasons, then upload episodes
function UploadSeriesPage() {
  const { user } = useAuth();
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newestSeason, setNewestSeason] = useState<Season | null>(null);

  useEffect(() => {
    getAllSeries()
      .then(setSeries)
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  // ProtectedRoute only lets logged-in viewers in, so this only satisfies TypeScript
  if (!user) return null;

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold">Upload series</h1>
      <p className="text-sm opacity-70 mb-4">
        Create the series, add its seasons, and then upload the episodes of each season.
      </p>

      <RequestStatus loading={loading} error={error} isEmpty={false} emptyMessage="">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <NewSeriesForm
            authorId={user.id}
            onCreated={(created) => setSeries((current) => [...current, created])}
          />
          <NewSeasonForm series={series} onCreated={setNewestSeason} />
          <NewEpisodeForm series={series} authorId={user.id} newestSeason={newestSeason} />
        </div>
      </RequestStatus>
    </div>
  );
}

export default UploadSeriesPage;
