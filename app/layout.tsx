import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

import PaymentVerification from '@/components/PaymentVerification'
import RegistrationCheck from '@/components/RegistrationCheck'
import RoleProtection from '@/app/layouts/RoleProtection'

import { ToastProvider } from '@/context/ToastContext'
import { SignalRProvider } from '@/context/SignalRContext'


const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ['latin'],
    variable: '--font-plus',
})

const gliker = localFont({
    src: [
        {
            path: '../public/fonts/Gliker/Gliker-Bold.woff2',
            weight: '700',
            style: 'normal',
        },
    ],
})

export const metadata: Metadata = {
    title: 'Gusto',
    description: 'Encontrá tu próximo lugar favorito para comer. Votá con amigos, descubrí restaurantes y disfrutá de la mejor gastronomía.',
    icons: {
        icon: [
            {
                url: '/images/brand/gusto-small.svg',
                media: '(prefers-color-scheme: light)',
            },
            {
                url: '/images/brand/gusto-small-negative.svg',
                media: '(prefers-color-scheme: dark)',
            },
        ],
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="es" data-scroll-behavior="smooth">
            <body
                className={`${plusJakartaSans.className} ${gliker.className}`}
            >
                <ToastProvider>
                    <AuthProvider>
                        <SignalRProvider>
                            <RoleProtection>
                                <PaymentVerification />
                                <RegistrationCheck />
                                {children}
                            </RoleProtection>
                        </SignalRProvider>
                    </AuthProvider>
                </ToastProvider>
            </body>
        </html>
    )
}
