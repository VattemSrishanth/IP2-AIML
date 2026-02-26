import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
});

export const smartBuildingApi = {
  // Models
  predictComparison: (formData) => api.post('/predict_comparison', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  cluster: (formData) => api.post('/cluster', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Security
  getSecurityAnalytics: () => api.get('/security-analytics'),
  simulateAccess: () => api.post('/simulate-access'),
  getRecentLogs: () => api.get('/recent-access-logs'),

  // Engines
  automationCheck: (sensorData) => api.post('/automation-check', sensorData),
  calculateSeverity: (calcData) => api.post('/severity-calc', calcData),

  // Stress Test
  runStressTest: (stressRequest) => api.post('/stress-test', stressRequest),

  // Reports
  generateReport: (reportData) => api.post('/generate-report', reportData, {
      responseType: 'blob'
  }),
};

export default api;
