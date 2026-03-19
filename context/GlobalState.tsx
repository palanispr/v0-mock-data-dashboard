'use client'

import React, { createContext, useContext, useState } from 'react'

interface RemainingSpace {
  extractions_used: number
  uploads_limit: number
}

interface GlobalStateContextType {
  remining_space: RemainingSpace | null
  setRemainingSpace: (space: RemainingSpace | null) => void
}

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined)

export function GlobalStateProvider({ children }: { children: React.ReactNode }) {
  const [remining_space, setRemainingSpace] = useState<RemainingSpace | null>({
    extractions_used: 0,
    uploads_limit: 500,
  })

  return (
    <GlobalStateContext.Provider value={{ remining_space, setRemainingSpace }}>
      {children}
    </GlobalStateContext.Provider>
  )
}

export function useGlobalState() {
  const context = useContext(GlobalStateContext)
  if (!context) {
    throw new Error('useGlobalState must be used within GlobalStateProvider')
  }
  return context
}
