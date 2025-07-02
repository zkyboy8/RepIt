import { supabase } from './supabase';

// Training Programs
export async function getTrainingPrograms(user_id?: string) {
  let query = supabase.from('training_programs').select('*').order('name', { ascending: true });
  if (user_id) query = query.eq('user_id', user_id);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
export async function addTrainingProgram(program: any) {
  const { data, error } = await supabase.from('training_programs').insert([program]).select();
  if (error) throw error;
  return data?.[0];
}
export async function updateTrainingProgram(id: string, updates: any) {
  const { data, error } = await supabase.from('training_programs').update(updates).eq('id', id).select();
  if (error) throw error;
  return data?.[0];
}
export async function deleteTrainingProgram(id: string) {
  const { error } = await supabase.from('training_programs').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// Program Weeks
export async function getProgramWeeks(program_id: string) {
  const { data, error } = await supabase.from('program_weeks').select('*').eq('program_id', program_id).order('week_number');
  if (error) throw error;
  return data;
}
export async function addProgramWeek(week: any) {
  const { data, error } = await supabase.from('program_weeks').insert([week]).select();
  if (error) throw error;
  return data?.[0];
}
export async function updateProgramWeek(id: string, updates: any) {
  const { data, error } = await supabase.from('program_weeks').update(updates).eq('id', id).select();
  if (error) throw error;
  return data?.[0];
}
export async function deleteProgramWeek(id: string) {
  const { error } = await supabase.from('program_weeks').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// Program Sessions
export async function getProgramSessions(week_id: string) {
  const { data, error } = await supabase.from('program_sessions').select('*').eq('week_id', week_id).order('name');
  if (error) throw error;
  return data;
}
export async function addProgramSession(session: any) {
  const { data, error } = await supabase.from('program_sessions').insert([session]).select();
  if (error) throw error;
  return data?.[0];
}
export async function updateProgramSession(id: string, updates: any) {
  const { data, error } = await supabase.from('program_sessions').update(updates).eq('id', id).select();
  if (error) throw error;
  return data?.[0];
}
export async function deleteProgramSession(id: string) {
  const { error } = await supabase.from('program_sessions').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// Session Exercises
export async function getSessionExercises(session_id: string) {
  const { data, error } = await supabase.from('session_exercises').select('*').eq('session_id', session_id);
  if (error) throw error;
  return data;
}
export async function addSessionExercise(ex: any) {
  const { data, error } = await supabase.from('session_exercises').insert([ex]).select();
  if (error) throw error;
  return data?.[0];
}
export async function updateSessionExercise(id: string, updates: any) {
  const { data, error } = await supabase.from('session_exercises').update(updates).eq('id', id).select();
  if (error) throw error;
  return data?.[0];
}
export async function deleteSessionExercise(id: string) {
  const { error } = await supabase.from('session_exercises').delete().eq('id', id);
  if (error) throw error;
  return true;
} 