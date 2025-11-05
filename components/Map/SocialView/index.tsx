import { SocialData } from '@/types'
import styles from './styles.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faPlus,
} from '@fortawesome/free-solid-svg-icons'
import FriendSearch from '@/components/Social/FriendSearch'
import GroupCreate from '@/components/Social/GroupCreate'
import FriendCard from '@/components/Social/FriendCard'
import GroupCard from '@/components/Social/GroupCard'

interface Props {
    isVisible: boolean
    socialData: SocialData
    activePanel: 'searchFriend' | 'newGroup' | null
    togglePanel: (panel: 'searchFriend' | 'newGroup' | null) => void
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
}: Props) {
    return (
        <>
            {activePanel === 'searchFriend' && <FriendSearch />}
            {activePanel === 'newGroup' && (
                <GroupCreate handleCancel={() => togglePanel(null)} />
            )}
            <section
                className={`${styles.social} ${isVisible ? styles.show : ''}`}
            >
                <header className={styles.social__header}>
                    <h2 className={styles.social__title}>Social</h2>
                </header>
                <div className={styles.social__content}>
                    <div className={styles.social__buttons}>
                        <FriendButton
                            handleClick={() => togglePanel('searchFriend')}
                        />
                        <GroupButton
                            handleClick={() => togglePanel('newGroup')}
                        />
                    </div>
                    <div className={styles.social__div}>
                        <h3 className={styles.social__description}>Amigos</h3>
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
                        <h3 className={styles.social__description}>Grupos</h3>
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
            </section>
        </>
    )
}
