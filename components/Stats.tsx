
import React from 'react';
import { UserStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { LogOut, User, Calendar, Award } from 'lucide-react';

interface Props {
  stats: UserStats;
  user: { name: string } | null;
  onLogout: () => void;
}

const ProfilePage: React.FC<Props> = ({ stats, user, onLogout }) => {
  // Aggregate sessions by day (simplified for demo)
  const data = stats.sessions.slice(-7).map((s, i) => ({
    name: `S${i + 1}`,
    minutes: s.durationActual
  }));

  const joinedDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="h-full overflow-y-auto bg-slate-50 pb-20">
      {/* Profile Header */}
      <div className="bg-white p-6 pb-8 border-b border-slate-100 rounded-b-[2rem] shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl border-4 border-white shadow-lg">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{user?.name || 'Focus Traveler'}</h2>
            <div className="flex items-center text-slate-400 text-xs mt-1 font-medium bg-slate-100 px-2 py-1 rounded-full w-fit">
              <Calendar size={12} className="mr-1" />
              <span>Joined {joinedDate}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Award size={20} />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800">{stats.totalFocusTime}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Minutes</div>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-xl">
              <Award size={20} />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800">{stats.sessions.length}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Sessions</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Statistics Chart */}
        <section>
          <h3 className="text-sm font-bold text-slate-700 mb-3 ml-1">Weekly Activity</h3>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="minutes" fill="#4ade80" radius={[4, 4, 4, 4]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
            {data.length === 0 && (
              <div className="flex h-full items-center justify-center text-slate-400 text-sm -mt-48">
                No sessions yet.
              </div>
            )}
          </div>
        </section>

        {/* Account Actions */}
        <section>
          <h3 className="text-sm font-bold text-slate-700 mb-3 ml-1">Account</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-red-50 transition-colors text-slate-700 hover:text-red-600"
            >
              <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:text-red-500 group-hover:bg-white transition-colors">
                <LogOut size={18} />
              </div>
              <span className="font-medium">Log Out</span>
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-6">
            Focus Pulse v1.0.0
          </p>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
