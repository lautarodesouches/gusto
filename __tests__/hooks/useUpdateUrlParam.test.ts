import { renderHook, act } from '@testing-library/react'
import { useUpdateUrlParam } from '@/hooks/useUpdateUrlParam'

// Mock Next.js navigation
const mockReplace = jest.fn()
const mockSearchParams = new URLSearchParams()

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: mockReplace,
    }),
    useSearchParams: () => mockSearchParams,
}))

describe('useUpdateUrlParam', () => {
    beforeEach(() => {
        mockReplace.mockClear()
        // Clear all search params
        Array.from(mockSearchParams.keys()).forEach(key => {
            mockSearchParams.delete(key)
        })
    })

    it('should add a new parameter', () => {
        const { result } = renderHook(() => useUpdateUrlParam())

        act(() => {
            result.current('test', 'value')
        })

        expect(mockReplace).toHaveBeenCalledWith('?test=value', { scroll: false })
    })

    it('should update an existing parameter', () => {
        mockSearchParams.set('existing', 'old')

        const { result } = renderHook(() => useUpdateUrlParam())

        act(() => {
            result.current('existing', 'new')
        })

        expect(mockReplace).toHaveBeenCalledWith('?existing=new', { scroll: false })
    })

    it('should remove a parameter when value is null', () => {
        mockSearchParams.set('keep', 'value')
        mockSearchParams.set('remove', 'me')

        const { result } = renderHook(() => useUpdateUrlParam())

        act(() => {
            result.current('remove', null)
        })

        expect(mockReplace).toHaveBeenCalledWith('?keep=value', { scroll: false })
    })

    it('should handle multiple parameters', () => {
        mockSearchParams.set('param1', 'value1')

        const { result } = renderHook(() => useUpdateUrlParam())

        act(() => {
            result.current('param2', 'value2')
        })

        const callArg = mockReplace.mock.calls[0][0]
        expect(callArg).toContain('param1=value1')
        expect(callArg).toContain('param2=value2')
    })

    it('should encode special characters', () => {
        const { result } = renderHook(() => useUpdateUrlParam())

        act(() => {
            result.current('query', 'hello world')
        })

        expect(mockReplace).toHaveBeenCalledWith('?query=hello+world', { scroll: false })
    })

    it('should handle empty string as null', () => {
        const { result } = renderHook(() => useUpdateUrlParam())

        act(() => {
            result.current('empty', '')
        })

        // Empty string is falsy, so it should delete the param
        expect(mockReplace).toHaveBeenCalledWith('?', { scroll: false })
    })
})
