import MapClient from '@/components/Map/Client'
import { Metadata } from 'next'
import { ProfileOverlay } from '@/components'
import { getFriendsData } from '../actions/friends'
import { getGroupsData } from '../actions/groups'
import { getFilters } from '../actions/filters'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Mapa de Restaurantes | Gusto',
    description: 'Explorá el mapa de restaurantes, filtrá por tus gustos y encontrá el lugar perfecto cerca tuyo.',
}

export default async function Map() {
    // Ejecutar en paralelo
    const [friendsData, groupsData, filtersData] = await Promise.all([
        getFriendsData(),
        getGroupsData(),
        getFilters(),
    ])

    const socialData = {
        friends: friendsData.data?.friends ?? [],
        friendsRequests: friendsData.data?.friendsRequests ?? [],
        groups: groupsData.data?.groups ?? [],
        groupsRequests: groupsData.data?.groupsRequests ?? [],
    }

    const filters = {
        dishes: filtersData.data?.dishes ?? [],
        ratings: filtersData.data?.ratings ?? [],
    }

    return (
        <>
            <ProfileOverlay />
            <MapClient socialData={socialData} filters={filters} />
        </>
    )
}
