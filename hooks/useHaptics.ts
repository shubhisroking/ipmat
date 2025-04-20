import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/store/settingsStore';

export function useHaptics() {
  const { hapticsEnabled } = useSettingsStore();

  const impact = async (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (hapticsEnabled) {
      await Haptics.impactAsync(style);
    }
  };

  const notification = async (type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
    if (hapticsEnabled) {
      await Haptics.notificationAsync(type);
    }
  };

  const selection = async () => {
    if (hapticsEnabled) {
      await Haptics.selectionAsync();
    }
  };

  return {
    impact,
    notification,
    selection,
  };
} 