import { supabase } from './supabase';

// Fetch all exercises
export async function getExercises() {
  const { data, error } = await supabase.from('exercises').select('*').order('name', { ascending: true });
  if (error) throw error;
  return data;
}

// Add a new exercise
export async function addExercise(exercise: any) {
  const { data, error } = await supabase.from('exercises').insert([exercise]).select();
  if (error) throw error;
  return data?.[0];
}

// Update an exercise by id
export async function updateExercise(id: string, updates: any) {
  const { data, error } = await supabase.from('exercises').update(updates).eq('id', id).select();
  if (error) throw error;
  return data?.[0];
}

// Delete an exercise by id
export async function deleteExercise(id: string) {
  const { error } = await supabase.from('exercises').delete().eq('id', id);
  if (error) throw error;
  return true;
} 