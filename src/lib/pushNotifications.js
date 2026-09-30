import { useState, useEffect, useCallback } from 'react';

const INSTANCE_ID = 'bec7601a-120f-4bd2-8b4d-a93a97001d9b';

/**
 * Get configured user timezone or fallback to device/Jakarta
 */
export function getUserTimezone(currentUser) {
  const uid = currentUser?.id;
  const tzKey = uid ? `NutriWise_tz_${uid}` : 'NutriWise_tz';
  const meta = currentUser?.user_metadata || {};
  return meta.NutriWise_tz || localStorage.getItem(tzKey) || 'Asia/Jakarta';
}

/**
 * Calculate local time info in the user's specific timezone
 */
export function getLocalTimeInTimezone(tzString) {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tzString || 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(now);
    const obj = {};
    parts.forEach(p => obj[p.type] = p.value);
    
    const dateStr = `${obj.year}-${obj.month}-${obj.day}`;
    const hour = parseInt(obj.hour, 10);
    const minute = parseInt(obj.minute, 10);
    
    return { dateStr, hour, minute };
  } catch (e) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    return { dateStr, hour: now.getHours(), minute: now.getMinutes() };
  }
}

/**
 * Check if the user's daily challenge tasks for today are incomplete
 */
export function isDailyChallengeIncomplete(currentUser) {
  const uid = currentUser?.id;
  const tz = getUserTimezone(currentUser);
  const { dateStr } = getLocalTimeInTimezone(tz);

  const historyKey = uid ? `NutriWise_history_${uid}` : 'NutriWise_history';
  const targetsKey = uid ? `NutriWise_targets_${uid}` : 'NutriWise_targets';

  try {
    const historyStr = localStorage.getItem(historyKey);
    const targetsStr = localStorage.getItem(targetsKey);
    
    const history = historyStr ? JSON.parse(historyStr) : {};
    const targets = targetsStr ? JSON.parse(targetsStr) : [];

    const todayRecord = history[dateStr] || {};

    if (!targets || targets.length === 0) return true;

    for (const target of targets) {
      const val = todayRecord[target.id] || 0;
      const goal = target.targetVal || target.target || 1;
      if (val < goal) {
        return true;
      }
    }
    
    return false;
  } catch (e) {
    return true;
  }
}

/**
 * Send native push notification prompt to user
 */
export async function sendChallengeNotification(title, body) {
  const notifTitle = title || 'Pengingat Tantangan Harian NutriWise 🥗';
  const notifBody = body || 'Sudah pukul 20:00! Anda belum menyelesaikan tantangan harian hari ini. Yuk selesaikan sebelum hari berakhir!';

  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg && reg.showNotification) {
      reg.showNotification(notifTitle, {
        body: notifBody,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'daily-challenge-2000',
        renotify: true,
        data: { url: window.location.origin }
      });
      return;
    }
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(notifTitle, {
      body: notifBody,
      icon: '/logo.png'
    });
  }
}

/**
 * Custom hook for Pusher Beams push notifications & 20:00 local timezone scheduler.
 * Exposes turn on / turn off toggles, registration state, and timezone reminder.
 */
