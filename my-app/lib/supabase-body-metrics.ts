import { supabase } from './supabase';

// Fetch all body metrics for a user (or all if no user_id)
export async function getBodyMetrics(user_id?: string) {
  let query = supabase.from('body_metrics').select('*').order('date', { ascending: false });
  if (user_id) query = query.eq('user_id', user_id);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Add a new body metric
export async function addBodyMetric(metric: any) {
  const { data, error } = await supabase.from('body_metrics').insert([metric]).select();
  if (error) throw error;
  return data?.[0];
}

// Update a body metric by id
export async function updateBodyMetric(id: string, updates: any) {
  const { data, error } = await supabase.from('body_metrics').update(updates).eq('id', id).select();
  if (error) throw error;
  return data?.[0];
}

// Delete a body metric by id
export async function deleteBodyMetric(id: string) {
  const { error } = await supabase.from('body_metrics').delete().eq('id', id);
  if (error) throw error;
  return true;
} 