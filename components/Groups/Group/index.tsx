'use client'
import GroupsChat from '../Chat'
import { ActiveView } from '../Client'
import GroupMap from '../Map'
import Switch from '../Switch'
import { GroupMember } from '@/types'

interface Props {
    activeView: ActiveView
    groupId: string
    members: (GroupMember & { checked: boolean })[]
    admin: string
    onClick: (view: ActiveView) => void
}

export default function GroupComponent({
    activeView,
    groupId,
    members,
    admin,
    onClick,
}: Props) {
    return (
        <>
            <Switch activeView={activeView} onClick={onClick} />
            {activeView === 'map' ? (
                <GroupMap members={members} />
            ) : (
                <GroupsChat admin={admin} groupId={groupId} />
            )}
        </>
    )
}
