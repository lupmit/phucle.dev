interface SearchResult {
  url: string;
  meta: {
    title?: string;
  };
  excerpt?: string;
}

export function renderSearchResult(result: SearchResult): string {
  return (
    '<a href="' +
    result.url +
    '" class="group -mx-1 flex flex-col gap-1 rounded px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-950">' +
    '<span class="text-base text-gray-900 underline decoration-gray-300 decoration-1 underline-offset-2 transition-colors group-hover:decoration-gray-900 dark:text-gray-100 dark:decoration-gray-700 dark:group-hover:decoration-gray-100">' +
    (result.meta.title || 'Untitled') +
    '</span>' +
    (result.excerpt
      ? '<p class="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">' +
        result.excerpt +
        '</p>'
      : '') +
    '</a>'
  );
}
