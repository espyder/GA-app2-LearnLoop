import { View } from 'react-native';

import { palette } from '../constants/theme';

export default function ProgressBar({ value, color = palette.primary }: { value: number; color?: string }) {
  return (
    <View style={{ height: 7, borderRadius: 4, backgroundColor: '#E6ECF4', overflow: 'hidden' }}>
      <View style={{ width: `${Math.min(100, Math.max(0, value))}%`, height: '100%', backgroundColor: color, borderRadius: 4 }} />
    </View>
  );
}