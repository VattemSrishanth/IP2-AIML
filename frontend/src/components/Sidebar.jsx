import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart2, Shield, Activity, Settings, 
  Terminal, FileText, Home, Layers 
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Overview', path: '/', icon: <Home size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart2 size={20} /> },
    { name: 'AI Models', path: '/ai-models', icon: <Layers size={20} /> },
    { name: 'Security', path: '/security', icon: <Shield size={20} /> },
    { name: 'Automation', path: '/automation', icon: <Settings size={20} /> },
    { name: 'Stress Test', path: '/stress-test', icon: <Activity size={20} /> },
    { name: 'Reports', path: '/reports', icon: <FileText size={20} /> },
  ];

  return (
    <div className="w-64 h-screen bg-dark-800 border-r border-dark-700 flex flex-col p-4 fixed">
      <div className="mb-10 px-2 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-dark-900">
          AI
        </div>
        <h1 className="text-xl font-bold tracking-tight">Smart Command</h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${isActive ? 'bg-primary text-dark-900 font-bold' : 'text-gray-400 hover:bg-dark-700 hover:text-white'}
            `}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="mt-auto border-t border-dark-700 pt-4 px-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Systems Status</div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <span className="text-sm text-gray-300">Gateway Online</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
