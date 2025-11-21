'use client'
import GroupsChat from '../Chat'
import { ActiveView } from '../Client'
import GroupMap from '../Map'
import Switch from '../Switch'

import GroupVoting from '../Voting'
import { Restaurant } from '@/types'

import { GroupMember } from '@/types'


interface Props {
    activeView: ActiveView
    groupId: string
    members: (GroupMember & { checked: boolean })[]
    admin: string
    isAdmin?: boolean
    onClick: (view: ActiveView) => void
    currentRestaurants: Restaurant[]
    onRestaurantsChange: (restaurants: Restaurant[]) => void
}

export default function GroupComponent({
    activeView,
    groupId,
    members,
    admin,
    isAdmin = false,
    onClick,
    currentRestaurants,
    onRestaurantsChange,
}: Props) {
    return (
        <>
            <Switch activeView={activeView} onClick={onClick} />
            {activeView === 'map' ? (
                <GroupMap members={members} onRestaurantsChange={onRestaurantsChange} />
            ) : activeView === 'vote' ? (
                <GroupVoting 
                    groupId={groupId} 
                    members={members} 
                    isAdmin={isAdmin}
                    currentRestaurants={currentRestaurants}
                />
            ) : (
                <GroupsChat admin={admin} groupId={groupId} />
            )}
        </>
    )
}
