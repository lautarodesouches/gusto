import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/context/AuthContext'

// Mock AuthContext for testing
interface MockAuthContextProps {
  user?: any
  token?: string | null
  loading?: boolean
  isPremium?: boolean
}

export function createMockAuthContext({
  user = null,
  token = null,
  loading = false,
  isPremium = false,
}: MockAuthContextProps = {}) {
  return {
    user,
    token,
    loading,
    isPremium,
    logout: jest.fn(),
    refreshPremiumStatus: jest.fn(),
  }
}

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authContext?: MockAuthContextProps
}

export function renderWithProviders(
  ui: ReactElement,
  { authContext, ...renderOptions }: CustomRenderOptions = {}
) {
  // Mock the AuthContext
  const mockAuthValue = createMockAuthContext(authContext)
  
  jest.spyOn(require('@/context/AuthContext'), 'useAuth').mockReturnValue(mockAuthValue)

  return render(ui, renderOptions)
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { renderWithProviders as render }
