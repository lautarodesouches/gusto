// Global fetch mock
export const mockFetch = (response: unknown, ok = true, status = 200) => {
    global.fetch = jest.fn().mockResolvedValue({
        ok,
        status,
        json: async () => response,
        text: async () => JSON.stringify(response),
    })
}

// Mock fetch with error
export const mockFetchError = (error: Error) => {
    global.fetch = jest.fn().mockRejectedValue(error)
}

// Mock fetch with custom implementation
export const mockFetchImplementation = (implementation: jest.Mock) => {
    global.fetch = implementation
}

// Reset fetch mock
export const resetFetchMock = () => {
    if (global.fetch && jest.isMockFunction(global.fetch)) {
        (global.fetch as jest.Mock).mockReset()
    }
}
