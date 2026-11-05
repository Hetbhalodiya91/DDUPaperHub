import { useEffect } from 'react';

const BASE_TITLE = 'DDUPaperHub';

// Sets the browser tab title for the current page, e.g. "Sem 4 Papers | DDUPaperHub".
// Pass nothing (or an empty value) to fall back to the site name.
export const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE_TITLE}` : `${BASE_TITLE} - Academic Resources & Papers`;
  }, [title]);
};