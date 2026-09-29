import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';

type TabBarIconProps = {
  name: SymbolViewProps['name'];
  color: ColorValue;
  size?: number;
};

/** Иконка вкладки: SF Symbols на iPhone, Material Symbols на Android */
export function TabBarIcon({ name, color, size = 26 }: TabBarIconProps) {
  return <SymbolView name={name} tintColor={color} size={size} />;
}
