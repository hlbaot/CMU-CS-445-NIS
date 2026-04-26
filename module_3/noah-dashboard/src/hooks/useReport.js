import { useState, useEffect, useCallback } from 'react';
import { fetchReport } from '../api/report';

export function useReport(page, pageSize = 10) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchReport({ page, pageSize });
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refresh: load };
}
