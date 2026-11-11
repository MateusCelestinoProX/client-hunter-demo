/**
 * Ponte com o Android App Nativo Client Hunter PRO
 * Fornece métodos seguros de feedback tátil, cópia garantida via Android ClipboardManager,
 * toasts nativos do sistema operacional e compartilhamento direto via Share Sheet.
 */

export const isAndroidApp = (): boolean => {
  return typeof window !== 'undefined' && Boolean((window as any).AndroidApp);
};

export const nativeVibrate = (ms: number = 30): void => {
  if (typeof window !== 'undefined' && (window as any).AndroidApp?.vibrate) {
    try {
      (window as any).AndroidApp.vibrate(ms);
    } catch {}
  } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(ms);
    } catch {}
  }
};

export const nativeToast = (msg: string): void => {
  if (typeof window !== 'undefined' && (window as any).AndroidApp?.toast) {
    try {
      (window as any).AndroidApp.toast(msg);
    } catch {}
  }
};

export const nativeCopy = async (text: string, toastMsg?: string): Promise<boolean> => {
  nativeVibrate(25);
  if (typeof window !== 'undefined' && (window as any).AndroidApp?.copyToClipboard) {
    try {
      (window as any).AndroidApp.copyToClipboard(text);
      if (toastMsg) {
        (window as any).AndroidApp.toast?.(toastMsg);
      }
      return true;
    } catch {}
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
};

export const nativeShare = (title: string, text: string, url?: string): void => {
  nativeVibrate(30);
  if (typeof window !== 'undefined' && (window as any).AndroidApp?.share) {
    try {
      (window as any).AndroidApp.share(title, text, url || '');
      return;
    } catch {}
  }
  if (typeof navigator !== 'undefined' && navigator.share) {
    navigator.share({ title, text, url }).catch(() => {});
  }
};
