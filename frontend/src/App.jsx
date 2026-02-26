import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Analytics from './pages/Analytics';
import AIModels from './pages/AIModels';
import Security from './pages/Security';
import Automation from './pages/Automation';
import StressTest from './pages/StressTest';
import Reports from './pages/Reports';

function App() {
  return (
    <div className="flex bg-dark-900 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/ai-models" element={<AIModels />} />
          <Route path="/security" element={<Security />} />
          <Route path="/automation" element={<Automation />} />
          <Route path="/stress-test" element={<StressTest />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
