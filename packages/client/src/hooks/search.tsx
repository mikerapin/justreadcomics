import { useEffect, useState } from 'react';
import { IFetchSeriesSearchOptions } from '../data/series';
import { IFetchMultipleSeriesWithCursor, IHydratedSeries } from '../types/series';

export const useSearch = (searchFunction: (options: IFetchSeriesSearchOptions) => Promise<IFetchMultipleSeriesWithCursor>, isLargeSearch?: boolean) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<IHydratedSeries[]>([]);
  const [cursor, setCursor] = useState<number | undefined>();
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchFunction({ seriesName: searchTerm, isLargeSearch, cursor }).then((res) => {
        setSearchResults(res.data);
      });
    }, 500);

    return () => {
      setSearchResults([]);
      clearTimeout(delayDebounceFn);
    };
  }, [searchTerm, cursor, isLargeSearch, searchFunction]);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    setCursor
  };
};
