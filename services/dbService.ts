
import { createClient, Provider } from "@supabase/supabase-js";
import { User, PuffLog, UserSettings } from "../types.ts";

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dbService = {
  // --- AUTHENTICATION ---
  async login(email: string, password: string): Promise<User | null> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return null;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', data.user.id)
      .single();

    return { 
      id: data.user.id, 
      email: data.user.email || "",
      isAdmin: profile?.is_admin || false
    };
  },

  async signup(email: string, password: string): Promise<User | null> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) {
      if (error?.message?.includes("already registered")) throw new Error("USER_EXISTS");
      throw error;
    }
    return { id: data.user.id, email: data.user.email || "" };
  },

  async signInWithOAuth(provider: Provider) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}?type=recovery`,
    });
    if (error) throw error;
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  async checkEmailExists(email: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    
    if (error) return false;
    return !!data;
  },

  // --- DATA FETCHING ---
  async getUserData(user: User): Promise<{ puffs: PuffLog[], settings: UserSettings | null, isAdmin: boolean }> {
    const [profileRes, logsRes] = await Promise.all([
      supabase.from('profiles').select('settings, is_admin').eq('id', user.id).single(),
      supabase.from('logs').select('*').eq('user_id', user.id).order('timestamp', { ascending: true })
    ]);

    return {
      settings: profileRes.data?.settings || null,
      isAdmin: !!profileRes.data?.is_admin,
      puffs: logsRes.data?.map(log => ({
        id: log.id,
        timestamp: Number(log.timestamp),
        count: log.count
      })) || []
    };
  },

  // --- ADMIN METHODS ---
  async adminGetAllProfiles(): Promise<any[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or('deleted.is.null,deleted.eq.false')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async adminGetAllLogs(): Promise<any[]> {
    const { data, error } = await supabase
      .from('logs')
      .select('*, profiles(email)')
      .order('timestamp', { ascending: false })
      .limit(1000);
    
    if (error) throw error;
    return data || [];
  },

  async adminToggleAdminStatus(userId: string, isAdmin: boolean): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: isAdmin })
      .eq('id', userId);
    
    if (error) throw error;
  },

  async adminDeleteUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ deleted: true })
      .eq('id', userId);
    
    if (error) throw error;
  },

  // --- DATA SYNC ---
  async syncData(user: User, puffs: PuffLog[], settings: UserSettings | null): Promise<void> {
    if (!settings) return;
    await supabase.from('profiles').upsert({ 
      id: user.id, 
      email: user.email,
      settings: settings,
      updated_at: new Date().toISOString()
    });
  },

  async savePuff(user: User, puff: PuffLog): Promise<void> {
    await supabase.from('logs').insert({
      user_id: user.id,
      timestamp: puff.timestamp,
      count: puff.count
    });
  }
};
