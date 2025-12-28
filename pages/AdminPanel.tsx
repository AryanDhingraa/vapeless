import React, { useEffect, useState } from 'react';
import { dbService } from '../services/dbService.ts';

export const AdminPanel: React.FC = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'users' | 'logs'>('users');
  const [error, setError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [allProfiles, allLogs] = await Promise.all([
        dbService.adminGetAllProfiles(),
        dbService.adminGetAllLogs()
      ]);
      setProfiles(allProfiles);
      setLogs(allLogs);
    } catch (err: any) {
      console.error(err);
      setError('ACCESS_DENIED: REQUIRES_DB_PERMISSIONS');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAdmin = async (profile: any) => {
    const newStatus = !profile.is_admin;
    const confirmMsg = newStatus 
      ? `GRANT ADMIN PRIVILEGES TO ${profile.email}?` 
      : `REVOKE ADMIN PRIVILEGES FROM ${profile.email}?`;
    
    if (!confirm(confirmMsg)) return;

    try {
      await dbService.adminToggleAdminStatus(profile.id, newStatus);
      setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, is_admin: newStatus } : p));
    } catch (err) {
      alert('UPDATE_FAILED: CHECK_RLS_POLICIES');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`MARK USER ${email} AS DELETED?`)) return;
    try {
      await dbService.adminDeleteUser(userId);
      // Remove from UI list
      setProfiles(prev => prev.filter(p => p.id !== userId));
      alert('USER_MARKED_DELETED');
    } catch (err) {
      alert('DELETE_FAILED');
    }
  };

  if (isLoading) return <div className="p-8 font-mono animate-pulse uppercase text-xs">Fetching_Global_Vault...</div>;
  if (error) return <div className="p-8 text-red-600 font-black uppercase text-xs border-4 border-red-600 m-4">{error}</div>;

  const totalPuffs = logs.reduce((acc, l) => acc + (l.count || 0), 0);

  return (
    <div className="p-4 space-y-6 pb-24 font-mono">
      {/* HEADER & STATS */}
      <div className="retro-border bg-black text-white p-4">
        <h3 className="font-black italic uppercase text-lg mb-4">Central_Command</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-white/20 p-2">
            <div className="text-[8px] opacity-50 uppercase">Active_Users</div>
            <div className="text-xl font-black">{profiles.length}</div>
          </div>
          <div className="border border-white/20 p-2">
            <div className="text-[8px] opacity-50 uppercase">System_Puffs</div>
            <div className="text-xl font-black">{totalPuffs}</div>
          </div>
        </div>
      </div>

      {/* VIEW TOGGLE */}
      <div className="flex gap-1">
        <button onClick={() => setView('users')} className={`flex-1 py-3 text-[10px] font-black uppercase border-2 border-black ${view === 'users' ? 'bg-black text-white' : 'bg-white'}`}>Users_Table</button>
        <button onClick={() => setView('logs')} className={`flex-1 py-3 text-[10px] font-black uppercase border-2 border-black ${view === 'logs' ? 'bg-black text-white' : 'bg-white'}`}>Activity_Logs</button>
      </div>

      {/* DATA TABLE */}
      <div className="retro-border bg-white overflow-hidden overflow-x-auto min-h-[400px]">
        <table className="w-full text-[9px] text-left border-collapse">
          <thead>
            <tr className="bg-black text-white uppercase font-black">
              <th className="p-2 border-r border-white/20">Identity</th>
              {view === 'users' ? (
                <>
                  <th className="p-2 border-r border-white/20">Role</th>
                  <th className="p-2">Action</th>
                </>
              ) : (
                <>
                  <th className="p-2 border-r border-white/20">Time</th>
                  <th className="p-2">Count</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {view === 'users' ? (
              profiles.map(p => (
                <tr key={p.id} className="border-b border-black/10 hover:bg-black/5">
                  <td className="p-2 truncate max-w-[120px]">
                    <div className="font-black text-[10px]">{p.email}</div>
                    <div className="text-[7px] opacity-40">{p.id}</div>
                  </td>
                  <td className="p-2">
                    <button 
                      onClick={() => handleToggleAdmin(p)}
                      className={`px-2 py-1 font-black text-[8px] border-2 border-black ${p.is_admin ? 'bg-black text-white shadow-[1px_1px_0px_#ccc]' : 'bg-white text-black'}`}
                    >
                      {p.is_admin ? 'ADMIN' : 'USER'}
                    </button>
                  </td>
                  <td className="p-2">
                    <button onClick={() => handleDeleteUser(p.id, p.email)} className="text-red-600 font-black hover:underline uppercase text-[10px]">
                      [KILL]
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              logs.map(l => (
                <tr key={l.id} className="border-b border-black/10 hover:bg-black/5">
                  <td className="p-2 truncate max-w-[120px]">
                    <div className="font-black">{(l.profiles?.email || 'UNKNOWN').split('@')[0]}</div>
                    <div className="text-[7px] opacity-40">{l.user_id}</div>
                  </td>
                  <td className="p-2 opacity-60">
                    {new Date(Number(l.timestamp)).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                  </td>
                  <td className="p-2 font-black text-[11px]">{l.count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER WARNING */}
      <div className="retro-border p-4 bg-white border-l-8 border-l-black space-y-1">
        <p className="text-[10px] font-black uppercase">Operation_Safety.doc</p>
        <p className="text-[8px] leading-tight font-bold opacity-70 uppercase italic">
          DELETION IS PERFORMED AS A 'SOFT DELETE'. THE USER RECORD IS MARKED AS DELETED IN THE DATABASE AND HIDDEN FROM PRODUCTION VIEWS. ADMINISTRATIVE PRIVILEGES ARE CONTROLLED VIA THE IS_ADMIN COLUMN.
        </p>
      </div>
    </div>
  );
};