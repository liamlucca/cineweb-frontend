import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

type Video = {
  id: number;
  id_author: number;
  title: string;
  category: string;
  description: string;
  path: string;
  state: boolean;
  views: number;
};

function MyVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);

  // Stores which video is currently being edited
  const [editingVideoId, setEditingVideoId] = useState<number | null>(null);

  // Data being edited
  const [editedTitle, setEditedTitle] = useState("");
  const [editedCategory, setEditedCategory] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  useEffect(() => {
    // Fetches the videos from the backend
    fetch(`${API_URL}/api/movie`)
      .then((response) => response.json())
      .then((data) => {
        setVideos(data);
      })
      .catch((error) => {
        console.error("Error fetching videos:", error);
      });
  }, []);

  // Deletes a video from the backend
  const deleteVideo = async (id: number) => {
    try {
      const response = await fetch(
        `${API_URL}/api/movie/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Could not delete the video");
      }

      // Removes the video from the list shown on screen
      setVideos((currentVideos) =>
        currentVideos.filter((video) => video.id !== id)
      );
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  // Starts editing a video
  const startEditing = (video: Video) => {
    setEditingVideoId(video.id);
    setEditedTitle(video.title);
    setEditedCategory(video.category);
    setEditedDescription(video.description);
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
    try {
      const response = await fetch(
        `${API_URL}/api/movie/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editedTitle,
            category: editedCategory,
            description: editedDescription,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Could not update the video");
      }

      // Updates the video shown on screen
      setVideos((currentVideos) =>
        currentVideos.map((video) =>
          video.id === id
            ? {
                ...video,
                title: editedTitle,
                category: editedCategory,
                description: editedDescription,
              }
            : video
        )
      );

      // Exits edit mode
      cancelEditing();
    } catch (error) {
      console.error("Error editing video:", error);
    }
  };

  return (
    <div className="min-h-screen p-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-4xl font-bold">
          My Videos
        </h1>

        <Link
          to="/upload"
          className="btn btn-primary"
        >
          Upload videos
        </Link>
      </div>

      {/* Horizontal line */}
      <hr className="mb-8" />

      {/* Video list */}
      <div className="space-y-6">

        {videos.length === 0 ? (
          <p className="text-lg">
            You have no uploaded videos.
          </p>
        ) : (
          videos.map((video) => (
            <div
              key={video.id}
              className="flex flex-col md:flex-row items-center gap-6 border-b pb-6"
            >

              {/* Video */}
              <video
                src={`${API_URL}${video.path}`}
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
                        File name:
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
                      <strong>File name:</strong>{" "}
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
                      className="btn btn-success w-32"
                      onClick={() => saveEdit(video.id)}
                    >
                      Save
                    </button>

                    {/* Cancel */}
                    <button
                      className="btn btn-outline w-32"
                      onClick={cancelEditing}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {/* Delete */}
                    <button
                      className="btn btn-error w-32"
                      onClick={() => deleteVideo(video.id)}
                    >
                      Delete
                    </button>

                    {/* Edit */}
                    <button
                      className="btn btn-outline w-32"
                      onClick={() => startEditing(video)}
                    >
                       Edit
                    </button>
                  </>
                )}

              </div>

            </div>
          ))
        )}

      </div>
    </div>
  );
}

export default MyVideosPage;
