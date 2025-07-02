import { supabase } from './supabase';

// Fetch all workouts for a user (or all if no user_id)
export async function getWorkouts(user_id?: string) {
  let query = supabase.from('workouts').select('*').order('date', { ascending: false });
  if (user_id) query = query.eq('user_id', user_id);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Add a new workout
export async function addWorkout(workout: any) {
  const { data, error } = await supabase.from('workouts').insert([workout]).select();
  if (error) throw error;
  return data?.[0];
}

// Update a workout by id
export async function updateWorkout(id: string, updates: any) {
  const { data, error } = await supabase.from('workouts').update(updates).eq('id', id).select();
  if (error) throw error;
  return data?.[0];
}

// Delete a workout by id
export async function deleteWorkout(id: string) {
  const { error } = await supabase.from('workouts').delete().eq('id', id);
  if (error) throw error;
  return true;
} 