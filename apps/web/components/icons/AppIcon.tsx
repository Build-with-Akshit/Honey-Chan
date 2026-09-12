"use client";

/**
 * HoneyChain v2 icon registry (content.md §1).
 * One glyph = one meaning, everywhere, forever.
 * Components consume <AppIcon name="key" /> — never inline a Lucide
 * icon for a meaning listed here. Adding a meaning: add it to
 * content.md §1 first, then here.
 */

import {
  House,
  Hexagon,
  ScanLine,
  RadioTower,
  Brain,
  Package,
  UserRound,
  BadgeCheck,
  CircleCheck,
  X,
  TriangleAlert,
  CircleDashed,
  ArrowRightLeft,
  Download,
  ShoppingBasket,
  Lock,
  Scale,
  Thermometer,
  Droplets,
  Activity,
  BatteryLow,
  BatteryFull,
  FlaskConical,
  Factory,
  Truck,
  Store,
  Flower2,
  Volume2,
  Flashlight,
  Keyboard,
  ArrowRight,
  ArrowLeft,
  Bell,
  CircleHelp,
  LogOut,
  Languages,
  Wallet,
  RefreshCw,
  Camera,
  FolderOpen,
  type LucideIcon,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

export type IconKey =
  | "home"
  | "hives"
  | "scan"
  | "iot"
  | "ai"
  | "batches"
  | "profile"
  | "verify"
  | "check"
  | "cross"
  | "warn"
  | "pending"
  | "transfer"
  | "receive"
  | "sale"
  | "sell-done"
  | "weight"
  | "temp"
  | "humidity"
  | "activity"
  | "battery-low"
  | "battery-full"
  | "lab"
  | "factory"
  | "truck"
  | "store"
  | "flower"
  | "listen"
  | "torch"
  | "keyboard"
  | "next"
  | "back"
  | "bell"
  | "help"
  | "logout"
  | "language"
  | "wallet"
  | "refresh"
  | "camera"
  | "folder";

const ICONS: Record<IconKey, LucideIcon> = {
  home: House,
  hives: Hexagon,
  scan: ScanLine,
  iot: RadioTower,
  ai: Brain,
  batches: Package,
  profile: UserRound,
  verify: BadgeCheck,
  check: CircleCheck,
  cross: X,
  warn: TriangleAlert,
  pending: CircleDashed,
  transfer: ArrowRightLeft,
  receive: Download,
  sale: ShoppingBasket,
  "sell-done": Lock,
  weight: Scale,
  temp: Thermometer,
  humidity: Droplets,
  activity: Activity,
  "battery-low": BatteryLow,
  "battery-full": BatteryFull,
  lab: FlaskConical,
  factory: Factory,
  truck: Truck,
  store: Store,
  flower: Flower2,
  listen: Volume2,
  torch: Flashlight,
  keyboard: Keyboard,
  next: ArrowRight,
  back: ArrowLeft,
  bell: Bell,
  help: CircleHelp,
  logout: LogOut,
  language: Languages,
  wallet: Wallet,
  refresh: RefreshCw,
  camera: Camera,
  folder: FolderOpen,
};

/** Hindi/English labels from content.md §1 (for icon+label pairs). */
const LABELS: Record<IconKey, { hi: string; en: string }> = {
  home: { hi: "होम", en: "Home" },
  hives: { hi: "छत्ते", en: "Hives" },
  scan: { hi: "स्कैन", en: "Scan" },
  iot: { hi: "सेंसर", en: "Sensors" },
  ai: { hi: "सलाह", en: "Advice" },
  batches: { hi: "बैच", en: "Batches" },
  profile: { hi: "प्रोफ़ाइल", en: "Profile" },
  verify: { hi: "असली", en: "Verify" },
  check: { hi: "ठीक", en: "OK" },
  cross: { hi: "ग़लत", en: "FAIL" },
  warn: { hi: "चेतावनी", en: "Warning" },
  pending: { hi: "प्रतीक्षा", en: "Pending" },
  transfer: { hi: "भेजें", en: "Transfer" },
  receive: { hi: "स्वीकार", en: "Accept" },
  sale: { hi: "बिक्री", en: "Sale" },
  "sell-done": { hi: "बंद", en: "Locked" },
  weight: { hi: "वज़न", en: "Weight" },
  temp: { hi: "तापमान", en: "Temperature" },
  humidity: { hi: "नमी", en: "Humidity" },
  activity: { hi: "गतिविधि", en: "Activity" },
  "battery-low": { hi: "बैटरी कम", en: "Battery low" },
  "battery-full": { hi: "बैटरी", en: "Battery" },
  lab: { hi: "जाँच", en: "Lab" },
  factory: { hi: "कारखाना", en: "Factory" },
  truck: { hi: "ट्रक", en: "Transport" },
  store: { hi: "दुकान", en: "Store" },
  flower: { hi: "फूल", en: "Flower" },
  listen: { hi: "सुनें", en: "Listen" },
  torch: { hi: "टॉर्च", en: "Torch" },
  keyboard: { hi: "टाइप करें", en: "Type" },
  next: { hi: "आगे", en: "Next" },
  back: { hi: "पीछे", en: "Back" },
  bell: { hi: "सूचना", en: "Alerts" },
  help: { hi: "मदद", en: "Help" },
  logout: { hi: "बाहर", en: "Log out" },
  language: { hi: "भाषा", en: "Language" },
  wallet: { hi: "वॉलेट", en: "Wallet" },
  refresh: { hi: "फिर से", en: "Retry" },
  camera: { hi: "कैमरा", en: "Camera" },
  folder: { hi: "फ़ाइल", en: "File" },
};

export interface AppIconProps {
  name: IconKey;
  /** Render size in px (default 24, per design.md §7). */
  size?: number;
  /** Show the localized label under/next to the glyph. */
  withLabel?: boolean;
  /** Label placement when withLabel. */
  labelPosition?: "below" | "right";
  className?: string;
  /** Accessible name; defaults to the localized label. */
  ariaLabel?: string;
}

/**
 * The only icon component allowed in the app.
 * Ink-colored stroke icons (design.md §7); optional localized label.
 */
export function AppIcon({
  name,
  size = 24,
  withLabel = false,
  labelPosition = "right",
  className = "",
  ariaLabel,
}: AppIconProps) {
  const { language } = useLanguage();
  const Icon = ICONS[name];
  // Defensive: unknown key or prerender race must never crash — fall back to en, then "".
  const label = LABELS[name]?.[language] ?? LABELS[name]?.en ?? "";

  if (!Icon) return null;

  if (!withLabel) {
    return (
      <Icon
        size={size}
        strokeWidth={2}
        aria-hidden={ariaLabel ? undefined : true}
        aria-label={ariaLabel}
        className={className}
      />
    );
  }

  if (labelPosition === "below") {
    return (
      <span className={`inline-flex flex-col items-center gap-1 ${className}`}>
        <Icon size={size} strokeWidth={2} aria-hidden />
        <span className="text-[14px] leading-none">{label}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Icon size={size} strokeWidth={2} aria-hidden />
      <span className="text-[15px] font-medium">{label}</span>
    </span>
  );
}

/** Localized label for an icon key (for aria-labels, tab bars, etc.). */
export function iconLabel(name: IconKey, language: "hi" | "en"): string {
  return LABELS[name][language];
}

export default AppIcon;
