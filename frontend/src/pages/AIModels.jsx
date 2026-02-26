import React, { useState } from 'react';
import { Layers, Rocket, Database, Terminal } from 'lucide-react';
import { smartBuildingApi } from '../services/api';

const AIModels = () => {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [target, setTarget] = useState('');
    const [error, setError] = useState('');
    const [logs, setLogs] = useState([
        { time: new Date().toISOString(), msg: 'AI Model Engine Initialize...', type: 'gray' },
        { time: new Date().toISOString(), msg: 'Scikit-learn Pipeline created...', type: 'gray' },
        { time: new Date().toISOString(), msg: 'Gateway ready for sensor data.', type: 'primary' }
    ]);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!target) {
            setError('Please specify a Target Column first.');
            return;
        }

        setError('');
        setResults([]); // Clear previous results
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('target_col', target);

        try {
            const res = await smartBuildingApi.predictComparison(formData);
            if (res.data && res.data.length > 0) {
                setResults(res.data);
                setLogs(prev => [
                    ...prev,
                    { time: new Date().toISOString(), msg: `Dataset uploaded: ${file.name}`, type: 'gray' },
                    { time: new Date().toISOString(), msg: `Benchmarking complete for target: ${target}`, type: 'primary' }
                ]);
            } else {
                setError('Backend returned no results. Check your dataset format.');
            }
        } catch (err) { 
            console.error('Upload Error:', err);
            const errorMsg = err.response?.data?.detail || 'Failed to process dataset. Ensure target column exists.';
            setError(errorMsg);
        }
        setLoading(false);
        // Reset file input so same file can be uploaded again
        e.target.value = '';
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold mb-2">AI Infrastructure Engine</h1>
                    <p className="text-gray-400">Multi-algorithm benchmarking and model optimization.</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {error && <span className="text-xs font-bold text-red-500 animate-bounce">{error}</span>}
                    <div className="flex gap-4">
                        <input 
                        type="text" 
                        placeholder="Target Column (e.g. Energy)" 
                        className={`bg-dark-800 border ${error ? 'border-red-500' : 'border-dark-700'} rounded-lg px-4 py-2 focus:border-primary outline-none transition-all`}
                        value={target}
                        onChange={(e) => {
                            setTarget(e.target.value);
                            if(e.target.value) setError('');
                        }}
                        />
                        <label className="bg-primary text-dark-900 px-6 py-2 rounded-lg font-bold cursor-pointer flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20">
                            <Rocket size={20} />
                            {loading ? 'Processing...' : 'Deploy AI Engine'}
                            <input type="file" className="hidden" onChange={handleUpload} disabled={loading} />
                        </label>
                    </div>
                </div>
            </div>

            <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-dark-700/50 text-gray-400 text-sm uppercase tracking-wider font-bold">
                            <th className="px-6 py-5">Algorithm</th>
                            <th className="px-6 py-5">{results[0]?.accuracy !== undefined ? 'Accuracy' : 'R² Score'}</th>
                            <th className="px-6 py-5">{results[0]?.precision !== undefined ? 'Precision' : 'MAE'}</th>
                            <th className="px-6 py-5">{results[0]?.recall !== undefined ? 'Recall' : 'Status'}</th>
                            <th className="px-6 py-5">F1 Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700/50">
                        {loading && (
                            <tr>
                                <td colSpan="5" className="px-6 py-20 text-center text-gray-400">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        <div className="font-bold tracking-widest text-xs uppercase animate-pulse">Running Neural Infrastructure Audit...</div>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!loading && results.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-20 text-center text-gray-400">
                                    <Database size={48} className="mx-auto mb-4 opacity-10" />
                                    <p className="text-lg font-bold opacity-50">Ready for model deployment.</p>
                                    <p className="text-sm opacity-30 mt-1">Please enter a target column and upload a dataset to begin benchmarking.</p>
                                </td>
                            </tr>
                        )}
                        {results.map((res, idx) => (
                            <tr key={idx} className="hover:bg-primary/5 transition-all group">
                                <td className="px-6 py-4 font-bold text-white group-hover:text-primary transition-colors">{res.model_name}</td>
                                <td className="px-6 py-4 font-mono">{(res.accuracy ?? res.r2_score ?? 0).toFixed(4)}</td>
                                <td className="px-6 py-4 font-mono">{(res.precision ?? res.mae ?? 0).toFixed(4)}</td>
                                <td className="px-6 py-4">
                                    {res.recall !== undefined ? res.recall.toFixed(4) : (
                                        <span className={`px-3 py-1 rounded text-[10px] font-bold ${res.r2_score > 0.8 ? 'bg-primary/20 text-primary' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                            {res.r2_score > 0.8 ? 'OPTIMAL' : 'STABLE'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-bold text-secondary">{(res.f1_score ?? 0).toFixed(4)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
                <div className="bg-dark-800 border border-dark-700 p-6 rounded-xl shadow-xl">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Layers size={18} className="text-primary" />
                        Features to Monitor
                    </h2>
                    <ul className="space-y-4">
                        {['Energy Usage', 'Occupancy Count', 'CO2 Levels', 'Humidity', 'Temperature'].map(f => (
                            <li key={f} className="flex items-center gap-3 text-sm text-gray-400 bg-dark-900/50 p-3 rounded-lg border border-dark-700/50 group hover:border-primary/30 transition-all cursor-default">
                                <span className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-all shadow-[0_0_8px_rgba(155,255,0,0.4)]"></span>
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="lg:col-span-2 bg-dark-800 border border-dark-700 p-6 rounded-xl shadow-xl">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Terminal size={18} className="text-secondary" />
                        Infrastructure Deployment Log
                    </h2>
                    <div className="space-y-3 font-mono text-[10px] bg-dark-900 p-4 rounded-lg border border-dark-700 overflow-y-auto max-h-[300px]">
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-4 items-start border-l border-dark-700 pl-4 py-1">
                                <span className="text-gray-600 shrink-0">[{log.time.split('T')[1].split('Z')[0]}]</span>
                                <span className={log.type === 'primary' ? 'text-primary font-bold' : 'text-gray-400'}>{log.msg}</span>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-4 items-start border-l border-dark-700 pl-4 py-1 italic text-primary/50">
                                <span className="text-gray-600">[{new Date().toISOString().split('T')[1].split('Z')[0]}]</span>
                                <span>Running benchmark models...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIModels;
