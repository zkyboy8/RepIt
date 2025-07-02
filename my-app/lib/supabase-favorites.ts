import { supabase } from './supabase';

// Fetch all favorites for a user
export async function getFavorites(user_id: string) {
  const { data, error } = await supabase.from('favorites').select('*').eq('user_id', user_id);
  if (error) throw error;
  return data;
}

// Add a favorite (exercise or workout)
export async function addFavorite(favorite: { user_id: string, exercise_id?: string, workout_id?: string }) {
  const { data, error } = await supabase.from('favorites').insert([favorite]).select();
  if (error) throw error;
  return data?.[0];
}

// Remove a favorite by id
export async function removeFavorite(id: string) {
  const { error } = await supabase.from('favorites').delete().eq('id', id);
  if (error) throw error;
  return true;
} 