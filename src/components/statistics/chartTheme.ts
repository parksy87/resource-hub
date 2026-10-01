import { useThemeStore, type Theme } from '../../stores/themeStore'

export interface ChartPalette {
  grid: string
  text: string
  surface: string
  border: string
  series: string[]
}

const palettes: Record<Theme, ChartPalette> = {
  light: {
    grid: '#e2e8f0',
    text: '#64748b',
    surface: '#ffffff',
    border: '#e2e8f0',
    series: ['#256fe9', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#93ccfd', '#475569'],
  },
  dark: {
    grid: '#2b3647',
    text: '#8f9caf',
    surface: '#1b2330',
    border: '#2b3647',
    series: ['#4f8eec', '#60a5fa', '#34d399', '#fbbf24', '#fb7185', '#3770b9', '#bac4d2'],
  },
}

export function useChartPalette() {
  const theme = useThemeStore((state) => state.theme)
  return palettes[theme]
}
