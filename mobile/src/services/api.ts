import { PlanConfig, Investment } from '../types';

// Replace with your local machine LAN IP when testing on a physical device (e.g., http://192.168.1.50:5000/api)
export const API_BASE = 'http://localhost:5000/api';

export const MobileApi = {
  async getPlans(): Promise<PlanConfig[]> {
    try {
      const res = await fetch(`${API_BASE}/invest/plans`);
      const data = await res.json();
      return data.plans;
    } catch {
      return [
        { id: 'amateur', name: 'Amateur Plan', min: 100, max: 1999, durationHours: 24, rate: 0.045, referralRate: 0.08, description: '24h cycle', badge: '24h • 4.5%' },
        { id: 'standard', name: 'Standard Plan', min: 2000, max: 5999, durationHours: 48, rate: 0.095, referralRate: 0.16, description: '48h cycle', badge: '48h • 9.5%' },
        { id: 'premium', name: 'Premium Plan', min: 6000, max: 10999, durationHours: 72, rate: 0.155, referralRate: 0.24, description: '72h cycle', badge: '72h • 15.5%' },
        { id: 'retirement', name: 'Retirement Plan', min: 11000, max: Infinity, durationHours: 96, rate: 0.225, referralRate: 0.30, description: '96h cycle', badge: '96h • 22.5%' }
      ];
    }
  }
};
