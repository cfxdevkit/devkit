import type React from 'react'
import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs'
import { Playground } from './components/Playground'

export function useMDXComponents(components?: Record<string, React.ComponentType<any>>): Record<string, any> {
  const themeComponents = getThemeComponents()
  return {
    ...themeComponents,
    Playground,
    ...components,
  }
}
