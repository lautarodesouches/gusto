import { Marker, InfoWindow } from '@react-google-maps/api'
import Link from 'next/link'
import Image from 'next/image'
import { ROUTES } from '@/routes'
import { Restaurant } from '@/types'
import styles from './styles.module.css'

interface Props {
    place: Restaurant
    index: number
    isSelected: boolean
    isHovered: boolean
    setHoveredMarker: (index: number | null) => void
}

export default function RestaurantMarker({
    place,
    index,
    isSelected,
    isHovered,
    setHoveredMarker,
}: Props) {
    return (
        <Marker
            key={place.id || `restaurant-${index}`}
            position={{
                lat: place.latitud,
                lng: place.longitud,
            }}
            title={place.nombre || 'Restaurante'}
            icon={{
                url:
                    isSelected
                        ? '/markers/markerOne.svg'
                        : index === 0
                        ? '/markers/markerOne.svg'
                        : index === 1
                        ? '/markers/markerTwo.svg'
                        : index === 2
                        ? '/markers/markerThree.svg'
                        : '/markers/marker.svg',
                scaledSize:
                    isSelected
                        ? new google.maps.Size(48, 60)
                        : index > 2
                        ? new google.maps.Size(30, 38)
                        : new google.maps.Size(48, 60),
                anchor:
                    isSelected
                        ? new google.maps.Point(24, 60)
                        : index > 2
                        ? new google.maps.Point(15, 38)
                        : new google.maps.Point(24, 60),
            }}
            animation={isSelected ? google.maps.Animation.BOUNCE : google.maps.Animation.DROP}
            onClick={() => setHoveredMarker(index)}
        >
            {isHovered && (
                <InfoWindow
                    position={{
                        lat: place.latitud,
                        lng: place.longitud,
                    }}
                    options={{
                        disableAutoPan: true,
                        pixelOffset: new google.maps.Size(0, -10),
                    }}
                    onCloseClick={() => setHoveredMarker(null)}
                >
                    <div className={styles.info}>
                        <h3 className={styles.info__title}>{place.nombre}</h3>
                        {place.rating !== undefined && (
                            <div className={styles.info__rating}>
                                <span className={styles.info__rating_number}>
                                    {place.rating.toFixed(1)}
                                </span>
                                <Image
                                    src="/images/all/star.svg"
                                    alt="Rating"
                                    width={16}
                                    height={16}
                                    className={styles.info__icon}
                                />
                            </div>
                        )}
                        <div className={styles.info__buttons}>
                            <Link href={`${ROUTES.RESTAURANT}${place.id}`}>
                                <button className={styles.info__button}>
                                    Ver más
                                </button>
                            </Link>
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.direccion)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.info__directions}
                            >
                                📍 Cómo llegar
                            </a>
                        </div>
                    </div>
                </InfoWindow>
            )}
        </Marker>
    )
}
