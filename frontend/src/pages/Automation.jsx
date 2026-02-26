import React, { useState, useEffect } from 'react';
import { Settings, Power, Zap, Thermometer, UserCheck, AlertTriangle, ShieldCheck } from 'lucide-react';
import { smartBuildingApi } from '../services/api';

const Automation = () => {
  const [sensors, setSensors] = useState({ 
    occupancy: 22, energy: 450, lift_trips: 120, temp: 24, humidity: 55, co2: 420 
  });
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSensors(prev => ({
        ...prev,
        energy: Math.floor(Math.random() * 800) + 10,
        occupancy: Math.floor(Math.random() * 40),
      }));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkRules = async () => {
      try {
        const res = await smartBuildingApi.automationCheck(sensors);
        setActions(res.data.actions || []);
      } catch (err) { console.error(err); }
    };
    checkRules();
  }, [sensors]);

  const inputs = [
    { label: 'Occupancy', value: sensors.occupancy, icon: <UserCheck size={20} />, key: 'occupancy', min: 0, max: 100 },
    { label: 'Energy', value: sensors.energy, icon: <Zap size={20} />, key: 'energy', min: 0, max: 1500 },
    { label: 'Lift Trips', value: sensors.lift_trips, icon: <Power size={20} />, key: 'lift_trips', min: 0, max: 1000 },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Smart Automation Engine</h1>
          <p className="text-gray-400">Rule-based decision layer controlling building infrastructure devices.</p>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Decision Engine Status</div>
          <div className="flex items-center gap-2 text-primary font-bold">
            <Zap size={18} />
            Active & Running
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 h-fit space-y-8">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Settings className="text-secondary" size={20} />
            Rule Simulation
          </h2>
          {inputs.map(input => (
            <div key={input.key} className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  {input.icon}
                  {input.label}
                </div>
                <div className="font-bold text-white">{input.value}</div>
              </div>
              <input 
                type="range" 
                min={input.min} 
                max={input.max} 
                value={input.value}
                onChange={(e) => setSensors({...sensors, [input.key]: parseInt(e.target.value)})}
                className="w-full accent-primary bg-dark-700 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          ))}
          <div className="pt-6 border-t border-dark-700">
             <div className="text-xs font-bold text-gray-500 uppercase mb-4">Device Thresholds</div>
             <div className="p-3 bg-dark-700/50 rounded-lg text-xs leading-relaxed text-gray-400">
                Automatic load shedding active when energy exceeds 400 kWh or building occupancy is below 5 pax.
             </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-primary" size={24} />
            Triggered Logic Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {actions.length > 0 ? (
              actions.map((act, idx) => (
                <div key={idx} className={`p-6 rounded-xl border-l-4 transition-all duration-500 transform hover:scale-[1.02] 
                  ${act.includes('Alert') ? 'bg-danger/10 border-danger' : 'bg-primary/10 border-primary shadow-lg shadow-primary/5'}
                `}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${act.includes('Alert') ? 'bg-danger/20 text-danger' : 'bg-primary/20 text-primary'}`}>
                      {act.includes('Alert') ? <AlertTriangle size={24} /> : <Zap size={24} />}
                    </div>
                    <div>
                      <div className="font-bold text-lg text-white mb-1 uppercase tracking-tight">
                        {act.split(':')[0]}
                      </div>
                      <div className="text-gray-400 font-medium leading-relaxed">
                        {act.split(':')[1]}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
                <div className="md:col-span-2 h-96 bg-dark-800 border-2 border-dashed border-dark-700 rounded-3xl flex flex-col items-center justify-center text-center p-10">
                   <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 animate-pulse">
                      <Zap size={32} />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">Systems Stable</h3>
                   <p className="max-w-xs text-gray-400">Current sensor parameters are within the standard building efficiency spectrum. No corrective actions are required.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Automation;
