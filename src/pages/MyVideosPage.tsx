import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { MovieDTO, MovieUpdate, Series } from "../types/index.ts";
import RequestStatus from "../components/RequestStatus.tsx";
import {
  deleteMovie, getMovies, updateMovie, videoUrl,
} from "../services/movieService.ts";
import { getAllSeries } from "../services/seriesService.ts";
import { errorMessage } from "../services/api.ts";
import useAuth from "../hooks/useAuth.ts";
import MySeriesItem from "../components/MySeriesItem.tsx";

function MyVideosPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const [videos, setVideos] = useState<MovieDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // error of the last edit or delete, shown above the list
  const [actionError, setActionError] = useState("");
  // id of the video being saved or deleted, to disable its buttons
  const [busyVideoId, setBusyVideoId] = useState<number | null>(null);

  // Stores which video is currently being edited
  const [editingVideoId, setEditingVideoId] = useState<number | null>(null);

  // Data being edited
  const [editedTitle, setEditedTitle] = useState("");
  const [editedCategory, setEditedCategory] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  // Series uploaded by the logged-in user (each one can be edited or deleted)
  const [mySeries, setMySeries] = useState<Series[]>([]);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [seriesError, setSeriesError] = useState("");

  useEffect(() => {
    // There is no "movies of a user" endpoint, so all movies are fetched and filtered here
    getMovies()
      .then((allMovies) => setVideos(allMovies.filter((movie) => movie.id_author === userId)))
      .catch((err: unknown) => setLoadError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    // There is no "series of a user" endpoint, so all series are fetched and filtered here
    getAllSeries()
      .then((allSeries) => setMySeries(allSeries.filter((item) => item.uploaderId === userId)))
      .catch((err: unknown) => setSeriesError(errorMessage(err)))
      .finally(() => setLoadingSeries(false));
  }, [userId]);

  // Deletes a video from the backend
  const deleteVideo = async (video: MovieDTO) => {
    if (!window.confirm(`Delete "${video.title}"? This cannot be undone.`)) return;

    setBusyVideoId(video.id);
    setActionError("");
    try {
      await deleteMovie(video.id);
      // Removes the video from the list shown on screen
      setVideos((currentVideos) =>
        currentVideos.filter((v) => v.id !== video.id)
      );
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusyVideoId(null);
    }
  };

  // Starts editing a video
  const startEditing = (video: MovieDTO) => {
    setEditingVideoId(video.id);
    setEditedTitle(video.title);
    setEditedCategory(video.category);
    setEditedDescription(video.description);
    setActionError("");
  };

  // Cancels editing
  const cancelEditing = () => {
    setEditingVideoId(null);
    setEditedTitle("");
    setEditedCategory("");
    setEditedDescription("");
  };

  // Saves the video changes
  const saveEdit = async (id: number) => {
    if (editedTitle.trim() === "") {
      setActionError("The title can't be empty.");
      return;
    }

    const changes: MovieUpdate = {
      title: editedTitle.trim(),
      category: editedCategory.trim(),
      description: editedDescription.trim(),
    };

    setBusyVideoId(id);
    setActionError("");
    try {
      await updateMovie(id, changes);

      // Updates the video shown on screen
      setVideos((currentVideos) =>
        currentVideos.map((video) =>
          video.id === id ? { ...video, ...changes } : video
        )
      );

      // Exits edit mode
      cancelEditing();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusyVideoId(null);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-4xl font-bold">
          My Videos
        </h1>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/upload"
            className="btn btn-primary"
          >
            Upload videos
          </Link>
          <Link to="/upload-series" className="btn btn-primary">
            Upload series
          </Link>
        </div>
      </div>

      {/* Horizontal line */}
      <hr className="mb-8" />

      {/* Video list */}
      <h2 className="text-2xl font-bold mb-4">Movies</h2>

      {actionError && (
        <div role="alert" className="alert alert-error mb-6">{actionError}</div>
      )}

      <div className="space-y-6">

        <RequestStatus
          loading={loading}
          error={loadError}
          isEmpty={videos.length === 0}
          emptyMessage="You have no uploaded videos."
        >
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex flex-col md:flex-row items-center gap-6 border-b pb-6"
            >

              {/* Video */}
              <video
                src={videoUrl(video.path)}
                controls
                className="w-full max-w-64 h-36 object-cover rounded"
              />

              {/* Details */}
              <div className="flex-1 w-full">

                {editingVideoId === video.id ? (
                  /* Edit mode */
                  <div className="flex flex-col gap-3">

                    <div>
                      <label className="font-bold block mb-1">
                        Title:
                      </label>

                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) =>
                          setEditedTitle(e.target.value)
                        }
                        className="input input-bordered w-full"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">
                        Category:
                      </label>

                      <input
                        type="text"
                        value={editedCategory}
                        onChange={(e) =>
                          setEditedCategory(e.target.value)
                        }
                        className="input input-bordered w-full"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">
                        Description:
                      </label>

                      <textarea
                        value={editedDescription}
                        onChange={(e) =>
                          setEditedDescription(e.target.value)
                        }
                        className="textarea textarea-bordered w-full"
                      />
                    </div>

                  </div>
                ) : (
                  /* Normal mode */
                  <>
                    <p className="text-lg">
                      <strong>Title:</strong>{" "}
                      {video.title}
                    </p>

                    <p className="text-lg">
                      <strong>Category:</strong>{" "}
                      {video.category}
                    </p>

                    <p className="text-lg">
                      <strong>Description:</strong>{" "}
                      {video.description}
                    </p>
                  </>
                )}

              </div>

              {/* Buttons */}
              <div className="flex flex-col items-center justify-center gap-3">

                {editingVideoId === video.id ? (
                  <>
                    {/* Save */}
                    <button
                      type="button"
                      className="btn btn-success w-32"
                      onClick={() => saveEdit(video.id)}
                      disabled={busyVideoId === video.id}
                    >
                      {busyVideoId === video.id && <span className="loading loading-spinner loading-sm" />}
                      Save
                    </button>

                    {/* Cancel */}
                    <button
                      type="button"
                      className="btn btn-outline w-32"
                      onClick={cancelEditing}
                      disabled={busyVideoId === video.id}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {/* Delete */}
                    <button
                      type="button"
                      className="btn btn-error w-32"
                      onClick={() => deleteVideo(video)}
                      disabled={busyVideoId === video.id}
                    >
                      {busyVideoId === video.id && <span className="loading loading-spinner loading-sm" />}
                      Delete
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      className="btn btn-outline w-32"
                      onClick={() => startEditing(video)}
                      disabled={busyVideoId === video.id}
                    >
                       Edit
                    </button>
                  </>
                )}

              </div>

            </div>
          ))}
        </RequestStatus>

      </div>

      {/* Series list */}
      <h2 className="text-2xl font-bold mt-10 mb-4">Series</h2>

      <div className="space-y-6">
        <RequestStatus
          loading={loadingSeries}
          error={seriesError}
          isEmpty={mySeries.length === 0}
          emptyMessage="You have no uploaded series."
        >
          {mySeries.map((item) => (
            <MySeriesItem
              key={item.id}
              series={item}
              onUpdated={(updated) => setMySeries((current) => current.map((s) => (s.id === updated.id ? updated : s)))}
              onDeleted={(id) => setMySeries((current) => current.filter((s) => s.id !== id))}
            />
          ))}
        </RequestStatus>
      </div>
    </div>
  );
}

export default MyVideosPage;
