"use client";

import { useState, useEffect, useRef } from "react";
import { honeyApi } from "@/lib/api";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
  provider?: string;
}

interface DetectionBox {
  id: string;
  label: string;
  type: "brood" | "honey" | "mite" | "queen" | "pollen" | "foulbrood";
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export default function BeekeeperAIPage() {
  const [aiData, setAiData] = useState<any>(null);
  const [hives, setHives] = useState<any[]>([]);
  const [selectedHive, setSelectedHive] = useState("H001");
  const [loading, setLoading] = useState(true);

  // ─── Active Tab / View ────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"overview" | "comb_vision" | "chat_voice" | "lab_screener">("overview");

  // ─── Computer Vision Comb Screening State ──────────────────────────────
  const [scanningImage, setScanningImage] = useState(false);
  const [imageReport, setImageReport] = useState<any>(null);
  const [selectedFrameSample, setSelectedFrameSample] = useState("frame_brood_01.jpg");
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── AI Conversational Chat & Voice State ──────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      text: `Namaste! Main aapka **HoneyChain AI Agronomist & Biosecurity Officer** hoon.\n\nMain aapke hive ke micro-climate, health index, honey harvest timing, aur Varroa mite biosecurity ka vishleshan (analysis) karta hoon. Aap mujhse **Hindi, Hinglish ya English** mein koi bhi sawal pooch sakte hain ya **🎙️ Mic button** daba kar bol sakte hain!`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      provider: "KVIC Honey Mission AI Engine",
    },
  ]);
  const [sessions, setSessions] = useState<{ id: string; title: string; hiveCode: string; createdAt?: string; updatedAt?: string; messageCount?: number }[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentSessionTitle, setCurrentSessionTitle] = useState<string>("New chat");
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingSessionMessages, setLoadingSessionMessages] = useState(false);
  const [chatSidebarOpen, setChatSidebarOpen] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const [loadingHistory, setLoadingHistory] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [aiChatQuery, setAiChatQuery] = useState("");
  const [askingAI, setAskingAI] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  const scrollChips = (direction: "left" | "right") => {
    if (chipsRef.current) {
      const scrollAmount = direction === "left" ? -220 : 220;
      chipsRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // ─── FSSAI Lab Report Screener State ───────────────────────────────────
  const [reportType, setReportType] = useState<"pure_raw_honey" | "adulterated_c4_syrup" | "custom">("pure_raw_honey");
  const [scanningReport, setScanningReport] = useState(false);
  const [reportResult, setReportResult] = useState<any>(null);
  const reportFileInputRef = useRef<HTMLInputElement>(null);

  // ─── Interactive Telemetry Stress Test / Simulator State ───────────────
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simTemp, setSimTemp] = useState(34.2);
  const [simHum, setSimHum] = useState(64.8);
  const [simWeight, setSimWeight] = useState(38.45);
  const [simAct, setSimAct] = useState(0.88);

  const fetchAI = async (hiveCode: string) => {
    if (!hiveCode) return;
    setLoading(true);
    try {
      const res = await honeyApi.getHiveAI(hiveCode);
      setAiData(res);
      if (res?.sensor_data) {
        setSimTemp(res.sensor_data.temperature ?? 34.2);
        setSimHum(res.sensor_data.humidity ?? 64.8);
        setSimWeight(res.sensor_data.weight ?? 38.45);
        setSimAct(res.sensor_data.bee_activity ?? 0.88);
      }
    } catch (err) {
      console.error("AI fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const list = await honeyApi.getHives();
        if (list && list.length > 0) {
          setHives(list);
          setSelectedHive(list[0].hiveCode || "H001");
        } else {
          setSelectedHive("H001");
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedHive) {
      setIsSimulating(false);
      fetchAI(selectedHive);
    }
  }, [selectedHive]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, askingAI]);

  // Load sessions and initial messages on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // ─── Multi-Chat Sessions API Actions ──────────────────────────────────
  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await honeyApi.getChatSessions();
      if (res?.sessions && res.sessions.length > 0) {
        setSessions(res.sessions);
        if (!currentSessionId) {
          selectSession(res.sessions[0].id, res.sessions[0].title);
        }
      }
    } catch (err) {
      console.warn("[AI Sessions] Could not load sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const selectSession = async (sessionId: string, title?: string) => {
    setCurrentSessionId(sessionId);
    if (title) setCurrentSessionTitle(title);
    setLoadingSessionMessages(true);
    try {
      const res = await honeyApi.getSessionMessages(sessionId);
      if (res?.messages) {
        setMessages(res.messages);
      }
      if (res?.session?.title) {
        setCurrentSessionTitle(res.session.title);
      }
    } catch (err) {
      console.error("Failed to load session messages:", err);
    } finally {
      setLoadingSessionMessages(false);
    }
  };

  const handleStartNewChat = () => {
    setCurrentSessionId(null);
    setCurrentSessionTitle("New chat");
    setMessages([]);
  };

  const handleDeleteSession = async (sessionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this conversation thread?")) return;
    try {
      await honeyApi.deleteChatSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        handleStartNewChat();
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const handleSaveRename = async (sessionId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingTitleText.trim()) {
      setEditingSessionId(null);
      return;
    }
    try {
      await honeyApi.renameChatSession(sessionId, editingTitleText.trim());
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title: editingTitleText.trim() } : s))
      );
      if (currentSessionId === sessionId) {
        setCurrentSessionTitle(editingTitleText.trim());
      }
      setEditingSessionId(null);
    } catch (err) {
      console.error("Failed to rename session:", err);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Kya aap apni private encrypted chat history delete karna chahte hain?")) {
      return;
    }
    setClearingHistory(true);
    try {
      await honeyApi.clearChatHistory();
      setMessages([
        {
          id: "welcome-reset",
          role: "assistant",
          text: `Encrypted chat history clear ho chuki hai. Hive **${selectedHive}** telemetry active hai. Aap apna naya sawal pooch sakte hain!`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          provider: "HoneyChain Agro-Inference Engine",
        },
      ]);
    } catch (err) {
      console.error("Failed to clear chat history:", err);
    } finally {
      setClearingHistory(false);
    }
  };

  // ─── Live Telemetry Simulator Handler ──────────────────────────────────
  const handleApplySimulation = async (
    t: number,
    h: number,
    w: number,
    a: number
  ) => {
    setIsSimulating(true);
    setSimTemp(t);
    setSimHum(h);
    setSimWeight(w);
    setSimAct(a);

    try {
      const res = await honeyApi.simulateHiveAI(selectedHive, {
        temperature: t,
        humidity: h,
        weight: w,
        bee_activity: a,
      });
      setAiData(res);
    } catch (err) {
      console.error("Simulation failed:", err);
    }
  };

  const handleResetSimulation = () => {
    setIsSimulating(false);
    fetchAI(selectedHive);
  };

  // ─── Computer Vision Scan Handler ──────────────────────────────────────
  const runImageScan = async () => {
    setScanningImage(true);
    try {
      const payload: any = {
        imageName: customImageBase64 ? "user_custom_frame.jpg" : selectedFrameSample,
        hiveId: selectedHive || "H001",
        colonyType: "Apis mellifera",
      };
      if (customImageBase64) {
        payload.imageBase64 = customImageBase64;
      }

      const res = await honeyApi.analyzeImage(payload);
      setImageReport(res);
    } catch (err) {
      console.error("Image scan failed:", err);
    } finally {
      setScanningImage(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setCustomImageBase64(base64);
      setImageReport(null);
    };
    reader.readAsDataURL(file);
  };

  // ─── FSSAI Lab Report Screener Handler ─────────────────────────────────
  const runReportScreener = async (type?: string, base64?: string) => {
    setScanningReport(true);
    try {
      const res = await honeyApi.analyzeReport({
        reportType: type || reportType,
        reportBase64: base64,
        batchId: `BATCH-KVIC-${selectedHive}`,
      });
      setReportResult(res);
    } catch (err) {
      console.error("Report analysis failed:", err);
    } finally {
      setScanningReport(false);
    }
  };

  // ─── AI Conversational Chat Handler ────────────────────────────────────
  const handleAskAI = async (promptText?: string) => {
    const query = (promptText || aiChatQuery).trim();
    if (!query || askingAI) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setAiChatQuery("");
    setAskingAI(true);

    try {
      const currentTelemetry = {
        temperature: simTemp,
        humidity: simHum,
        weight: simWeight,
        beeActivity: simAct,
        healthScore: aiData?.healthScore ?? 94,
      };

      const res = await honeyApi.chatAI({
        query,
        hiveCode: selectedHive,
        sessionId: currentSessionId || undefined,
        telemetry: currentTelemetry,
        history: messages.slice(-4),
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        text: res.reply || "Diagnostic analysis complete.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        provider: res.provider || "HoneyChain Agro-Inference Engine",
      };

      setMessages((prev) => [...prev, aiMsg]);

      // If a session ID was returned, sync with sessions list
      if (res?.sessionId) {
        setCurrentSessionId(res.sessionId);
        if (res.sessionTitle) {
          setCurrentSessionTitle(res.sessionTitle);
        }
        setSessions((prev) => {
          const exists = prev.some((s) => s.id === res.sessionId);
          if (exists) {
            return prev.map((s) =>
              s.id === res.sessionId
                ? {
                    ...s,
                    title: res.sessionTitle || s.title,
                    updatedAt: new Date().toISOString(),
                    messageCount: (s.messageCount || 0) + 2,
                  }
                : s
            );
          } else {
            return [
              {
                id: res.sessionId,
                title: res.sessionTitle || query.slice(0, 32),
                hiveCode: selectedHive,
                updatedAt: new Date().toISOString(),
                messageCount: 2,
              },
              ...prev,
            ];
          }
        });
      }
    } catch (err: any) {
      console.error("AI Chat error:", err);
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: "assistant",
        text: `⚠️ **AI Agronomist Note for ${selectedHive}:** Colony temperature is currently **${simTemp.toFixed(1)}°C** with humidity at **${simHum.toFixed(1)}%**. Biomass index is holding strong at **${simWeight.toFixed(1)} kg**. Standard KVIC inspection protocol recommended.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        provider: "Local Biosecurity Engine",
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setAskingAI(false);
    }
  };

  // ─── Speech Recognition (Voice Input for Hands-free Beekeeper) ────────
  const handleStartVoice = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition browser support: Chrome, Edge, Safari me available hai.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "hi-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setAiChatQuery(transcript);
        setIsListening(false);
        handleAskAI(transcript);
      };
      recognition.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (err) {
      console.error("Mic error:", err);
      setIsListening(false);
    }
  };

  // ─── Text-To-Speech (Speech Synthesis) ─────────────────────────────────
  const handleSpeak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*_#`[\]()]/g, " ").replace(/[^\w\s.,?!'\u0900-\u097F]/g, " ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Safe data accessors
  const healthScore = Number(aiData?.healthScore ?? aiData?.health_score ?? 94);
  const riskLevel = String(aiData?.riskLevel ?? aiData?.risk_level ?? "LOW").toUpperCase();
  const productivityKg = Number(aiData?.productivityKg ?? aiData?.estimated_harvest_kg ?? 16.5);
  const confidencePercent = Math.round(Number(aiData?.confidence ?? aiData?.confidence_score ?? 0.94) * 100);
  const windowDays = Number(aiData?.windowDays ?? aiData?.harvest_window_days ?? 7);

  const recommendation =
    aiData?.recommendation ||
    "Maintain standard inspection schedule. Flow conditions and brood climate are optimal.";
  const explanation =
    aiData?.explanation ||
    "Analysis based on 4-point real-time telemetry (Temp: 34.2°C, Hum: 64.8%, Weight: 38.45kg, Activity: 88%).";

  const anomalyDetection = aiData?.anomalyDetection || {
    broodCoolingRisk: "Optimal (34.2°C)",
    varroaMiteRisk: "Low (<1.5% Infestation)",
    swarmingProbability: 0.08,
  };

  const factors = aiData?.factors || [
    {
      name: "Brood Chamber Thermal Regulation",
      value: `${simTemp.toFixed(1)}°C (Target: 34.0°C)`,
      status: simTemp >= 33.5 && simTemp <= 35.8 ? "optimal" : "warning",
    },
    {
      name: "Colony Relative Humidity",
      value: `${simHum.toFixed(1)}% (Target: 55-70%)`,
      status: simHum >= 55 && simHum <= 72 ? "optimal" : "warning",
    },
    {
      name: "Foraging & Flight Activity Index",
      value: `${Math.round(simAct * 100)}% (Peak Floral Flow)`,
      status: simAct >= 0.65 ? "optimal" : "warning",
    },
    {
      name: "Net Hive Scale & Honey Super Mass",
      value: `${simWeight.toFixed(2)} kg (+${Math.max(0, simWeight - 18.2).toFixed(1)} kg Super)`,
      status: "optimal",
    },
  ];

  return (
    <div className="space-y-6 page-enter pb-12">
      {/* ─── Top Header Card with Honey Taste ────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-500/10 p-6 rounded-3xl border border-amber-200/80 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-black text-amber-950 tracking-tight">
                HoneyChain AI Intelligence Suite
              </h1>
              <span className="flex items-center gap-1.5 bg-blue-500/15 text-blue-800 border border-blue-300 text-xs font-extrabold px-3 py-1 rounded-full shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-blue-500 pulse-dot" />
                3-TIER HYBRID AI STACK
              </span>
              {isSimulating && (
                <span className="flex items-center gap-1.5 bg-amber-500/20 text-amber-900 border border-amber-400 text-xs font-black px-3 py-1 rounded-full animate-pulse">
                  <span>🧪</span> SIMULATION ACTIVE
                </span>
              )}
            </div>

            <p className="text-xs text-amber-900/70 mt-2 font-medium">
              Tier 1: XGBoost Telemetry ML • Tier 2: ResNet-50 Comb Vision • Tier 3: Google Gemini Multilingual Voice Agronomist
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Hive Switcher */}
            <div className="flex items-center gap-2.5 bg-white/95 px-4 py-2.5 rounded-2xl border border-amber-200 shadow-xs hover:border-amber-400 transition-colors">
              <span className="text-xs font-bold text-amber-900/60">Selected Hive:</span>
              <select
                value={selectedHive}
                onChange={(e) => setSelectedHive(e.target.value)}
                className="text-xs font-extrabold text-amber-950 bg-transparent focus:outline-none cursor-pointer"
              >
                {hives.length > 0 ? (
                  hives.map((h) => (
                    <option key={h.id || h.hiveCode} value={h.hiveCode}>
                      {h.hiveCode} • {h.location || h.flowerSource || "Apiary Node"}
                    </option>
                  ))
                ) : (
                  <option value="H001">H001 • Sonipat Apiary Node</option>
                )}
              </select>
            </div>

            {/* Simulation Toggle Button */}
            <button
              onClick={() => setSimulatorOpen(!simulatorOpen)}
              className={`text-xs font-extrabold px-4 py-2.5 rounded-2xl border transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                simulatorOpen || isSimulating
                  ? "bg-amber-500 text-white border-amber-600 shadow-amber-500/20"
                  : "bg-white hover:bg-amber-50 text-amber-950 border-amber-200"
              }`}
            >
              <span>🧪</span>
              <span>{simulatorOpen ? "Hide Simulator" : "AI Stress Test Simulator"}</span>
            </button>
          </div>
        </div>

        {/* ─── AI Navigation Pills ────────────────────────────────────────── */}
        <div className="mt-5 pt-4 border-t border-amber-200/70 flex flex-wrap gap-2">
          {[
            { id: "overview", label: "📊 Hive Health & Telemetry", icon: "🌱" },
            { id: "comb_vision", label: "📸 ResNet Comb Vision (YOLO)", icon: "🔍" },
            { id: "chat_voice", label: "🗣️ Gemini Voice Agronomist", icon: "✨" },
            { id: "lab_screener", label: "📑 FSSAI C4 Sugar Lab Screener", icon: "🛡️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-amber-900 text-amber-50 shadow-sm"
                  : "bg-white/80 hover:bg-white text-amber-900 border border-amber-200/80"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ─── Collapsible Interactive AI Stress Test Simulator ─────────── */}
        {simulatorOpen && (
          <div className="mt-5 pt-5 border-t border-amber-200/90 page-enter space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-2">
                  <span>🔬</span> Hive Micro-Climate What-If Simulator & Stress Tester
                </h3>
                <p className="text-[11px] text-amber-800/70 font-medium">
                  Adjust sensor values or select preset environmental vectors to test how HoneyChain AI recalculates colony health & disease risks in real-time.
                </p>
              </div>

              {isSimulating && (
                <button
                  onClick={handleResetSimulation}
                  className="text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl border border-amber-300 transition-all cursor-pointer"
                >
                  ↺ Reset to Live Baseline
                </button>
              )}
            </div>

            {/* Quick Scenario Preset Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { label: "🌸 Peak Spring Flow (Optimal)", t: 34.4, h: 62.0, w: 43.5, a: 0.92 },
                { label: "🔥 Summer Heatwave Stress (39°C)", t: 39.2, h: 46.0, w: 35.8, a: 0.65 },
                { label: "🌧️ Monsoon Moisture Hazard (86%)", t: 33.6, h: 86.0, w: 32.5, a: 0.42 },
                { label: "❄️ Winter Brood Chilling (28.5°C)", t: 28.5, h: 74.0, w: 29.8, a: 0.32 },
                { label: "⚠️ Swarm Alert (Weight Loss)", t: 35.6, h: 66.0, w: 23.0, a: 0.96 },
              ].map((sc, i) => (
                <button
                  key={i}
                  onClick={() => handleApplySimulation(sc.t, sc.h, sc.w, sc.a)}
                  className="text-[11px] font-bold px-3 py-1.5 bg-white hover:bg-amber-100/90 text-amber-900 border border-amber-200/90 rounded-xl transition-all shadow-2xs cursor-pointer"
                >
                  {sc.label}
                </button>
              ))}
            </div>

            {/* 4 Interactive Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white/80 p-4 rounded-2xl border border-amber-200">
              <div>
                <div className="flex justify-between text-xs font-bold text-amber-950 mb-1">
                  <span>Internal Temp:</span>
                  <span className="font-mono text-amber-800">{simTemp.toFixed(1)}°C</span>
                </div>
                <input
                  type="range"
                  min="27"
                  max="42"
                  step="0.1"
                  value={simTemp}
                  onChange={(e) =>
                    handleApplySimulation(parseFloat(e.target.value), simHum, simWeight, simAct)
                  }
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <span className="text-[10px] text-amber-700/60 block font-medium">Optimal: 33.5 - 35.8°C</span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-amber-950 mb-1">
                  <span>Relative Humidity:</span>
                  <span className="font-mono text-amber-800">{simHum.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="95"
                  step="0.5"
                  value={simHum}
                  onChange={(e) =>
                    handleApplySimulation(simTemp, parseFloat(e.target.value), simWeight, simAct)
                  }
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <span className="text-[10px] text-amber-700/60 block font-medium">Optimal: 55 - 72%</span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-amber-950 mb-1">
                  <span>Hive Scale Mass:</span>
                  <span className="font-mono text-amber-800">{simWeight.toFixed(2)} kg</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="55"
                  step="0.2"
                  value={simWeight}
                  onChange={(e) =>
                    handleApplySimulation(simTemp, simHum, parseFloat(e.target.value), simAct)
                  }
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <span className="text-[10px] text-amber-700/60 block font-medium">Surplus: +{Math.max(0, simWeight - 18.2).toFixed(1)} kg</span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-amber-950 mb-1">
                  <span>Foraging Traffic:</span>
                  <span className="font-mono text-amber-800">{Math.round(simAct * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.02"
                  value={simAct}
                  onChange={(e) =>
                    handleApplySimulation(simTemp, simHum, simWeight, parseFloat(e.target.value))
                  }
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <span className="text-[10px] text-amber-700/60 block font-medium">Healthy: &gt; 65% Traffic</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading && !aiData ? (
        <div className="p-16 text-center text-amber-900/60 bg-white/60 rounded-3xl border border-amber-100">
          <div className="animate-spin h-8 w-8 border-3 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs font-bold font-mono">Running Predictive AI Analysis...</p>
        </div>
      ) : (
        <>
          {/* ─── Top 3 Metric Cards (Tier 1: XGBoost Telemetry) ───────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Colony Health Index */}
            <div className={`group relative overflow-hidden p-6 rounded-3xl border shadow-sm hover:shadow-lg transition-all ${
              riskLevel === "LOW"
                ? "bg-gradient-to-br from-[#f6fdf9] via-white to-emerald-50/70 border-emerald-200/90 hover:border-emerald-400"
                : riskLevel === "MEDIUM"
                ? "bg-gradient-to-br from-[#fffdf5] via-white to-amber-50/70 border-amber-200/90 hover:border-amber-400"
                : "bg-gradient-to-br from-[#fff8f8] via-white to-rose-50/70 border-rose-200/90 hover:border-rose-400"
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900/70 uppercase tracking-wider">
                    Colony Health Index (XGBoost)
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className={`text-4xl font-black tracking-tight font-mono ${
                      healthScore >= 85 ? "text-emerald-900" : healthScore >= 70 ? "text-amber-900" : "text-rose-900"
                    }`}>
                      {healthScore}
                    </span>
                    <span className="text-sm font-bold text-emerald-600">/ 100</span>
                  </div>
                </div>

                <div className={`w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center text-2xl group-hover:scale-105 transition-transform text-white ${
                  healthScore >= 85
                    ? "bg-gradient-to-br from-emerald-400 to-teal-600"
                    : healthScore >= 70
                    ? "bg-gradient-to-br from-amber-400 to-amber-600"
                    : "bg-gradient-to-br from-rose-400 to-rose-600"
                }`}>
                  {healthScore >= 85 ? "💚" : healthScore >= 70 ? "⚠️" : "🚨"}
                </div>
              </div>

              <div className="mt-4 health-bar h-2.5 bg-emerald-100 rounded-full overflow-hidden">
                <div
                  className={`health-bar-fill h-full rounded-full transition-all duration-700 ${
                    healthScore >= 85
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                      : healthScore >= 70
                      ? "bg-gradient-to-r from-amber-500 to-amber-600"
                      : "bg-gradient-to-r from-rose-500 to-red-600"
                  }`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-xs border-t border-emerald-100 pt-3">
                <span className="text-emerald-900/70 font-medium">Risk Assessment:</span>
                <span className={`badge font-extrabold text-[11px] ${
                  riskLevel === "LOW"
                    ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                    : riskLevel === "MEDIUM"
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : "bg-rose-100 text-rose-900 border-rose-300"
                }`}>
                  {riskLevel === "LOW" ? "🟢" : riskLevel === "MEDIUM" ? "🟡" : "🔴"} {riskLevel} RISK
                </span>
              </div>
            </div>

            {/* Card 2: Honey Yield Forecast */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-[#f8fcff] via-white to-blue-50/70 p-6 rounded-3xl border border-blue-200/90 shadow-sm hover:shadow-lg hover:border-blue-400 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-900/70 uppercase tracking-wider">
                    Honey Yield Forecast
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-black text-blue-900 tracking-tight font-mono">
                      {productivityKg.toFixed(1)}
                    </span>
                    <span className="text-sm font-bold text-blue-600">KG Surplus</span>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sm flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  🍯
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-blue-950/80 border-t border-blue-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-900/70">Model Confidence:</span>
                  <span className="font-mono font-bold text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                    {confidencePercent}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-900/70">Expected Harvest Window:</span>
                  <span className="font-bold text-blue-900">In {windowDays} Days</span>
                </div>
              </div>
            </div>

            {/* Card 3: Colony Behavior & Queen */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-[#fffef7] via-white to-amber-50/70 p-6 rounded-3xl border border-amber-200/90 shadow-sm hover:shadow-lg hover:border-amber-400 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-900/70 uppercase tracking-wider">
                    Colony Behavior & Queen
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-black text-amber-900 tracking-tight">
                      {healthScore >= 75 ? "Active Colony" : "Stressed Colony"}
                    </span>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  👑
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs border-t border-amber-100 pt-3">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-amber-900/70">Brood Chilling Hazard:</span>
                  <span className={`font-bold ${anomalyDetection.broodCoolingRisk.includes("Hazard") ? "text-rose-700" : "text-emerald-700"}`}>
                    {anomalyDetection.broodCoolingRisk}
                  </span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-amber-900/70">Varroa Mite Vulnerability:</span>
                  <span className={`font-bold ${anomalyDetection.varroaMiteRisk.includes("Elevated") ? "text-amber-700" : "text-emerald-700"}`}>
                    {anomalyDetection.varroaMiteRisk}
                  </span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-amber-900/70">Swarming Probability:</span>
                  <span className="font-bold text-amber-800">
                    {Math.round((anomalyDetection.swarmingProbability || 0.08) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── TAB 1 & DEFAULT: Diagnostic Environmental Telemetry Audit Matrix ── */}
          {(activeTab === "overview" || activeTab === "chat_voice") && (
            <div className="bg-gradient-to-br from-white via-[#fffef9] to-amber-50/30 p-6 rounded-3xl border border-amber-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-sm text-amber-950 flex items-center gap-2">
                  <span>📋</span> Environmental Telemetry Audit Matrix
                </h3>
                <span className="text-[11px] font-mono bg-amber-100/90 text-amber-900 border border-amber-300/80 px-2.5 py-0.5 rounded-lg font-bold">
                  Live Sensor Audit
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {factors.map((f: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-amber-200/80 hover:border-amber-400 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{f.status === "optimal" ? "✅" : "⚠️"}</span>
                      <span className="font-bold text-amber-950 text-xs">{f.name}</span>
                    </div>
                    <span className={`font-mono text-xs font-bold ${f.status === "optimal" ? "text-emerald-700" : "text-amber-700"}`}>
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TIER 3: Overview Recommendation Banner ──────────────────── */}
          {activeTab === "overview" && (
            <div className="bg-gradient-to-r from-amber-500/15 via-amber-100/60 to-orange-500/10 p-6 rounded-3xl border border-amber-300 shadow-sm space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0 shadow-sm">
                  💡
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-amber-950">AI Agronomist Recommendation</h3>
                    <span className="bg-amber-200/80 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                      KVIC & ICAR Inference
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-amber-900 leading-relaxed">{recommendation}</p>
                  <p className="text-[11px] text-amber-800/70 font-mono mt-1">{explanation}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-amber-200/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                  <span>💬 Have questions about this recommendation or colony health?</span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("chat_voice")}
                  className="btn-primary text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Open Multi-Chat AI Workspace</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* ─── TIER 3: Dedicated ChatGPT-Style Multi-Chat Workspace ──────── */}
          {activeTab === "chat_voice" && (
            <div className="bg-[#fcfbf7] border border-amber-300/80 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row h-[760px] max-h-[85vh] relative">
              {/* ── Left Sidebar (Collapsible on Mobile, ChatGPT style) ── */}
              <div
                className={`${
                  chatSidebarOpen ? "w-full md:w-72 flex" : "hidden md:hidden"
                } bg-amber-50/70 border-r border-amber-200/80 flex-col shrink-0 transition-all duration-300 z-20`}
              >
                {/* Sidebar Header */}
                <div className="p-3.5 border-b border-amber-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      🐝
                    </div>
                    <div>
                      <span className="text-xs font-black text-amber-950 tracking-tight block">HoneyChain AI</span>
                      <span className="text-[9px] font-semibold text-amber-800/60 block">Agronomist 4.0</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setChatSidebarOpen(false)}
                    className="w-7 h-7 rounded-lg text-amber-900/60 hover:text-amber-950 hover:bg-amber-100 flex items-center justify-center text-xs cursor-pointer transition-colors"
                    title="Collapse sidebar"
                  >
                    ✕
                  </button>
                </div>

                {/* + New Chat Button */}
                <div className="p-3">
                  <button
                    type="button"
                    onClick={handleStartNewChat}
                    className="w-full bg-white hover:bg-amber-100/90 text-amber-950 border border-amber-300 hover:border-amber-400 font-extrabold text-xs py-2.5 px-3.5 rounded-2xl flex items-center justify-between shadow-2xs transition-all cursor-pointer group active:scale-98"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-bold group-hover:scale-105 transition-transform">
                        +
                      </span>
                      <span>New chat</span>
                    </div>
                    <span className="text-[10px] text-amber-700/60 font-mono">⌘N</span>
                  </button>
                </div>

                {/* Session History List */}
                <div className="flex-1 overflow-y-auto px-2.5 py-1 space-y-1 scrollbar-thin">
                  <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-amber-900/50 flex items-center justify-between">
                    <span>Recent Conversations</span>
                    {sessions.length > 0 && <span className="font-mono">{sessions.length}</span>}
                  </div>

                  {loadingSessions && sessions.length === 0 ? (
                    <div className="p-4 text-center text-xs text-amber-800/60 flex items-center justify-center gap-2">
                      <div className="animate-spin h-3.5 w-3.5 border-2 border-amber-500 border-t-transparent rounded-full" />
                      <span>Loading chats...</span>
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-amber-800/60 font-medium">
                      No saved chats yet. Start a new conversation!
                    </div>
                  ) : (
                    sessions.map((s) => {
                      const isActive = currentSessionId === s.id;
                      const isEditing = editingSessionId === s.id;

                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            if (!isEditing && currentSessionId !== s.id) {
                              selectSession(s.id, s.title);
                            }
                          }}
                          className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                            isActive
                              ? "bg-amber-200/80 text-amber-950 font-bold border border-amber-300 shadow-2xs"
                              : "text-amber-900/80 hover:bg-amber-100/60 hover:text-amber-950 border border-transparent"
                          }`}
                        >
                          {isEditing ? (
                            <form
                              onSubmit={(e) => handleSaveRename(s.id, e)}
                              className="flex items-center gap-1.5 w-full"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="text"
                                value={editingTitleText}
                                onChange={(e) => setEditingTitleText(e.target.value)}
                                autoFocus
                                className="flex-1 px-2 py-0.5 text-xs bg-white border border-amber-400 rounded-lg focus:outline-none text-amber-950"
                              />
                              <button
                                type="submit"
                                className="text-emerald-700 hover:text-emerald-800 text-xs px-1 cursor-pointer"
                                title="Save"
                              >
                                ✓
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingSessionId(null)}
                                className="text-amber-800 hover:text-amber-950 text-xs px-1 cursor-pointer"
                                title="Cancel"
                              >
                                ✕
                              </button>
                            </form>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 truncate flex-1 pr-1">
                                <span className="text-xs shrink-0">{isActive ? "💬" : "🗨️"}</span>
                                <span className="truncate text-xs">{s.title || "Untitled Chat"}</span>
                              </div>

                              {/* Hover Actions: Rename / Delete */}
                              <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSessionId(s.id);
                                    setEditingTitleText(s.title);
                                  }}
                                  className="w-5 h-5 rounded hover:bg-white/80 text-amber-800 flex items-center justify-center text-[10px] cursor-pointer"
                                  title="Rename chat"
                                >
                                  ✏️
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteSession(s.id, e)}
                                  className="w-5 h-5 rounded hover:bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] cursor-pointer"
                                  title="Delete chat"
                                >
                                  🗑️
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Sidebar Footer: Security & Account Info */}
                <div className="p-3 border-t border-amber-200/70 bg-amber-100/40 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-amber-900/80">
                    <span className="flex items-center gap-1">
                      <span>🔒</span> AES-256-GCM Encrypted
                    </span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded">
                      Private
                    </span>
                  </div>
                  <p className="text-[9px] text-amber-800/60 leading-tight">
                    Sessions are encrypted with your account key in PostgreSQL.
                  </p>
                </div>
              </div>

              {/* ── Main Chat Area (ChatGPT Style Canvas) ── */}
              <div className="flex-1 flex flex-col h-full bg-[#fffefb] relative overflow-hidden">
                {/* Top Navigation Bar */}
                <div className="px-4 py-3 border-b border-amber-200/70 bg-white/80 backdrop-blur-sm flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {!chatSidebarOpen && (
                      <button
                        type="button"
                        onClick={() => setChatSidebarOpen(true)}
                        className="w-8 h-8 rounded-xl bg-amber-100/80 hover:bg-amber-200/80 text-amber-950 flex items-center justify-center text-xs font-bold border border-amber-300/80 cursor-pointer shadow-2xs transition-colors shrink-0"
                        title="Open sidebar"
                      >
                        ☰
                      </button>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xs font-black text-amber-950 truncate">
                          {currentSessionTitle || "New chat"}
                        </h2>
                        <span className="hidden sm:inline-block text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                          Gemini AI + ICAR
                        </span>
                      </div>
                      <p className="text-[10px] text-amber-800/60 truncate font-mono">
                        Hive Context: {selectedHive}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Active Hive Picker */}
                    <select
                      value={selectedHive}
                      onChange={(e) => setSelectedHive(e.target.value)}
                      className="text-[11px] font-bold text-amber-900 bg-amber-50/80 border border-amber-200 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
                    >
                      {hives.length > 0 ? (
                        hives.map((h) => (
                          <option key={h.id || h.hiveCode} value={h.hiveCode}>
                            {h.hiveCode}
                          </option>
                        ))
                      ) : (
                        <option value="H001">H001</option>
                      )}
                    </select>

                    {/* New Chat Icon Button */}
                    <button
                      type="button"
                      onClick={handleStartNewChat}
                      className="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center text-sm font-bold shadow-2xs cursor-pointer transition-transform active:scale-95"
                      title="Start new chat"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Messages Canvas */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin">
                  {loadingSessionMessages ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                      <div className="animate-spin h-7 w-7 border-3 border-amber-500 border-t-transparent rounded-full" />
                      <p className="text-xs font-bold text-amber-900">Decrypting conversation thread...</p>
                      <p className="text-[10px] text-amber-700/60 font-mono">AES-256-GCM authenticated deciphering in progress</p>
                    </div>
                  ) : messages.length === 0 ? (
                    /* Empty State - Just like ChatGPT "What's on your mind today?" */
                    <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center px-4 py-8 space-y-6">
                      <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-3xl shadow-md ring-4 ring-amber-200/50">
                        🐝
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-xl md:text-2xl font-black text-amber-950 tracking-tight">
                          What's on your apiary mind today?
                        </h2>
                        <p className="text-xs text-amber-800/70 max-w-md mx-auto leading-relaxed">
                          Ask in Hindi or English about your honey flow, varroa mite disease checks, temperature regulation, or ICAR/KVIC standards.
                        </p>
                      </div>

                      {/* Quick Starter Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                        {[
                          {
                            title: "Harvest Readiness",
                            desc: "Shahad kab nikalna chahiye? Weight aur moisture check karein.",
                            query: "Shahad kab nikalna chahiye? Weight aur moisture check karein",
                            icon: "🌾",
                          },
                          {
                            title: "Varroa Mite Biosecurity",
                            desc: "Varroa mite aur rog ke lakshan aur approved treatment batayein.",
                            query: "Varroa mite aur brood rog check karein aur ilaj batayein",
                            icon: "🛡️",
                          },
                          {
                            title: "Swarming Risk Check",
                            desc: "Is there any swarming danger based on current colony activity?",
                            query: "Is there any swarming danger based on current colony activity?",
                            icon: "🐝",
                          },
                          {
                            title: "Micro-climate Audit",
                            desc: "Chhatte ka tapman aur nami theek hai ya cooling karni padegi?",
                            query: "Chhatte ka tapman aur nami theek hai?",
                            icon: "🌡️",
                          },
                        ].map((card, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleAskAI(card.query)}
                            className="p-3.5 rounded-2xl bg-white hover:bg-amber-50/90 border border-amber-200 hover:border-amber-400 text-left transition-all shadow-2xs hover:shadow-xs cursor-pointer group active:scale-98"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-base">{card.icon}</span>
                              <span className="text-xs font-black text-amber-950 group-hover:text-amber-700 transition-colors">
                                {card.title}
                              </span>
                            </div>
                            <p className="text-[11px] text-amber-900/70 font-medium leading-normal line-clamp-2">
                              {card.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Active Thread Messages */
                    <div className="max-w-3xl mx-auto space-y-4 w-full">
                      {messages.map((m) => {
                        const isUser = m.role === "user";

                        return (
                          <div
                            key={m.id}
                            className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                          >
                            <div
                              className={`max-w-[88%] md:max-w-[80%] rounded-3xl text-xs leading-relaxed shadow-xs ${
                                isUser
                                  ? "bg-amber-600 text-white rounded-tr-xs p-4 font-medium"
                                  : "bg-white text-amber-950 border border-amber-200/90 rounded-tl-xs p-5"
                              }`}
                            >
                              {!isUser ? (
                                <div className="flex items-center justify-between gap-3 text-[10px] font-bold text-amber-800/80 mb-3 pb-2 border-b border-amber-100">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center text-[10px]">
                                      ✨
                                    </span>
                                    <span>{m.provider || "HoneyChain Agronomist"}</span>
                                    <span className="text-[9px] font-normal text-emerald-700 ml-1">🔒 Decrypted</span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleSpeak(m.text)}
                                      title="Listen to recommendation"
                                      className="text-amber-900/70 hover:text-amber-950 flex items-center gap-1 cursor-pointer font-bold bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200 transition-colors"
                                    >
                                      <span>{isSpeaking ? "⏹️ Stop" : "🔊 Suniye"}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleCopyMessage(m.id, m.text)}
                                      title="Copy response"
                                      className="text-amber-900/70 hover:text-amber-950 flex items-center gap-1 cursor-pointer font-bold bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200 transition-colors"
                                    >
                                      <span>{copiedMessageId === m.id ? "✓ Copied" : "📋 Copy"}</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-1 text-[9px] text-amber-100/90 font-medium mb-1">
                                  <span>🔒 Account Encrypted</span>
                                </div>
                              )}

                              <div
                                className="whitespace-pre-line text-xs font-normal leading-relaxed select-text"
                                dangerouslySetInnerHTML={{
                                  __html: m.text
                                    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
                                    .replace(/\*(.*?)\*/g, "<i>$1</i>")
                                    .replace(/`([^`]+)`/g, "<code class='bg-amber-100 text-amber-950 px-1 py-0.5 rounded font-mono text-[11px]'>$1</code>"),
                                }}
                              />
                            </div>

                            <span className="text-[9px] text-amber-900/40 font-mono mt-1 px-2">
                              {m.time}
                            </span>
                          </div>
                        );
                      })}

                      {askingAI && (
                        <div className="flex items-start">
                          <div className="p-4 bg-white border border-amber-200 rounded-3xl rounded-tl-xs text-xs text-amber-900 flex items-center gap-3 shadow-xs">
                            <div className="animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full" />
                            <span className="font-semibold text-xs">
                              Gemini AI analyzing live hive biosecurity, weight surplus & ICAR standards...
                            </span>
                          </div>
                        </div>
                      )}
                      <div ref={chatBottomRef} />
                    </div>
                  )}
                </div>

                {/* Bottom Floating Pill Input Area */}
                <div className="p-3 md:p-4 bg-gradient-to-t from-white via-white/95 to-transparent shrink-0 space-y-2 max-w-3xl mx-auto w-full">
                  {/* Quick Suggestion Chips Carousel */}
                  <div className="relative flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => scrollChips("left")}
                      className="shrink-0 w-6 h-6 rounded-lg bg-white border border-amber-200 text-amber-900 flex items-center justify-center text-[10px] shadow-2xs hover:bg-amber-100 hover:border-amber-300 transition-all cursor-pointer active:scale-90"
                      title="Slide left"
                    >
                      ◀
                    </button>

                    <div
                      ref={chipsRef}
                      className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap py-0.5 flex-1"
                    >
                      {[
                        "🌾 Shahad kab nikalna chahiye?",
                        "🛡️ Varroa mite aur rog check karein",
                        "🐝 Is there any swarming danger?",
                        "🌡️ Chhatte ka tapman aur nami theek hai?",
                        "🍯 Sugar syrup feeding ratio kitna rakhein?",
                        "📋 KVIC Honey Mission biosecurity guide",
                      ].map((prompt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAskAI(prompt.replace(/^[^\w]+/, "").trim())}
                          className="shrink-0 text-[11px] font-bold px-3 py-1.5 bg-white/90 hover:bg-amber-100 text-amber-900 border border-amber-200 hover:border-amber-300 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 active:scale-95"
                        >
                          <span>💬</span>
                          <span>{prompt}</span>
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => scrollChips("right")}
                      className="shrink-0 w-6 h-6 rounded-lg bg-white border border-amber-200 text-amber-900 flex items-center justify-center text-[10px] shadow-2xs hover:bg-amber-100 hover:border-amber-300 transition-all cursor-pointer active:scale-90"
                      title="Slide right"
                    >
                      ▶
                    </button>
                  </div>

                  {/* Floating Rounded Input Pill */}
                  <div className="relative flex items-center gap-2 bg-white rounded-2xl border border-amber-300/90 shadow-sm p-1.5 pl-4 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200/50 transition-all">
                    <input
                      type="text"
                      placeholder="Ask anything in Hindi or English (e.g. 'shahad kab nikale', 'varroa ilaj')..."
                      value={aiChatQuery}
                      onChange={(e) => setAiChatQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                      className="flex-1 text-xs bg-transparent focus:outline-none font-medium text-amber-950 placeholder-amber-800/40"
                    />

                    {/* Voice Mic Button */}
                    <button
                      type="button"
                      onClick={handleStartVoice}
                      title="Hands-Free Voice Recognition for Beekeepers"
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-all cursor-pointer ${
                        isListening
                          ? "bg-rose-600 text-white animate-pulse shadow-rose-500/30"
                          : "text-amber-800 hover:bg-amber-100/80"
                      }`}
                    >
                      🎙️
                    </button>

                    {/* Send Button */}
                    <button
                      type="button"
                      onClick={() => handleAskAI()}
                      disabled={askingAI || !aiChatQuery.trim()}
                      className="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center text-xs font-bold transition-transform cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-xs"
                      title="Send message"
                    >
                      {askingAI ? <span className="animate-spin text-[10px]">⏳</span> : "↑"}
                    </button>
                  </div>

                  {/* Privacy Note */}
                  <p className="text-[10px] text-center text-amber-800/50 font-medium">
                    HoneyChain AI uses live sensor telemetry + ICAR standards. End-to-end encrypted with AES-256-GCM.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─── TIER 2: Computer Vision Honeycomb Disease Screening (ResNet-50) ─── */}
          {(activeTab === "overview" || activeTab === "comb_vision") && (
            <div className="bg-gradient-to-br from-purple-500/10 via-white to-purple-500/5 p-6 rounded-3xl border border-purple-200/90 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-lg">
                      📸
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-purple-950">
                        Computer Vision Honeycomb Frame Screening
                      </h3>
                      <span className="badge bg-purple-100 text-purple-800 border border-purple-300 text-[10px] font-bold">
                        ResNet-50 CV MODEL (TIER 2)
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-purple-900/60 mt-1.5 font-medium">
                    Deep learning visual inspection of honeycomb cell geometry, capped brood regularity, Queen cells & Varroa mites
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Frame Sample Selector */}
                  <select
                    value={customImageBase64 ? "custom" : selectedFrameSample}
                    onChange={(e) => {
                      if (e.target.value === "custom") return;
                      setSelectedFrameSample(e.target.value);
                      setCustomImageBase64(null);
                      setImageReport(null);
                    }}
                    className="text-xs font-bold text-purple-900 bg-white px-3 py-2 rounded-xl border border-purple-200 shadow-xs focus:outline-none cursor-pointer"
                  >
                    <option value="frame_brood_01.jpg">Frame #1 (Central Brood Comb - Healthy)</option>
                    <option value="frame_super_02.jpg">Frame #2 (Capped Honey Super - Harvest Ready)</option>
                    <option value="frame_varroa_03.jpg">Frame #3 (Varroa Mite Outbreak Sample)</option>
                    <option value="frame_queen_04.jpg">Frame #4 (Queen Cell / Swarm Warning)</option>
                    {customImageBase64 && <option value="custom">Custom Uploaded Photo</option>}
                  </select>

                  {/* Upload Custom Photo Button */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold px-3 py-2 bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>📤</span>
                    <span>Upload Frame</span>
                  </button>

                  {/* Run Diagnosis Button */}
                  <button
                    onClick={runImageScan}
                    disabled={scanningImage}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2 px-4 text-xs font-bold rounded-2xl shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {scanningImage ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>Scanning Comb Architecture...</span>
                      </>
                    ) : (
                      <>
                        <span>🔍</span>
                        <span>Run Frame Diagnosis Scan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ─── Interactive Visual Frame Display with AI Detections ─────── */}
              <div className="relative rounded-2xl overflow-hidden border border-purple-200 bg-slate-900/90 aspect-video max-h-80 flex items-center justify-center shadow-inner">
                {customImageBase64 ? (
                  <img
                    src={customImageBase64}
                    alt="Custom Honeycomb"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-full h-full" viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="hexagons2" width="30" height="52" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
                        <path
                          d="M 15 0 L 30 8.66 L 30 25.98 L 15 34.64 L 0 25.98 L 0 8.66 Z M 0 25.98 L 15 34.64 L 15 51.96 L 0 60.62 L -15 51.96 L -15 34.64 Z M 30 25.98 L 45 34.64 L 45 51.96 L 30 60.62 L 15 51.96 L 15 34.64 Z"
                          fill={
                            selectedFrameSample.includes("super")
                              ? "#fbbf24"
                              : selectedFrameSample.includes("varroa")
                              ? "#78350f"
                              : selectedFrameSample.includes("queen")
                              ? "#b45309"
                              : "#d97706"
                          }
                          stroke="#451a03"
                          strokeWidth="1.5"
                          opacity={selectedFrameSample.includes("super") ? 0.9 : 0.8}
                        />
                      </pattern>
                      <radialGradient id="combGlow2" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
                      </radialGradient>
                    </defs>

                    <rect width="800" height="450" fill="#1c1917" />
                    <rect x="20" y="20" width="760" height="410" rx="12" fill="#78350f" stroke="#451a03" strokeWidth="8" />
                    <rect x="40" y="40" width="720" height="370" rx="8" fill="url(#hexagons2)" />
                    <rect x="40" y="40" width="720" height="370" fill="url(#combGlow2)" />

                    {selectedFrameSample.includes("varroa") && (
                      <g>
                        <circle cx="280" cy="180" r="7" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
                        <circle cx="420" cy="150" r="6" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
                        <circle cx="540" cy="270" r="7" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
                        <circle cx="360" cy="310" r="6" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
                        <text x="50" y="80" fill="#fca5a5" fontSize="16" fontWeight="bold">
                          ⚠️ High Varroa Mite Population Visible on Worker Cells
                        </text>
                      </g>
                    )}

                    {selectedFrameSample.includes("queen") && (
                      <g>
                        <ellipse cx="380" cy="330" rx="16" ry="28" fill="#d97706" stroke="#ffffff" strokeWidth="3" />
                        <ellipse cx="540" cy="320" rx="14" ry="24" fill="#d97706" stroke="#ffffff" strokeWidth="2.5" />
                        <text x="50" y="80" fill="#fde68a" fontSize="16" fontWeight="bold">
                          👑 Peanut-shaped Swarm Cells along Lower Frame Rim
                        </text>
                      </g>
                    )}

                    {selectedFrameSample.includes("super") && (
                      <g>
                        <rect x="80" y="60" width="640" height="240" rx="10" fill="#fef08a" opacity="0.35" stroke="#facc15" strokeWidth="2" />
                        <text x="50" y="80" fill="#fef08a" fontSize="16" fontWeight="bold">
                          🍯 89% Capped Honey Super Comb with Pristine White Cappings
                        </text>
                      </g>
                    )}

                    {!selectedFrameSample.includes("varroa") &&
                      !selectedFrameSample.includes("queen") &&
                      !selectedFrameSample.includes("super") && (
                        <g>
                          <ellipse cx="400" cy="225" rx="280" ry="140" fill="#fef3c7" opacity="0.15" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6,4" />
                          <text x="50" y="80" fill="#fef3c7" fontSize="16" fontWeight="bold">
                            ✨ Central Worker Brood Comb (Dense Concentric Capping)
                          </text>
                        </g>
                      )}
                  </svg>
                )}

                {/* Heatmap Attention Layer */}
                {showHeatmap && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-emerald-500/20 to-rose-600/40 mix-blend-color-dodge pointer-events-none animate-pulse" />
                )}

                {/* AI Bounding Box Overlays */}
                {showBoundingBoxes && imageReport?.detections && (
                  <div className="absolute inset-0 pointer-events-none">
                    {imageReport.detections.map((box: DetectionBox) => (
                      <div
                        key={box.id}
                        style={{
                          left: `${box.x}%`,
                          top: `${box.y}%`,
                          width: `${box.width}%`,
                          height: `${box.height}%`,
                        }}
                        className={`absolute border-2 rounded-lg flex items-start p-1 transition-all ${
                          box.type === "mite"
                            ? "border-rose-500 bg-rose-500/20 text-rose-200 animate-pulse"
                            : box.type === "queen"
                            ? "border-amber-400 bg-amber-500/20 text-amber-200"
                            : box.type === "honey"
                            ? "border-yellow-400 bg-yellow-500/20 text-yellow-200"
                            : "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                        }`}
                      >
                        <span className="text-[10px] font-black tracking-tight bg-black/80 px-1.5 py-0.5 rounded shadow">
                          {box.label} ({Math.round(box.confidence * 100)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Status Bar inside Viewer */}
                <div className="absolute bottom-2.5 left-3 right-3 flex flex-wrap items-center justify-between pointer-events-auto bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-xl text-white text-[11px] gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-mono font-bold">
                      {customImageBase64 ? "Custom User Frame" : selectedFrameSample}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {imageReport?.detections && (
                      <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10px] font-bold">
                        <input
                          type="checkbox"
                          checked={showBoundingBoxes}
                          onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                          className="accent-purple-400"
                        />
                        <span>Bounding Boxes</span>
                      </label>
                    )}

                    <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10px] font-bold">
                      <input
                        type="checkbox"
                        checked={showHeatmap}
                        onChange={(e) => setShowHeatmap(e.target.checked)}
                        className="accent-rose-400"
                      />
                      <span>Attention Heatmap</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Scan Diagnostic Report */}
              {imageReport ? (
                <div className="p-5 rounded-2xl bg-white border border-purple-200/90 space-y-4 page-enter shadow-xs">
                  <div className="flex flex-wrap items-center justify-between pb-3 border-b border-purple-100 text-xs gap-2">
                    <span className="font-extrabold text-purple-950 text-sm flex items-center gap-2">
                      <span>✨</span> Visual Health Index: {imageReport.overallVisualHealth}% (Confidence:{" "}
                      {Math.round(imageReport.confidence * 100)}%)
                    </span>
                    <span
                      className={`badge font-extrabold ${
                        imageReport.riskLevel === "LOW"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : imageReport.riskLevel === "MEDIUM"
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-rose-100 text-rose-800 border-rose-300"
                      }`}
                    >
                      {imageReport.riskLevel === "LOW"
                        ? "✓ PASSED HEALTH CHECK"
                        : imageReport.riskLevel === "MEDIUM"
                        ? "⚠️ WARNING / ACTION RECOMMENDED"
                        : "🚨 BIOSECURITY THREAT DETECTED"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                    <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                      <span className="text-purple-900/60 block text-[11px] font-semibold">Comb Cell Geometry:</span>
                      <p className="font-mono font-bold text-purple-950 mt-1 text-sm">
                        {imageReport.detectionResults?.combPatternRegularity ?? 96.4}% Regular
                      </p>
                    </div>

                    <div className={`p-3 rounded-xl border ${
                      imageReport.detectionResults?.varroaMiteInfestation.includes("CRITICAL")
                        ? "bg-rose-50 border-rose-200"
                        : "bg-emerald-50/50 border-emerald-100"
                    }`}>
                      <span className="text-purple-900/60 block text-[11px] font-semibold">Varroa Mite Scan:</span>
                      <p className={`font-bold mt-1 text-xs ${
                        imageReport.detectionResults?.varroaMiteInfestation.includes("CRITICAL")
                          ? "text-rose-800"
                          : "text-emerald-800"
                      }`}>
                        {imageReport.detectionResults?.varroaMiteInfestation ?? "None Detected (<0.5%)"}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                      <span className="text-blue-900/60 block text-[11px] font-semibold">Queen Brood Pattern:</span>
                      <p className="font-bold text-blue-900 mt-1 text-xs">
                        {imageReport.detectionResults?.queenStatus ?? "Active Queen (Compact Pattern)"}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-purple-900/80 font-medium bg-purple-50/60 p-3 rounded-xl border border-purple-100">
                    💡 <b>Computer Vision Advisory:</b> {imageReport.advisory}
                  </p>

                  {imageReport.actionSteps && imageReport.actionSteps.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                      <span className="text-[11px] font-bold text-amber-950 block">
                        📋 Recommended Agronomy Action Items:
                      </span>
                      <ul className="text-xs text-amber-900 list-disc list-inside space-y-0.5">
                        {imageReport.actionSteps.map((step: string, idx: number) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white/70 border border-purple-200/60 text-center text-xs text-purple-900/70 font-medium">
                  Click <b>&quot;Run Frame Diagnosis Scan&quot;</b> or upload any honeycomb image to perform deep neural network comb feature screening.
                </div>
              )}
            </div>
          )}

          {/* ─── SPECIAL: FSSAI Lab Report Screener (C4 Sugar Adulteration Detection) ─ */}
          {(activeTab === "overview" || activeTab === "lab_screener") && (
            <div className="bg-gradient-to-br from-emerald-500/10 via-white to-amber-500/5 p-6 rounded-3xl border border-emerald-200/90 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg">
                      🛡️
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-emerald-950">
                        FSSAI Lab Certificate AI Screener & C4 Purity Verifier
                      </h3>
                      <span className="badge bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                        GEMINI MULTIMODAL DOCUMENT OCR
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-900/70 mt-1.5 font-medium">
                    Automated verification of Carbon-13 EA-IRMS isotopic C4 sugar test, moisture limit & HMF before blockchain minting
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={reportType}
                    onChange={(e) => {
                      setReportType(e.target.value as any);
                      setReportResult(null);
                    }}
                    className="text-xs font-bold text-emerald-950 bg-white px-3 py-2 rounded-xl border border-emerald-200 shadow-xs focus:outline-none cursor-pointer"
                  >
                    <option value="pure_raw_honey">Sample Certificate: 100% Pure Raw Honey (Passed)</option>
                    <option value="adulterated_c4_syrup">Sample Certificate: Adulterated C4 Corn Syrup (Failed)</option>
                  </select>

                  <button
                    onClick={() => runReportScreener()}
                    disabled={scanningReport}
                    className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white py-2 px-4 text-xs font-bold rounded-2xl shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {scanningReport ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>Verifying Report...</span>
                      </>
                    ) : (
                      <>
                        <span>🔬</span>
                        <span>Analyze Lab Certificate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Lab Report Result Breakdown */}
              {reportResult ? (
                <div className="p-5 rounded-2xl bg-white border border-emerald-200/90 space-y-4 page-enter shadow-xs">
                  <div className="flex flex-wrap items-center justify-between pb-3 border-b border-emerald-100 text-xs gap-2">
                    <div>
                      <span className="font-extrabold text-emerald-950 text-sm block">
                        Certificate: {reportResult.labCertificateNo}
                      </span>
                      <span className="text-[11px] text-gray-500">{reportResult.accreditedLab}</span>
                    </div>

                    <span
                      className={`badge font-extrabold text-xs px-3 py-1 ${
                        reportResult.fssaiCompliance === "COMPLIANT_PASS"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-rose-100 text-rose-800 border-rose-300 animate-pulse"
                      }`}
                    >
                      {reportResult.fssaiCompliance === "COMPLIANT_PASS"
                        ? "✓ 100% FSSAI COMPLIANT (CLEARED)"
                        : "🚨 ADULTERATED BATCH (REJECTED)"}
                    </span>
                  </div>

                  {/* 5 Parameters Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-emerald-100 text-[10px] text-emerald-900/60 uppercase font-black">
                          <th className="py-2">Test Parameter</th>
                          <th className="py-2">Measured Value</th>
                          <th className="py-2">FSSAI Standard</th>
                          <th className="py-2">Testing Method</th>
                          <th className="py-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                        {reportResult.parameters.map((p: any, i: number) => (
                          <tr key={i} className="hover:bg-emerald-50/40 transition-colors">
                            <td className="py-2 font-bold text-gray-800">{p.name}</td>
                            <td className="py-2 font-mono font-black">{p.measuredValue}</td>
                            <td className="py-2 text-gray-500 font-mono">{p.fssaiStandard}</td>
                            <td className="py-2 text-[11px] text-gray-400">{p.method}</td>
                            <td className="py-2 text-right">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                  p.status === "PASS"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-xs text-emerald-950 font-medium bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                    💡 <b>AI Audit Verdict:</b> {reportResult.summary}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-emerald-100 text-xs">
                    <span className="font-semibold text-gray-600">
                      Blockchain QR Minting Eligibility:
                    </span>
                    <span
                      className={`font-black font-mono ${
                        reportResult.blockchainMintEligible ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {reportResult.blockchainMintEligible
                        ? "✓ ELIGIBLE FOR SEPOLIA TESTNET MINT"
                        : "✕ BLOCKED FROM BLOCKCHAIN MINTING"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white/70 border border-emerald-200/60 text-center text-xs text-emerald-900/70 font-medium">
                  Select a certificate sample and click <b>&quot;Analyze Lab Certificate&quot;</b> to run automated FSSAI C4 isotopic purity screening.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
