import { SocialData } from '@/types'
import styles from './styles.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import FriendSearch from '@/components/Social/FriendSearch'
import GroupCreate from '@/components/Social/GroupCreate'
import FriendCard from '@/components/Social/FriendCard'
import GroupCard from '@/components/Social/GroupCard'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface Props {
    isVisible: boolean
    socialData: SocialData
    activePanel: 'searchFriend' | 'newGroup' | null
    togglePanel: (panel: 'searchFriend' | 'newGroup' | null) => void
    isExpanded?: boolean
    onToggleExpand?: () => void
}

const FriendButton = ({ handleClick }: { handleClick: () => void }) => (
    <button className={styles.social__button} onClick={handleClick}>
        <FontAwesomeIcon icon={faPlus} />
        Añadir amigo
    </button>
)

const GroupButton = ({ handleClick }: { handleClick: () => void }) => (
    <button className={styles.social__button} onClick={handleClick}>
        <FontAwesomeIcon icon={faPlus} />
        Crear grupo
    </button>
)

export default function SocialView({
    isVisible,
    socialData,
    activePanel,
    togglePanel,
    isExpanded = true,
    onToggleExpand,
}: Props) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleClose = () => {
        togglePanel(null)
    }

    return (
        <>
            {/* Modales para mobile - en desktop se renderizan en el componente padre */}
            {mounted &&
                typeof window !== 'undefined' &&
                activePanel &&
                createPortal(
                    <div
                        className={styles.modal__backdrop}
                        onClick={handleClose}
                    >
                        <div
                            className={styles.modal__content}
                            onClick={e => e.stopPropagation()}
                        >
                            {activePanel === 'searchFriend' && (
                                <FriendSearch onClose={handleClose} />
                            )}
                            {activePanel === 'newGroup' && (
                                <GroupCreate handleCancel={handleClose} />
                            )}
                        </div>
                    </div>,
                    document.body
                )}
            <section
                className={`${styles.social} ${isVisible ? styles.show : ''} ${
                    isExpanded
                        ? styles.social_expanded
                        : styles.social_collapsed
                }`}
            >
                {/* Logo que cambia según el estado */}
                <div className={styles.social__logo}>
                    {isExpanded ? (
                        <Image
                            src="/images/brand/gusto-full-negative.svg"
                            alt="Logo Gusto!"
                            width={150}
                            height={60}
                            className={styles.social__logo_full}
                            priority
                        />
                    ) : (
                        <Image
                            src="/images/brand/gusto-small-negative.svg"
                            alt="G!"
                            width={40}
                            height={40}
                            className={styles.social__logo_small}
                            priority
                        />
                    )}
                </div>

                {/* Botón "Contraer Pestaña" cuando está expandido */}
                {isExpanded && onToggleExpand && (
                    <button
                        className={styles.social__contract_btn}
                        onClick={onToggleExpand}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect width="18" height="18" x="3" y="3" rx="2" />
                            <path d="M15 3v18" />
                            <path d="m10 15-3-3 3-3" />
                        </svg>
                        <span>Contraer Pestaña</span>
                    </button>
                )}

                {/* Vista expandida */}
                {isExpanded && (
                    <div className={styles.social__content}>
                        <div className={styles.social__div}>
                            <h3 className={styles.social__description}>
                                Amigos
                            </h3>
                            <hr className={styles.social__line} />
                            <ul className={styles.social__list}>
                                {socialData.friends.map(f => (
                                    <FriendCard friend={f} key={f.id} />
                                ))}
                            </ul>
                            <FriendButton
                                handleClick={() => togglePanel('searchFriend')}
                            />
                        </div>
                        <div className={styles.social__div}>
                            <h3 className={styles.social__description}>
                                Grupos
                            </h3>
                            <hr className={styles.social__line} />
                            <ul className={styles.social__list}>
                                {socialData.groups.map(g => (
                                    <GroupCard key={g.id} group={g} />
                                ))}
                                <GroupButton
                                    handleClick={() => togglePanel('newGroup')}
                                />
                            </ul>
                        </div>
                    </div>
                )}

                {/* Vista colapsada - solo iconos */}
                {!isExpanded && onToggleExpand && (
                    <div className={styles.social__collapsed_content}>
                        {/* Botón expandir */}
                        <button
                            className={styles.social__expand_btn}
                            onClick={onToggleExpand}
                            title="Expandir panel"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect
                                    width="18"
                                    height="18"
                                    x="3"
                                    y="3"
                                    rx="2"
                                />
                                <path d="M9 3v18" />
                                <path d="m14 9 3 3-3 3" />
                            </svg>
                        </button>

                        {/* Amigos colapsados */}
                        <div className={styles.collapsed__section}>
                            {socialData.friends.map(f => (
                                <FriendCard
                                    key={f.id}
                                    friend={f}
                                    showOnlyImage
                                />
                            ))}
                            <button
                                className={styles.collapsed__add}
                                onClick={() => togglePanel('searchFriend')}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>

                        {/* Grupos colapsados */}
                        <div className={styles.collapsed__section}>
                            {socialData.groups.map(g => (
                                <GroupCard key={g.id} group={g} showOnlyImage />
                            ))}
                            <button
                                className={styles.collapsed__add}
                                onClick={() => togglePanel('newGroup')}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </>
    )
}
