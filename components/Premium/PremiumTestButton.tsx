'use client'

import { useState } from 'react'
import { UpgradePremiumModal } from '@/components'

export default function PremiumTestButton() {
    const [showModal, setShowModal] = useState(false)

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:from-purple-700 hover:to-pink-700 z-40"
            >
                🌟 Ver Modal Premium
            </button>

            <UpgradePremiumModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                trigger="general"
            />
        </>
    )
}