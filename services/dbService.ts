
import { createClient, Provider } from "@supabase/supabase-js";
import { User, PuffLog, UserSettings } from "../types.ts";

// Note: In production, these should be supplied via process.env.
// For the sandbox, placeholder keys will be manually updated by the user.
const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dbService = {
  async login(email: string, password: string): Promise<User | null> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return null;
    return { id: data.user.id, email: data.user.email || "" };
  },

  async signup(email: string, password: string): Promise<User | null> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) throw error;
    return { id: data.user.id, email: data.user.email || "" };
  },

  // Added signInWithOAuth to handle social login providers like Google, Apple, etc.
  async signInWithOAuth(provider: Provider) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  },

  async checkEmailExists(email: string): Promise<boolean> {
    const { data } = await supabase.from('profiles').select('email').eq('email', email).maybeSingle();
    return !!data;
  },

  async getUserData(user: User): Promise<{ puffs: PuffLog[], settings: UserSettings | null, isAdmin: boolean }> {
    const [profileRes, logsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('logs').select('*').eq('user_id', user.id).order('timestamp', { ascending: true })
    ]);

    return {
      settings: profileRes.data?.settings || null,
      isAdmin: !!profileRes.data?.is_admin,
      puffs: logsRes.data?.map(log => ({
        id: log.id,
        timestamp: Number(log.timestamp),
        count: log.count,
        type: log.type || 'vape',
        location: log.location
      })) || []
    };
  },

  async syncData(user: User, puffs: PuffLog[], settings: UserSettings | null): Promise<void> {
    if (!settings) return;
    const { error } = await supabase.from('profiles').upsert({ 
      id: user.id, 
      email: user.email,
      settings: settings,
      onboarding_complete: settings.isOnboarded,
      substance_preference: settings.substance_preference,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
    if (error) console.error("Sync error:", error);
  },

  async saveLog(user: User, log: PuffLog): Promise<void> {
    const { error } = await supabase.from('logs').insert({
      user_id: user.id,
      timestamp: log.timestamp,
      count: log.count,
      type: log.type,
      location: log.location
    });
    if (error) console.error("Log error:", error);
  },

  async useToken(userId: string, currentSettings: UserSettings): Promise<boolean> {
    const newTokens = Math.max(0, currentSettings.tokens - 1);
    const { error } = await supabase.from('profiles').update({
      settings: { ...currentSettings, tokens: newTokens }
    }).eq('id', userId);
    return !error;
  },

  async resetPassword(email: string): Promise<void> {
    await supabase.auth.resetPasswordForEmail(email);
  },

  async getLeaderboard(): Promise<any[]> {
    const { data } = await supabase
      .from('profiles')
      .select('settings->username, settings->tokens')
      .eq('onboarding_complete', true)
      .limit(10);
    return data || [];
  },

  async adminGetAllProfiles(): Promise<any[]> {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return data || [];
  },

  async adminGetAllLogs(): Promise<any[]> {
    const { data, error } = await supabase.from('logs').select('*, profiles(email)').order('timestamp', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async adminToggleAdminStatus(userId: string, isAdmin: boolean): Promise<void> {
    const { error } = await supabase.from('profiles').update({ is_admin: isAdmin }).eq('id', userId);
    if (error) throw error;
  },

  async adminDeleteUser(userId: string): Promise<void> {
    const { error } = await supabase.from('profiles').update({ is_deleted: true }).eq('id', userId);
    if (error) throw error;
  }
};
