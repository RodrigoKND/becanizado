import React, { useEffect, useState } from "react";

export function useFetch(input: RequestInfo, init?: RequestInit) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState< null | React.ReactNode>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(input, init);
        const json = await response.json();
        setData(json);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [input, init]);

  return { data, loading, error };
}
