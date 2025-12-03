import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useEffect } from "react";

export const useExercises = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select(`
          id,
          title,
          description,
          image_url,
          created_at,
          matter,
          professor_id,
          profiles(full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("exercises-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "exercises" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["exercises"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

export const useLoadExercises = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["loadExercises"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select(`
          *,
          professor:profiles!professor_id(id, full_name, email, youtube_channel)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("load-exercises-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "exercises" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["loadExercises"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};
