import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useEffect } from "react";

export const useSubmissions = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          student:profiles!student_id(id, full_name, email),
          exercise:exercises!exercise_id(id, title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase.channel("submissions-realtime")
    .on("postgres_changes",
      { event: "*", schema: "public", table: "submissions" },
      () => { queryClient.invalidateQueries({ queryKey: ["submissions"] }) }
    )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

