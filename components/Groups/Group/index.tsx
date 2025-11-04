'use client'
import GroupsChat from '../Chat'
import { ActiveView } from '../Client'
import GroupMap from '../Map'

interface Props {
    activeView: ActiveView
    groupId: string
}

export default function GroupComponent({ activeView, groupId }: Props) {
    return (
        <>
            {activeView === 'chat' ? (
                <GroupsChat groupId={groupId} />
            ) : (
                <GroupMap />
            )}
        </>
    )
}
