import { AI, getPreferenceValues } from "@raycast/api";
import { fetchPowerFlowRealtimeData } from "../api";

interface Preferences {
  baseUrl: string;
}

/**
 * Analyzes the current state of the Fronius solar system
 * @returns {string} Analysis of the system state
 */
export default async function analyzeSystem(): Promise<string> {
  const { baseUrl } = getPreferenceValues<Preferences>();
  
  // Fetch the data directly from the API
  const powerResponse = await fetchPowerFlowRealtimeData(baseUrl);
  const site = powerResponse.Body.Data.Site;
  
  // Extract the relevant data
  const data = {
    currentPower: site.P_PV,
    dailyEnergy: site.E_Total || 0,
    gridPower: site.P_Grid,
    loadPower: site.P_Load,
    batteryPower: site.P_Akku,
    batteryStateOfCharge: site.StateOfCharge_Relative,
  };
  
  return await AI.ask(`
    Analyze this solar system data and provide insights:
    - Current production: ${data.currentPower}W
    - Today's energy: ${data.dailyEnergy}Wh
    - Grid power (negative=export): ${data.gridPower}W
    - Home consumption: ${data.loadPower}W
    ${data.batteryPower !== undefined ? `- Battery power (negative=charging): ${data.batteryPower}W` : ''}
    ${data.batteryStateOfCharge !== undefined ? `- Battery charge: ${data.batteryStateOfCharge}%` : ''}
    
    Please provide:
    1. A brief summary of the current system state
    2. Any notable observations (high/low production, consumption patterns)
    3. One actionable insight based on the current energy flow
    
    Keep it concise (3-4 sentences total).
  `);
}