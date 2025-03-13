import { AI, getPreferenceValues } from "@raycast/api";
import { fetchInverterInfo } from "../api";

interface Preferences {
  baseUrl: string;
}

/**
 * Provides an explanation and troubleshooting steps for inverter error codes
 * @returns {string} Explanation and troubleshooting steps
 */
export default async function explainErrors(): Promise<string> {
  const { baseUrl } = getPreferenceValues<Preferences>();
  
  // Fetch the data directly from the API
  const invResponse = await fetchInverterInfo(baseUrl);
  const invData = invResponse.Body.Data;
  
  // Extract error codes from all inverters
  const inverters = Object.entries(invData).map(([id, info]) => ({
    id,
    info,
  }));
  
  const errorCodes = inverters
    .filter(inv => inv.info.ErrorCode !== 0 && inv.info.ErrorCode !== -1)
    .map(inv => String(inv.info.ErrorCode));
  
  if (errorCodes.length === 0) {
    return "No errors detected. All inverters are operating normally.";
  }
  
  const statusMessage = inverters
    .map(inv => `${inv.info.CustomName || `Inverter ${inv.id}`}: ${inv.info.InverterState}`)
    .join(", ");
  
  return await AI.ask(`
    Analyze this Fronius inverter error:
    Error codes: ${errorCodes.join(", ")}
    Status: ${statusMessage}
    
    Please provide:
    1. A brief explanation of what this error means
    2. Potential causes for this issue
    3. Recommended troubleshooting steps
    
    Keep it concise and practical.
  `);
}