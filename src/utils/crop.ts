// src/utils/crop.ts
import { LucideIcon, Sprout, Flame, Circle, Leaf, Citrus } from 'lucide-react-native';

export const getCropIcon = (cropName: string): LucideIcon => {
  const mapping: Record<string, LucideIcon> = {
    '고추': Flame, 
    '무': Circle,
    '콩': Sprout,
    '들깨': Leaf,
    '감자': Circle,
    '애호박': Citrus,
  };
  
  return mapping[cropName] || Sprout;
};