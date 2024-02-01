import { useEffect, useState } from 'react';
import { IFetchSeriesSearchOptions } from '../data/series';
import { IFetchMultipleSeriesWithCursor, IHydratedSeries } from '../types/series';

export const useSearch = (
  searchFunction: (options: IFetchSeriesSearchOptions) => Promise<IFetchMultipleSeriesWithCursor>,
  isLargeSearch?: boolean
) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<IHydratedSeries[]>([]);
  const [cursor, setCursor] = useState<number | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchFunction({ seriesName: searchTerm, isLargeSearch, cursor }).then((res) => {
          setSearchResults(res.data);
          setLoading(false);
        });
      }
    }, 500);

    return () => {
      setLoading(true);
      setSearchResults([]);
      clearTimeout(delayDebounceFn);
      setTimeout(() => {
        setLoading(false);
      }, 15000);
    };
  }, [searchTerm, cursor, isLargeSearch, searchFunction]);

  return {
    loading,
    searchTerm,
    setSearchTerm,
    searchResults,
    setCursor
  };
};
