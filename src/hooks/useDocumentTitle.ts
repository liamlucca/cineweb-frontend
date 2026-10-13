import { useEffect } from 'react';

export const APP_NAME = 'CineWeb';

// Sets the browser tab title of the current page: "Search · CineWeb".
// Pages call it with their own title; with no title it shows the app name.
function useDocumentTitle(title?: string | null) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : `${APP_NAME} · Movies and series`;
  }, [title]);
}

export default useDocumentTitle;
