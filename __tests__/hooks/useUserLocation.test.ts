import { renderHook, act } from '@testing-library/react'
import { useUserLocation } from '@/hooks/useUserLocation'

const DEFAULT_LOCATION = {
    lat: -34.603722,
    lng: -58.381592,
}

describe('useUserLocation', () => {
    beforeEach(() => {
        jest.useFakeTimers()
        jest.clearAllMocks()

        if (global.navigator.geolocation) {
            (global.navigator.geolocation.getCurrentPosition as jest.Mock).mockReset()
                ; (global.navigator.geolocation.watchPosition as jest.Mock).mockReset()
                ; (global.navigator.geolocation.clearWatch as jest.Mock).mockReset()
        }
        jest.spyOn(console, 'warn').mockImplementation(() => { })
    })

    afterEach(() => {
        jest.useRealTimers()
        jest.restoreAllMocks()
    })

    it('should return user location on success', () => {
        const mockPosition = {
            coords: {
                latitude: 40.7128,
                longitude: -74.0060,
            },
        }

            ; (global.navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementation((success: any) => {
                success(mockPosition)
            })

        const { result } = renderHook(() => useUserLocation())

        expect(result.current.coords).toEqual({
            lat: 40.7128,
            lng: -74.0060,
        })
        expect(result.current.loading).toBe(false)
    })

    it('should return default location on error', () => {
        const mockError = {
            code: 1,
            message: 'User denied Geolocation',
        }

            ; (global.navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementation((_: any, error: any) => {
                error(mockError)
            })

        const { result } = renderHook(() => useUserLocation())

        expect(result.current.coords).toEqual(DEFAULT_LOCATION)
        expect(result.current.loading).toBe(false)
    })

    it('should return default location on timeout', () => {
        ; (global.navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementation(() => {
            // Never call callbacks - simulate timeout
        })

        const { result } = renderHook(() => useUserLocation())

        expect(result.current.loading).toBe(true)
        expect(result.current.coords).toBeNull()

        act(() => {
            jest.advanceTimersByTime(10000)
        })

        expect(result.current.coords).toEqual(DEFAULT_LOCATION)
        expect(result.current.loading).toBe(false)
    })

    it('should use correct geolocation options', () => {
        renderHook(() => useUserLocation())

        expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalledWith(
            expect.any(Function),
            expect.any(Function),
            {
                enableHighAccuracy: false,
                timeout: 8000,
                maximumAge: 300000,
            }
        )
    })
})
