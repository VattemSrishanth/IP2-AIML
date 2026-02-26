import React, { useState } from 'react';
import { Layers, Rocket, Trash2, Database } from 'lucide-react';
import { smartBuildingApi } from '../services/api';

const AIModels = () => {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [target, setTarget] = useState('');

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !target) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('target_col', target);

        try {
            const res = await smartBuildingApi.predictComparison(formData);
            setResults(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">AI Infrastructure Engine</h1>
                    <p className="text-gray-400">Multi-algorithm benchmarking and model optimization.</p>
                </div>
                <div className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="Target Column" 
                      className="bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 focus:border-primary outline-none"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                    />
                    <label className="bg-primary text-dark-900 px-4 py-2 rounded-lg font-bold cursor-pointer flex items-center gap-2 hover:opacity-90">
                        <Rocket size={20} />
                        Deploy AI Engine
                        <input type="file" className="hidden" onChange={handleUpload} />
                    </label>
                </div>
            </div>

            <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-dark-700 text-gray-400 text-sm uppercase tracking-wider font-bold">
                            <th className="px-6 py-4">Algorithm</th>
                            <th className="px-6 py-4">{results[0]?.accuracy ? 'Accuracy' : 'R² Score'}</th>
                            <th className="px-6 py-4">{results[0]?.precision ? 'Precision' : 'MAE'}</th>
                            <th className="px-6 py-4">{results[0]?.recall ? 'Recall' : 'Status'}</th>
                            <th className="px-6 py-4">F1 Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700">
                        {loading && (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-400 animate-pulse">
                                    Benchmarking infrastructure models...
                                </td>
                            </tr>
                        )}
                        {!loading && results.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-400">
                                    Ready for model deployment. Please upload a dataset to begin.
                                </td>
                            </tr>
                        )}
                        {results.map((res, idx) => (
                            <tr key={idx} className="hover:bg-dark-700/30 transition-all group">
                                <td className="px-6 py-4 font-bold text-primary group-hover:pl-8 transition-all">{res.model_name}</td>
                                <td className="px-6 py-4">{(res.accuracy || res.r2_score || 0).toFixed(4)}</td>
                                <td className="px-6 py-4">{(res.precision || res.mae || 0).toFixed(4)}</td>
                                <td className="px-6 py-4">{(res.recall || (res.r2_score > 0.8 ? 'OPTIMAL' : 'MODERATE'))}</td>
                                <td className="px-6 py-4 font-bold text-secondary">{(res.f1_score || 0).toFixed(4)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
                <div className="bg-dark-800 border border-dark-700 p-6 rounded-xl">
                    <h2 className="text-lg font-bold mb-4">Features to Monitor</h2>
                    <ul className="space-y-3">
                        {['Energy Usage', 'Occupancy Count', 'CO2 Levels', 'Humidity', 'Temperature'].map(f => (
                            <li key={f} className="flex items-center gap-3 text-sm text-gray-400 bg-dark-700/50 p-2 rounded">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="lg:col-span-2 bg-dark-800 border border-dark-700 p-6 rounded-xl">
                    <h2 className="text-lg font-bold mb-4">Deployment Log</h2>
                    <div className="space-y-3 font-mono text-xs">
                        <div className="text-gray-500">[{new Date().toISOString()}] AI Model Engine Initialize...</div>
                        <div className="text-gray-500">[{new Date().toISOString()}] Scikit-learn Pipeline created...</div>
                        <div className="text-primary">[{new Date().toISOString()}] Gateway ready for sensor data.</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIModels;
