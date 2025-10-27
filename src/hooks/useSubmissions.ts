import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useSubmissions = () => {
  return useQuery({
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
};

