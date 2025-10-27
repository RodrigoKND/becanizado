import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useExercises = () => {
    return useQuery({
        queryKey: ["exercises"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("exercises")
                .select("id, title, professor_id, description, image_url, created_at, profiles(full_name)")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
    });
};

export const useLoadExercises = () => {
    return useQuery({
        queryKey: ["loadExercises"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('exercises')
                .select(`
          *,
          professor:profiles!professor_id(id, full_name, email, youtube_channel)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
    });
};