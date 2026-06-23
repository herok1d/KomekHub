import { Notification } from '../types';
import { supabase, supabaseConfigError } from './supabaseClient';

type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  related_application_id: string | null;
  related_opportunity_id: string | null;
  created_at: string;
};

function requireSupabase() {
  if (!supabase) throw new Error(supabaseConfigError);
  return supabase;
}

function mapNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    read: Boolean(row.read),
    relatedApplicationId: row.related_application_id || undefined,
    relatedOpportunityId: row.related_opportunity_id || undefined,
    createdAt: row.created_at,
  };
}

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  const client = requireSupabase();
  const { data, error } = await client.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to load notifications: ${error.message}`);
  return (data ?? []).map((row) => mapNotification(row as NotificationRow));
}

export async function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedApplicationId?: string;
  relatedOpportunityId?: string;
}) {
  const client = requireSupabase();
  const { error } = await client.from('notifications').insert({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    related_application_id: input.relatedApplicationId ?? null,
    related_opportunity_id: input.relatedOpportunityId ?? null,
  });
  if (error && import.meta.env.DEV) console.error('[KomekHub notifications] Insert failed', { input, error });
}

export async function markNotificationRead(notificationId: string) {
  const client = requireSupabase();
  const { error } = await client.from('notifications').update({ read: true }).eq('id', notificationId);
  if (error) throw new Error(`Failed to update notification: ${error.message}`);
}

export async function markAllNotificationsRead(userId: string) {
  const client = requireSupabase();
  const { error } = await client.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
  if (error) throw new Error(`Failed to update notifications: ${error.message}`);
}
