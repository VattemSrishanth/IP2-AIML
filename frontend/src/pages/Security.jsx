import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Eye, UserPlus, FileSearch } from 'lucide-react';
import { smartBuildingApi } from '../services/api';

const Security = () => {
    const [analytics, setAnalytics] = useState({ busiest_hour: 'N/A', high_risk_users: [], total_denials: 0 });
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            const [anaRes, logsRes] = await Promise.all([
                smartBuildingApi.getSecurityAnalytics(),
                smartBuildingApi.getRecentLogs()
            ]);
            setAnalytics(anaRes.data);
            setLogs(logsRes.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const simulateAccess = async () => {
        setLoading(true);
        try {
            await smartBuildingApi.simulateAccess();
            await fetchData();
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Enterprise Security Control</h1>
                    <p className="text-gray-400">Manage building access, identify breaches, and monitor high-risk zones.</p>
                </div>
                <button 
                  onClick={simulateAccess}
                  disabled={loading}
                  className="bg-danger text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 shadow-lg shadow-danger/20"
                >
                    <UserPlus size={20} />
                    Simulate Access Attempt
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-dark-800 border border-dark-700 p-6 rounded-xl flex items-center gap-6">
                    <div className="p-4 rounded-xl bg-primary/10 text-primary">
                        <Eye size={32} />
                    </div>
                    <div>
                        <div className="text-sm text-gray-400 font-medium">Busiest Hour</div>
                        <div className="text-2xl font-bold text-white">{analytics.busiest_hour}</div>
                    </div>
                </div>

                <div className="bg-dark-800 border border-dark-700 p-6 rounded-xl flex items-center gap-6">
                    <div className="p-4 rounded-xl bg-danger/10 text-danger">
                        <ShieldAlert size={32} />
                    </div>
                    <div>
                        <div className="text-sm text-gray-400 font-medium">Total Denials</div>
                        <div className="text-2xl font-bold text-white">{analytics.total_denials}</div>
                    </div>
                </div>

                <div className="bg-dark-800 border border-dark-700 p-6 rounded-xl flex items-center gap-6">
                    <div className="p-4 rounded-xl bg-orange-500/10 text-orange-400">
                        <FileSearch size={32} />
                    </div>
                    <div>
                        <div className="text-sm text-gray-400 font-medium">High Risk Users</div>
                        <div className="text-2xl font-bold text-white">{analytics.high_risk_users.length}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-dark-800 border border-dark-700 rounded-xl overflow-hidden shadow-xl">
                    <div className="px-6 py-4 border-b border-dark-700 bg-dark-700/50 flex items-center gap-3">
                        <Shield className="text-primary" size={18} />
                        <h2 className="font-bold uppercase tracking-widest text-xs">Live Access Logs</h2>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-dark-700/30 text-gray-400 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">User Identity</th>
                                <th className="px-6 py-4">Target Node</th>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Outcome</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-700">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-dark-700/20">
                                    <td className="px-6 py-4 font-bold text-white">{log.user}</td>
                                    <td className="px-6 py-4 text-gray-400">{log.door}</td>
                                    <td className="px-6 py-4 text-xs font-mono text-gray-500">{log.timestamp}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest ${log.status === 'GRANTED' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-danger/20 text-danger border border-danger/30'}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 shadow-xl">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <ShieldAlert className="text-danger" size={20} />
                        Threat Matrix
                    </h2>
                    {analytics.high_risk_users.length > 0 ? (
                        <div className="space-y-4">
                            {analytics.high_risk_users.map((user, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-danger/10 border border-danger/20 flex justify-between items-center group cursor-help transition-all hover:bg-danger/20">
                                    <div>
                                        <div className="font-bold text-white">{user.name}</div>
                                        <div className="text-xs text-danger/70 tracking-tight font-medium">Excessive Denials Warning</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-danger">{user.denied_attempts}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-tighter text-danger/50">Hits</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
                            <div className="p-4 bg-primary/10 rounded-full text-primary">
                                <Shield size={32} />
                            </div>
                            <div>
                                <div className="font-bold text-white">No active threats</div>
                                <p className="text-xs text-gray-400 mt-1">All user behavioral patterns within normal parameters.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Security;
