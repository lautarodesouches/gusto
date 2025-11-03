import MapClient from '@/components/Map/Client'
import { getFriendsData } from '../actions/friends'
import { getGroupsData } from '../actions/groups'
import { getFilters } from '../actions/filters'

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
        categories: filtersData.data?.categories ?? [],
        dishes: filtersData.data?.dishes ?? [],
        ratings: filtersData.data?.ratings ?? [],
    }

    return <MapClient socialData={socialData} filters={filters} />
}
