import { AI, getPreferenceValues } from "@raycast/api";
import { fetchPowerFlowRealtimeData } from "../api";

interface Preferences {
  baseUrl: string;
}

/**
 * Provides optimization suggestions based on current system performance
 * @returns {string} Optimization suggestions
 */
export default async function optimizationSuggestions(): Promise<string> {
  const { baseUrl } = getPreferenceValues<Preferences>();
  
  // Fetch the data directly from the API
  const powerResponse = await fetchPowerFlowRealtimeData(baseUrl);
  const site = powerResponse.Body.Data.Site;
  
  // Calculate derived metrics
  const currentPower = site.P_PV;
  const averageDailyProduction = site.E_Total || 0; // Using today's total as a proxy
  const peakPower = currentPower * 1.2; // Estimate peak as 20% higher than current
  const gridExportPercentage = site.P_Grid < 0 ? Math.abs(site.P_Grid) / site.P_PV * 100 : 0;
  
  return await AI.ask(`
    Based on this Fronius solar system data:
    - Current power: ${currentPower}W
    - Average daily production: ${averageDailyProduction}Wh
    - System peak power: ${peakPower}W
    - Grid export percentage: ${gridExportPercentage}%
    
    Provide 2-3 practical suggestions to optimize energy usage and system performance.
    Focus on actionable tips that a homeowner could implement.
  `);
}