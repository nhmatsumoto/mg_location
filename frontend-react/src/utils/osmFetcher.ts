import axios from 'axios';

const CACHE = new Map<string, any>();
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export const fetchOSMData = async (query: string): Promise<any> => {
  if (CACHE.has(query)) {
    return CACHE.get(query);
  }

  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      const response = await axios.post('https://overpass-api.de/api/interpreter', query, {
        timeout: 30000,
      });
      CACHE.set(query, response.data);
      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 429 || status === 504) {
        retries++;
        console.warn(`OSM Fetch Retry ${retries}/${MAX_RETRIES} due to status ${status}`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retries));
      } else {
        throw error;
      }
    }
  }
  throw new Error(`Failed to fetch OSM data after ${MAX_RETRIES} retries.`);
};
