import React, { useState, useEffect } from 'react';
import { 
  Users, Zap, Thermometer, ShieldAlert,
  ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import { smartBuildingApi } from '../services/api';

const Overview = () => {
  const [sensors, setSensors] = useState({
    occupancy: 24, energy: 320, temp: 24.5, unauthorized: 0
  });
  const [severity, setSeverity] = useState({ 
    severity_score: 12, risk_label: 'OPTIMAL', status_color: 'green' 
  });

  // Simulation loop for live feedback
  useEffect(() => {
    const timer = setInterval(() => {
      setSensors(prev => ({
        ...prev,
        temp: +(prev.temp + (Math.random() - 0.5) * 0.2).toFixed(1),
        energy: +(prev.energy + (Math.random() - 0.5) * 5).toFixed(0),
      }));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchSeverity = async () => {
      try {
        const res = await smartBuildingApi.calculateSeverity({
          sensor_data: sensors,
          access_denials: sensors.unauthorized
        });
        setSeverity(res.data);
      } catch (err) { console.error(err); }
    };
    fetchSeverity();
  }, [sensors]);

  const kpis = [
    { label: 'Occupancy', value: `${sensors.occupancy} pax`, icon: <Users size={24} />, color: 'bg-blue-500/10 text-blue-400' },
    { label: 'Energy Load', value: `${sensors.energy} kWh`, icon: <Zap size={24} />, color: 'bg-yellow-500/10 text-yellow-400' },
    { label: 'Temperature', value: `${sensors.temp} °C`, icon: <Thermometer size={24} />, color: 'bg-primary/10 text-primary' },
    { label: 'Security Alarms', value: sensors.unauthorized, icon: <ShieldAlert size={24} />, color: 'bg-danger/10 text-danger' },
  ];

  const getBadgeColor = (label) => {
    switch(label) {
      case 'OPTIMAL': return 'bg-green-500/20 border-green-500 text-green-400';
      case 'MODERATE': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      case 'HIGH RISK': return 'bg-orange-500/20 border-orange-500 text-orange-400';
      case 'CRITICAL': return 'bg-red-500/20 border-red-500 text-red-400';
      default: return 'bg-gray-500/20 border-gray-500 text-gray-400';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Smart Command Overview</h1>
          <p className="text-gray-400">Real-time health monitoring for Infrastructure Asset A.</p>
        </div>
        <div className={`
          px-4 py-2 rounded-lg border-2 font-bold text-lg flex items-center gap-2
          ${getBadgeColor(severity.risk_label)}
        `}>
          <Activity size={20} />
          {severity.risk_label}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-dark-800 border border-dark-700 p-6 rounded-xl hover:border-primary/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${kpi.color}`}>
                {kpi.icon}
              </div>
              <span className="text-primary flex items-center gap-1 text-sm font-medium">
                <ArrowUpRight size={14} /> 2.4%
              </span>
            </div>
            <h3 className="text-gray-400 font-medium mb-1">{kpi.label}</h3>
            <div className="text-2xl font-bold">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-dark-800 border border-dark-700 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6">Severity Scoring Index</h2>
          <div className="space-y-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Total System Severity</span>
              <span className="font-bold text-primary">{severity.severity_score}%</span>
            </div>
            <div className="h-4 bg-dark-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000"
                style={{ width: `${severity.severity_score}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {['OPTIMAL', 'MODERATE', 'HIGH RISK', 'CRITICAL'].map(label => (
              <div key={label} className={`p-2 rounded border text-xs font-bold ${getBadgeColor(label)}`}>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6">Asset Health</h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <div>
                <div className="font-bold">ML Engine Active</div>
                <div className="text-xs text-gray-400">Predictive analysis running...</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Infrastructure Asset A is currently operating under {severity.risk_label.toLowerCase()} conditions. 
              The system predicts stable energy usage for the next 4 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
