import React, { useState } from 'react';
import { Download, FileText, CheckCircle, Info, Database } from 'lucide-react';
import { smartBuildingApi } from '../services/api';

const Reports = () => {
    const [loading, setLoading] = useState(false);
    const [building, setBuilding] = useState('Corporate Office-A');

    const generateReport = async () => {
        setLoading(true);
        try {
            const reportData = {
                building: building,
                severity_score: 18,
                risk_label: 'OPTIMAL',
                model_name: 'Ensemble Learning Engine',
                model_score: '96.4%',
                cluster_label: 'Standard Office Usage',
                access_violations: 1,
                stress_scenario: 'Normal Operation',
                sensor_inputs: {
                  'Occupancy': '24 pax',
                  'Energy': '320 kWh',
                  'Temperature': '24.5 °C',
                  'Humidity': '55%',
                  'CO2': '420 ppm'
                }
            };
            const res = await smartBuildingApi.generateReport(reportData);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Building_Report_${building}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-top duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Executive Diagnostic Reports</h1>
                    <p className="text-gray-400">Automated infrastructure audit and system performance oversight.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-dark-800 border border-dark-700 rounded-3xl p-10 shadow-xl flex flex-col justify-between min-h-[500px]">
                    <div className="space-y-12">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group hover:bg-primary transition-all duration-300">
                              <FileText size={32} className="group-hover:text-dark-900" />
                           </div>
                           <div>
                              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Configuration</div>
                              <h2 className="text-2xl font-black text-white">Platform Diagnostic Protocol</h2>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div>
                               <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-4 tracking-tighter">
                                  <Database size={14} /> Asset to Report
                               </label>
                               <select 
                                 className="w-full bg-dark-700 border-2 border-dark-600 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-all font-bold"
                                 value={building}
                                 onChange={(e) => setBuilding(e.target.value)}
                               >
                                 <option>Corporate Office-A</option>
                                 <option>Central Hospital-B</option>
                                 <option>University Campus-C</option>
                                 <option>Edge Data Center-D</option>
                               </select>
                            </div>
                            <div>
                               <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-4 tracking-tighter">
                                  <CheckCircle size={14} /> Report Resolution
                               </label>
                               <div className="flex gap-3">
                                  {['Standard', 'Enterprise', 'Technical'].map(r => (
                                      <button key={r} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${r === 'Standard' ? 'bg-primary border-primary text-dark-900' : 'bg-dark-700 border-dark-600 text-gray-400 hover:text-white'}`}>
                                          {r}
                                      </button>
                                  ))}
                               </div>
                            </div>
                        </div>

                        <div className="p-8 bg-dark-900/60 rounded-3xl border border-dark-700 border-dashed">
                            <h4 className="text-sm font-bold text-white mb-4">Included Datasets</h4>
                            <div className="flex flex-wrap gap-4">
                                {['Energy Forecasting', 'Asset Health (ML)', 'Security Access Logs', 'Clustering Patterns', 'Risk Scoring Matrix', 'Stress Test Analysis'].map(tag => (
                                    <div key={tag} className="px-4 py-2 bg-dark-700 rounded-full text-xs text-gray-400 font-medium">
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button 
                      onClick={generateReport}
                      disabled={loading}
                      className="bg-primary text-dark-900 px-8 py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-10 shadow-xl shadow-primary/20"
                    >
                        {loading ? 'Compiling AI Diagnostic Data...' : (
                            <>
                              <Download size={28} />
                              Generate Executive Report
                            </>
                        )}
                    </button>
                </div>

                <div className="space-y-8">
                   <div className="bg-dark-800 border border-dark-700 rounded-3xl p-8 shadow-xl">
                      <h2 className="font-bold text-lg mb-6 flex items-center gap-3">
                         <Info size={18} className="text-secondary" />
                         Platform Note
                      </h2>
                      <p className="text-sm text-gray-400 leading-relaxed italic">
                        "The report engine generates a finalized infrastructure diagnostic based on the last 24 hours of aggregated sensor data, ML predictions, and security incidents. All reports are cryptographically signed for regulatory compliance."
                      </p>
                   </div>
                   
                   <div className="bg-gradient-to-br from-dark-800 to-dark-700 border border-dark-700 rounded-3xl p-8 shadow-xl overflow-hidden relative">
                      <div className="relative z-10">
                         <h2 className="text-2xl font-black text-white mb-2 underline decoration-primary underline-offset-8">99.8%</h2>
                         <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Uptime Diagnostic</div>
                         <p className="text-xs text-gray-400 leading-relaxed font-bold">
                            All gateway nodes are responding within expected latency parameters. Report generation is operating at peak performance.
                         </p>
                      </div>
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full"></div>
                   </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
