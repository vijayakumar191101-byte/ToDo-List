import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export const StatsChart = ({ stats }) => {
  const pieData = [
    { name: 'Completed', value: stats.completed },
    { name: 'Pending', value: stats.pending },
  ];

  const barData = [
    { name: 'Total', value: stats.total },
    { name: 'High Priority', value: stats.highPriority },
  ];

  const COLORS = ['#06b6d4', '#334155']; // Cyan-500, Slate-700

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Overview Card */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
          Completion Status
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                itemStyle={{ color: '#f1f5f9' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
            <span className="text-sm text-slate-300">Completed ({stats.completed})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-700"></div>
            <span className="text-sm text-slate-300">Pending ({stats.pending})</span>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <h3 className="text-xl font-bold text-slate-100 mb-6">Workload Analytics</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} />
              <Tooltip
                cursor={{fill: '#334155', opacity: 0.4}}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
              />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
          <p className="text-sm text-slate-400">
            You have <strong className="text-white">{stats.pending}</strong> pending tasks. 
            {stats.highPriority > 0 && <span> <strong className="text-rose-400">{stats.highPriority}</strong> marked as High Priority.</span>}
          </p>
        </div>
      </div>
    </div>
  );
};