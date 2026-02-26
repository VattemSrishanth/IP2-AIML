import React, { useState } from 'react';
import { Activity, Rocket, UserPlus, Zap, Thermometer, ShieldAlert, Cpu } from 'lucide-react';
import { smartBuildingApi } from '../services/api';

const StressTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [scenario, setScenario] = useState('Normal Operations');

  const runTest = async (scene) => {
    setLoading(true);
    setScenario(scene);
    try {
      const res = await smartBuildingApi.runStressTest({
        scenario: scene,
        building: "Main Complex"
      });
      setResult(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const scenarios = [
    { name: 'Normal Operations', icon: <Cpu />, color: 'bg-primary shadow-primary/20 hover:shadow-primary/40' },
    { name: 'HVAC Failure (Extreme Heat)', icon: <Thermometer />, color: 'bg-orange-500 shadow-orange-500/20 hover:shadow-orange-500/40' },
    { name: 'Unauthorized Access Spike', icon: <ShieldAlert />, color: 'bg-red-500 shadow-red-500/20 hover:shadow-red-500/40' },
    { name: 'Energy Demand Surge', icon: <Zap />, color: 'bg-yellow-500 shadow-yellow-500/20 hover:shadow-yellow-500/40' },
    { name: 'Occupancy Spike', icon: <UserPlus />, color: 'bg-blue-500 shadow-blue-500/20 hover:shadow-blue-500/40' },
  ];

  return (
    <div className="space-y-8 animate-in zoom-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Resiliency Stress Engine</h1>
          <p className="text-gray-400">Force system failure scenarios to evaluate building response protocols.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {scenarios.map((sc, idx) => (
          <button 
            key={idx}
            onClick={() => runTest(sc.name)}
            disabled={loading}
            className={`
              p-6 rounded-2xl flex flex-col items-center gap-4 text-center transition-all duration-300
              disabled:opacity-50 text-dark-900 font-bold group shadow-xl
              ${sc.color}
            `}
          >
            <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
              {sc.icon}
            </div>
            <div className="text-sm tracking-tight">{sc.name}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-dark-800 border-2 border-dark-700 rounded-3xl p-10 min-h-[400px] flex flex-col relative overflow-hidden shadow-2xl">
                {result ? (
                    <div className="relative z-10 space-y-8 animate-in slide-in-from-bottom duration-500">
                        <div className="flex justify-between items-start">
                           <div>
                              <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Scenario Analysis</div>
                              <h2 className="text-4xl font-black text-white">{scenario}</h2>
                           </div>
                           <div className={`
                             px-6 py-3 rounded-2xl font-black text-2xl border-4
                             ${result.risk_label === 'CRITICAL' ? 'bg-danger border-danger text-white' : 
                               result.risk_label === 'HIGH RISK' ? 'bg-orange-500 border-orange-500 text-white' : 
                               'bg-primary border-primary text-dark-900'}
                           `}>
                             {result.severity_update}% {result.risk_label}
                           </div>
                        </div>

                        <div className="p-8 bg-dark-700/50 rounded-2xl border border-dark-600">
                            <h3 className="font-bold text-lg mb-4 text-primary">System Reaction Strategy</h3>
                            <p className="text-xl text-gray-300 leading-relaxed font-medium">{result.system_reaction}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                               <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Triggered Protocols</h4>
                               <div className="space-y-3">
                                  {result.automation_triggers.map((t, idx) => (
                                      <div key={idx} className="flex items-center gap-3 text-sm text-gray-400 bg-dark-700 p-3 rounded-xl border border-dark-600">
                                          <div className="w-2 h-2 rounded-full bg-primary shadow-sm shadow-primary"></div>
                                          {t}
                                      </div>
                                  ))}
                               </div>
                            </div>
                            <div>
                               <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Post-Failure Analysis</h4>
                               <p className="text-sm text-gray-500 italic bg-dark-900/40 p-4 rounded-xl border border-dark-700 border-dashed">
                                  "{result.failure_analysis}"
                               </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="m-auto text-center space-y-6 max-w-sm">
                       <div className="w-24 h-24 bg-dark-700 rounded-full flex items-center justify-center m-auto animate-pulse">
                          <Activity className="text-gray-500" size={48} />
                       </div>
                       <h3 className="text-2xl font-bold text-white">Engine Standby</h3>
                       <p className="text-gray-500 italic">Select a stress scenario above to evaluate infrastructure resiliency metrics.</p>
                    </div>
                )}
            </div>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-3xl p-8 shadow-xl">
             <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                <Rocket className="text-secondary" size={24} />
                Scenario Metadata
             </h2>
             <div className="space-y-6">
                {[
                  { label: "Hardware Resilience", val: "94.2%", status: "OPTIMAL" },
                  { label: "Network Latency", val: "12ms", status: "STABLE" },
                  { label: "Sensor Availability", val: "99.9%", status: "HIGH" },
                  { label: "Predictive Confidence", val: "88.5%", status: "HIGH" },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center group">
                     <div>
                        <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.status}</div>
                     </div>
                     <div className="text-xl font-black text-secondary">{item.val}</div>
                  </div>
                ))}
             </div>
             
             <div className="mt-12 p-6 bg-secondary/10 border border-secondary/20 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-secondary/20 rounded-full text-secondary">
                   <Activity size={24} />
                </div>
                <div className="text-xs font-bold leading-snug">
                   FMEA models are active. Failure Mode and Effects Analysis is being recalculated in real-time.
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default StressTest;
