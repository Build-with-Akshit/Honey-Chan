const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      cache: 'no-store', // Prevent aggressive Next.js caching on Vercel
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) {
      let errorMessage = `API Error: ${res.status} ${res.statusText}`;
      try {
        const errorData = await res.json();
        if (errorData.error) errorMessage = errorData.error;
      } catch (e) {}
      throw new Error(errorMessage);
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
  deleteHive: (id: string | number) => fetchApi<any>(`/hives/${id}`, { method: "DELETE" }),
  createHive: (data: any) =>
    fetchApi<any>("/hives", { method: "POST", body: JSON.stringify(data) }),
  postReading: (data: any) =>
    fetchApi<any>("/iot/readings", { method: "POST", body: JSON.stringify(data) }),
  getBatches: () => fetchApi<any[]>(`/batches?t=${Date.now()}`),
  getBatch: (id: string) => fetchApi<any>(`/batches/${id}`),
  createBatch: (data: any) =>
    fetchApi<any>("/batches", { method: "POST", body: JSON.stringify(data) }),
  transferBatch: (id: string, data: any) =>
    fetchApi<any>(`/batches/${id}/transfer`, { method: "POST", body: JSON.stringify(data) }),
  tamperBatch: (id: string, action: "tamper" | "restore" = "tamper") =>
    fetchApi<any>(`/batches/${id}/tamper`, { method: "POST", body: JSON.stringify({ action }) }),
  recallBatch: (id: string, data: { action: "recall" | "restore"; reason?: string; authority?: string }) =>
    fetchApi<any>(`/batches/${id}/recall`, { method: "POST", body: JSON.stringify(data) }),
  submitQualityTest: (data: any) =>
    fetchApi<any>("/quality/submit", { method: "POST", body: JSON.stringify(data) }),
  getHiveAI: (id: string, params?: { temp?: number; humidity?: number; weight?: number; activity?: number }) => {
    const qs = params ? "?" + new URLSearchParams(params as any).toString() : "";
    return fetchApi<any>(`/ai/hive/${id}${qs}`);
  },
  simulateHiveAI: (id: string, data: any) =>
    fetchApi<any>(`/ai/hive/${id}`, { method: "POST", body: JSON.stringify(data) }),
  analyzeImage: (data: any) =>
    fetchApi<any>("/ai/analyze-image", { method: "POST", body: JSON.stringify(data) }),
  analyzeReport: (data: any) =>
    fetchApi<any>("/ai/analyze-report", { method: "POST", body: JSON.stringify(data) }),
  chatAI: (data: { query: string; hiveCode?: string; telemetry?: any; history?: any[] }) =>
    fetchApi<any>("/ai/chat", { method: "POST", body: JSON.stringify(data) }),
  getChatHistory: () => fetchApi<{ messages: any[]; count: number; encrypted: boolean }>("/ai/chat/history"),
  clearChatHistory: () => fetchApi<any>("/ai/chat/history", { method: "DELETE" }),
  verifyBatch: (batchId: string) => fetchApi<any>(`/verify/${batchId}`),
  getUsers: () => fetchApi<any[]>("/users"),
};
