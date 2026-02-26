import React, { useState } from 'react';
import { Download, Database, PieChart, Activity } from 'lucide-react';
import { smartBuildingApi } from '../services/api';
import Charts from '../components/Charts';

const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [clusters, setClusters] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await smartBuildingApi.cluster(formData);
      setClusters(res.data);
      // Create some random chart data if dataset is loaded
      const dummyTrend = Array.from({length: 24}, (_, i) => ({
        hour: i,
        energy: Math.floor(Math.random() * 500) + 100,
        temp: Math.floor(Math.random() * 10) + 20
      }));
      setData(dummyTrend);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Advanced Data Analytics</h1>
          <p className="text-gray-400">Deep structural analysis and building usage patterns.</p>
        </div>
        <label className="bg-primary text-dark-900 px-4 py-2 rounded-lg font-bold cursor-pointer flex items-center gap-2 hover:opacity-90 transition-all">
          <Database size={20} />
          Upload Infrastructure Data
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6">Energy Consumption Trend</h2>
          <Charts type="line" data={data} xKey="hour" yKey="energy" height={250} />
        </div>
        
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6">Temperature vs Energy Correlation</h2>
          <Charts type="scatter" data={data} xKey="temp" yKey="energy" height={250} color="#00d1ff" />
        </div>

        {clusters && (
          <div className="lg:col-span-2 bg-dark-800 border border-dark-700 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6">Unsupervised Usage Clustering (KMeans)</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Object.entries(clusters.interpretations).map(([id, info]) => (
                <div key={id} className="p-4 rounded-lg bg-dark-700 border-t-4 border-secondary">
                  <div className="text-xs text-secondary font-bold mb-1 uppercase tracking-wider">Cluster {id}</div>
                  <div className="font-bold mb-2">{info.label}</div>
                  <div className="text-2xl font-bold text-white">{Math.floor(info.avg_energy)} kWh</div>
                  <div className="text-xs text-gray-400 mt-1">Avg Load Level</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
