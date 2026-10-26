import { CustomMacroAlert, CustomTokenUnlockAlert, AlertNotification } from '../types/cryptoRadar';

// Browser Sound Synthesizer via Web Audio API (100% reliable, no external mp3 dependencies)
class SoundManager {
  private audioCtx: AudioContext | null = null;

  private init() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playChime(type: 'macro' | 'unlock' | 'tick' | 'complete') {
    try {
      this.init();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      if (type === 'macro') {
        // High impact dual-tone alert (880Hz -> 1100Hz)
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'unlock') {
        // Token unlock warning drop tone (600Hz -> 300Hz)
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(310, now + 0.35);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'tick') {
        // Subtle clock tick
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'complete') {
        // Chord chime (C Major)
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          if (!this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.12, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.5);
        });
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }
}

export const soundManager = new SoundManager();

const MACRO_ALERTS_KEY = 'cryptoradar_macro_alerts';
const UNLOCK_ALERTS_KEY = 'cryptoradar_unlock_alerts';

export const DEFAULT_MACRO_ALERTS: CustomMacroAlert[] = [
  {
    id: 'macro-1',
    eventType: 'CPI (Lạm phát Mỹ)',
    leadTimeMinutes: 15,
    soundEnabled: true,
    notifyBrowser: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'macro-2',
    eventType: 'FOMC (Quyết định Lãi suất Fed & Họp báo Powell)',
    leadTimeMinutes: 30,
    soundEnabled: true,
    notifyBrowser: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'macro-3',
    eventType: 'Non-Farm Payrolls (Bảng lương phi nông nghiệp NFP)',
    leadTimeMinutes: 15,
    soundEnabled: true,
    notifyBrowser: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'macro-4',
    eventType: 'PPI (Chỉ số giá sản xuất)',
    leadTimeMinutes: 5,
    soundEnabled: true,
    notifyBrowser: false,
    isActive: false,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_UNLOCK_ALERTS: CustomTokenUnlockAlert[] = [
  {
    id: 'unlock-1',
    symbol: 'TIA (Celestia)',
    minUnlockPercentage: 3,
    minUsdValueMillion: 50,
    notifyDaysBefore: 3,
    soundEnabled: true,
    notifyBrowser: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'unlock-2',
    symbol: 'ARB (Arbitrum)',
    minUnlockPercentage: 2,
    minUsdValueMillion: 30,
    notifyDaysBefore: 2,
    soundEnabled: true,
    notifyBrowser: false,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'unlock-3',
    symbol: 'SUI (Sui Network)',
    minUnlockPercentage: 3,
    minUsdValueMillion: 80,
    notifyDaysBefore: 5,
    soundEnabled: true,
    notifyBrowser: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'unlock-4',
    symbol: 'XPL',
    minUnlockPercentage: 5,
    minUsdValueMillion: 100,
    notifyDaysBefore: 1,
    soundEnabled: true,
    notifyBrowser: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export function getSavedMacroAlerts(): CustomMacroAlert[] {
  try {
    const raw = localStorage.getItem(MACRO_ALERTS_KEY);
    if (!raw) return DEFAULT_MACRO_ALERTS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MACRO_ALERTS;
  }
}

export function saveMacroAlerts(alerts: CustomMacroAlert[]): void {
  try {
    localStorage.setItem(MACRO_ALERTS_KEY, JSON.stringify(alerts));
  } catch (e) {
    console.error(e);
  }
}

export function getSavedUnlockAlerts(): CustomTokenUnlockAlert[] {
  try {
    const raw = localStorage.getItem(UNLOCK_ALERTS_KEY);
    if (!raw) return DEFAULT_UNLOCK_ALERTS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_UNLOCK_ALERTS;
  }
}

export function saveUnlockAlerts(alerts: CustomTokenUnlockAlert[]): void {
  try {
    localStorage.setItem(UNLOCK_ALERTS_KEY, JSON.stringify(alerts));
  } catch (e) {
    console.error(e);
  }
}

export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

export function dispatchSystemNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
      });
    } catch {
      // ignore
    }
  }
}