export function usePushNotifications(currentUser) {
  const [beamsClient, setBeamsClient] = useState(null);
  const [permissionState, setPermissionState] = useState('default');
  const [isRegistered, setIsRegistered] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [error, setError] = useState(null);

  const getEnabledKey = (user) => user?.id ? `NutriWise_notif_enabled_${user.id}` : 'NutriWise_notif_enabled';

  // Read initial enabled state for current user
  const [isEnabled, setIsEnabled] = useState(() => {
    if (!currentUser?.id) return false;
    return localStorage.getItem(`NutriWise_notif_enabled_${currentUser.id}`) === 'true';
  });

  // Keep isEnabled in sync when currentUser changes
  useEffect(() => {
    if (currentUser?.id) {
      const saved = localStorage.getItem(`NutriWise_notif_enabled_${currentUser.id}`);
      setIsEnabled(saved === 'true');
    } else {
      setIsEnabled(false);
      setIsRegistered(false);
    }
  }, [currentUser]);

  // Load SDK from CDN
  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermissionState('unsupported');
      return;
    }

    setPermissionState(Notification.permission);

    if (window.PusherPushNotifications) {
      setSdkLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.pusher.com/beams/2.1.0/push-notifications-cdn.js';
    script.async = true;
    script.onload = () => setSdkLoaded(true);
    script.onerror = () => setError('Gagal memuat SDK notifikasi.');
    document.head.appendChild(script);
  }, []);

  // Init Beams Client
  useEffect(() => {
    if (!sdkLoaded || !window.PusherPushNotifications || beamsClient) return;

    try {
      const client = new window.PusherPushNotifications.Client({
        instanceId: INSTANCE_ID,
      });
      setBeamsClient(client);
    } catch (err) {
      console.error('Pusher Beams init error:', err);
      setError('Gagal menginisialisasi notifikasi.');
    }
  }, [sdkLoaded, beamsClient]);

  // Helper: start Pusher Beams safely, automatically recovering from 401 stale token errors
  const startBeamsSafely = useCallback(async (client) => {
    try {
      await client.start();
    } catch (err) {
      console.warn('Initial Beams start error (attempting auto-recovery via clearAllState):', err);
      try {
        if (typeof client.clearAllState === 'function') {
          await client.clearAllState();
        } else if (typeof client.stop === 'function') {
          await client.stop();
        }
      } catch (clearErr) {
        console.warn('Error clearing Beams state:', clearErr);
      }
      // Re-try starting fresh with cleared registration state
      await client.start();
    }
  }, []);

  // Helper: add interests with retry (start() can resolve before internal registration completes)
  const addInterestsWithRetry = useCallback(async (client, userId, retries = 3) => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        await client.addDeviceInterest('general');
        await client.addDeviceInterest('hello');
        if (userId) {
          await client.addDeviceInterest(`user-${userId}`);
        }
        return; // success
      } catch (err) {
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 300 * (attempt + 1)));
        } else {
          throw err;
        }
      }
    }
  }, []);

  // Turn ON notifications
  const enableNotifications = useCallback(async () => {
    if (!currentUser?.id) return;
    setError(null);

    const enabledKey = getEnabledKey(currentUser);
    const answeredKey = `NutriWise_notif_prompt_answered_${currentUser.id}`;
    localStorage.setItem(enabledKey, 'true');
    localStorage.setItem(answeredKey, 'true');
    setIsEnabled(true);

    if (!('Notification' in window)) {
      setPermissionState('unsupported');
      return;
    }

    try {
      if (Notification.permission !== 'granted') {
        const perm = await Notification.requestPermission();
        setPermissionState(perm);
        if (perm !== 'granted') {
          return;
        }
      } else {
        setPermissionState('granted');
      }

      if (beamsClient) {
        await startBeamsSafely(beamsClient);
        await addInterestsWithRetry(beamsClient, currentUser.id);
        setIsRegistered(true);
        console.log('Pusher Beams: Successfully registered & enabled!');
      }
    } catch (err) {
      console.error('Pusher Beams enable error:', err);
      setError('Gagal mengaktifkan notifikasi: ' + err.message);
    }
  }, [beamsClient, currentUser, startBeamsSafely, addInterestsWithRetry]);

  // Turn OFF notifications
  const disableNotifications = useCallback(async () => {
    if (!currentUser?.id) return;
    const enabledKey = getEnabledKey(currentUser);
    const answeredKey = `NutriWise_notif_prompt_answered_${currentUser.id}`;
    localStorage.setItem(enabledKey, 'false');
    localStorage.setItem(answeredKey, 'true');
    setIsEnabled(false);
    setIsRegistered(false);

    if (beamsClient) {
      try {
        await beamsClient.stop();
        console.log('Pusher Beams: Notifications stopped & turned off.');
      } catch (err) {
        console.error('Pusher Beams stop error:', err);
        try {
          await beamsClient.clearAllState();
        } catch (cErr) {
          // ignore
        }
      }
    }
  }, [beamsClient, currentUser]);

  // Toggle notifications
  const toggleNotifications = useCallback(async () => {
    if (isEnabled) {
      await disableNotifications();
    } else {
      await enableNotifications();
    }
  }, [isEnabled, enableNotifications, disableNotifications]);

  // Auto-connect Beams if user is logged in, has enabled notifications, and granted permission
  useEffect(() => {
    if (!currentUser?.id || !beamsClient || !isEnabled) return;

    if (Notification.permission === 'granted' && !isRegistered) {
      const autoConnect = async () => {
        try {
          await startBeamsSafely(beamsClient);
          await addInterestsWithRetry(beamsClient, currentUser.id);
          setIsRegistered(true);
          setPermissionState('granted');
        } catch (err) {
          console.error('Beams auto-start error:', err);
        }
      };
      autoConnect();
    }
  }, [currentUser, beamsClient, isEnabled, isRegistered, startBeamsSafely, addInterestsWithRetry]);

  // ----------------------------------------------------
  // AUTOMATIC 20:00 LOCAL TIMEZONE REMINDER SCHEDULER
  // (Runs ONLY for logged in user when notification is enabled)
  // ----------------------------------------------------
  useEffect(() => {
    if (!currentUser || !isEnabled || permissionState !== 'granted') return;

    const checkTimezoneReminder = () => {
      const tz = getUserTimezone(currentUser);
      const { dateStr, hour } = getLocalTimeInTimezone(tz);
      const uid = currentUser?.id;
      const sentKey = `NutriWise_notif_sent_2000_${dateStr}_${uid}`;

      // If it is 20:00 (8 PM) in user's timezone
      if (hour === 20) {
        const alreadySent = localStorage.getItem(sentKey);
        if (!alreadySent) {
          const incomplete = isDailyChallengeIncomplete(currentUser);
          if (incomplete) {
            sendChallengeNotification(
              'Pengingat Tantangan Harian NutriWise 🥗',
              'Sudah jam 20:00! Anda belum menyelesaikan tantangan harian hari ini. Yuk tuntaskan sekarang untuk menjaga konsistensi kesehatanmu!'
            );
            localStorage.setItem(sentKey, 'true');
          }
        }
      }
    };

    checkTimezoneReminder();
    const interval = setInterval(checkTimezoneReminder, 30000);
    return () => clearInterval(interval);
  }, [currentUser, isEnabled, permissionState]);

  // Helper function to test trigger manually
  const triggerTest2000Reminder = () => {
    const tz = getUserTimezone(currentUser);
    const incomplete = isDailyChallengeIncomplete(currentUser);
    const statusText = incomplete ? 'belum selesai' : 'sudah selesai';

    sendChallengeNotification(
      'Pengingat 20:00 (Uji Coba NutriWise) 🥗',
      `[Zona Waktu: ${tz}] Status tantangan harian Anda hari ini: ${statusText}. Yuk jaga gaya hidup sehatmu!`
    );
  };

  return {
    isEnabled,
    permissionState,
    isRegistered,
    error,
    enableNotifications,
    disableNotifications,
    toggleNotifications,
    triggerTest2000Reminder,
    isSupported: permissionState !== 'unsupported',
  };
}
