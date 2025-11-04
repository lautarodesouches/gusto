'use client'
import GroupsChat from '../Chat'
import { ActiveView } from '../Client'
import GroupMap from '../Map'
import Switch from '../Switch'

interface Props {
    activeView: ActiveView
    onClick: (view: ActiveView) => void
    groupId: string
}

export default function GroupComponent({
    activeView,
    groupId,
    onClick,
}: Props) {
    return (
        <>
            <Switch activeView={activeView} onClick={onClick} />
            {activeView === 'map' ? (
                <GroupMap />
            ) : (
                <GroupsChat groupId={groupId} />
            )}
        </>
    )
}
