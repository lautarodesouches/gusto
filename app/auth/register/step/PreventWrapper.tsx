'use client'

import { usePreventCompletedUsers } from '@/hooks/usePreventCompletedUsers'

export function PreventWrapper() {
    usePreventCompletedUsers()
    return null
}
