import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Series } from '../types/index.ts';
import { getAllSeries } from '../services/seriesService.ts';
import { errorMessage } from '../services/api.ts';
import RequestStatus from '../components/RequestStatus.tsx';

function SeriesListPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAllSeries()
      .then(setSeries)
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Series</h1>

      <RequestStatus
        loading={loading}
        error={error}
        isEmpty={series.length === 0}
        emptyMessage="There are no series yet."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {series.map((item) => (
            <div key={item.id} className="card bg-base-200">
              <div className="card-body p-4">
                <h2 className="card-title text-lg">{item.title}</h2>
                <span className="badge badge-outline">{item.category}</span>
                <p className="text-sm opacity-70 line-clamp-3">{item.description}</p>
                <div className="card-actions justify-end">
                  <Link to={`/series/${item.id}/seasons`} className="btn btn-primary btn-sm">
                    See seasons
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </RequestStatus>
    </div>
  );
}

export default SeriesListPage;
