import type React from 'react'
import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs'
import { Mermaid } from './components/Mermaid'
import { Playground } from './components/Playground'

export function useMDXComponents(components?: Record<string, React.ComponentType<any>>): Record<string, any> {
  const themeComponents = getThemeComponents()
  return {
    ...themeComponents,
    Mermaid,
    Playground,
    ...components,
  }
}
