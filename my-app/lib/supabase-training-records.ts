import { supabase } from './supabase';

// Fetch all training records for a user (or all if no user_id)
export async function getTrainingRecords(user_id?: string) {
  let query = supabase.from('training_records').select('*').order('date', { ascending: false });
  if (user_id) query = query.eq('user_id', user_id);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Add a new training record
export async function addTrainingRecord(record: any) {
  const { data, error } = await supabase.from('training_records').insert([record]).select();
  if (error) throw error;
  return data?.[0];
}

// Update a training record by id
export async function updateTrainingRecord(id: string, updates: any) {
  const { data, error } = await supabase.from('training_records').update(updates).eq('id', id).select();
  if (error) throw error;
  return data?.[0];
}

// Delete a training record by id
export async function deleteTrainingRecord(id: string) {
  const { error } = await supabase.from('training_records').delete().eq('id', id);
  if (error) throw error;
  return true;
} 