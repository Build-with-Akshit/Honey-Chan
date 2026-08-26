const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (err: any) {
    console.warn(`API call to ${endpoint} failed, checking fallback:`, err.message);
    throw err;
  }
}

export const honeyApi = {
  getStatus: () => fetchApi<any>("/status"),
  getClusters: () => fetchApi<any[]>("/clusters"),
  getHives: () => fetchApi<any[]>("/hives"),
  getHive: (id: string) => fetchApi<any>(`/hives/${id}`),
  createHive: (data: any) =>
    fetchApi<any>("/hives", { method: "POST", body: JSON.stringify(data) }),
  postReading: (data: any) =>
    fetchApi<any>("/iot/readings", { method: "POST", body: JSON.stringify(data) }),
  getBatches: () => fetchApi<any[]>("/batches"),
  getBatch: (id: string) => fetchApi<any>(`/batches/${id}`),
  createBatch: (data: any) =>
    fetchApi<any>("/batches", { method: "POST", body: JSON.stringify(data) }),
  transferBatch: (id: string, data: any) =>
    fetchApi<any>(`/batches/${id}/transfer`, { method: "POST", body: JSON.stringify(data) }),
  tamperBatch: (id: string) =>
    fetchApi<any>(`/batches/${id}/tamper`, { method: "POST" }),
  submitQualityTest: (data: any) =>
    fetchApi<any>("/quality/submit", { method: "POST", body: JSON.stringify(data) }),
  getHiveAI: (id: string) => fetchApi<any>(`/ai/hive/${id}`),
  analyzeImage: (data: any) =>
    fetchApi<any>("/ai/analyze-image", { method: "POST", body: JSON.stringify(data) }),
  verifyBatch: (batchId: string) => fetchApi<any>(`/verify/${batchId}`),
};
