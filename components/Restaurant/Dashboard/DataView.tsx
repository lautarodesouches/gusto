import styles from './page.module.css'
import { RegisterItem } from '@/types'
import {
    RestaurantTimeTable,
    RestaurantSelect,
    RestaurantMap,
} from '@/components/CreateRestaurant'
import type { ScheduleState } from '@/components/CreateRestaurant/TimeTable'

export type ImageType = 'destacada' | 'logo' | 'interior' | 'comidas' | 'menu'

export type SaveState = {
    loading: boolean
    error: string
    success: string
}

export type ImageSaveState = {
    loadingType: ImageType | null
    error: string
    success: string
}

type Props = {
    saveState: SaveState
    handleSaveBasics: (e: React.FormEvent) => Promise<void>
    direccion: string
    setDireccion: (v: string) => void
    webUrl: string
    setWebUrl: (v: string) => void
    lat: number
    lng: number
    handleLocationSelect: (lat: number, lng: number, address: string) => void
    gustos: RegisterItem[]
    restricciones: RegisterItem[]
    selectedTastes: string[]
    selectedRestrictions: string[]
    handleSelectChange: (name: string, value: string[]) => void
    handleScheduleChange: (value: ScheduleState) => void
    initialSchedule: ScheduleState | null
    imageState: ImageSaveState
    imagenDestacadaUrl: string | null | undefined
    logoUrl: string | null | undefined
    imagenesInteriorUrls: string[]
    imagenesComidaUrls: string[]
    imagenMenuUrl: string | null
    handleImageUpload: (tipo: ImageType, files: FileList | null) => Promise<void>
    handleImageDelete: (tipo: ImageType) => Promise<void>
    isImageLoading: (tipo: ImageType) => boolean
}

export default function DataView({
    saveState,
    handleSaveBasics,
    direccion,
    setDireccion,
    webUrl,
    setWebUrl,
    lat,
    lng,
    handleLocationSelect,
    gustos,
    restricciones,
    selectedTastes,
    selectedRestrictions,
    handleSelectChange,
    handleScheduleChange,
    initialSchedule,
    imageState,
    imagenDestacadaUrl,
    logoUrl,
    imagenesInteriorUrls,
    imagenesComidaUrls,
    imagenMenuUrl,
    handleImageUpload,
    handleImageDelete,
    isImageLoading,
}: Props) {
    return (
        <section className={styles.infoPanel}>
            <div className={styles.infoHeader}>
                <h2>PANEL DE INFORMACIÓN</h2>
                <button
                    className={styles.saveButton}
                    type="submit"
                    form="restaurant-info-form"
                    disabled={saveState.loading}
                >
                    {saveState.loading
                        ? 'Guardando...'
                        : 'Guardar cambios'}
                </button>
            </div>

            <div className={styles.infoContent}>
                <form
                    id="restaurant-info-form"
                    className={styles.infoForm}
                    onSubmit={handleSaveBasics}
                >
                    {saveState.error && (
                        <p className={styles.infoError}>
                            {saveState.error}
                        </p>
                    )}
                    {saveState.success && (
                        <p className={styles.infoSuccess}>
                            {saveState.success}
                        </p>
                    )}

                    <div className={styles.infoRow}>
                        <label
                            className={styles.infoLabel}
                            htmlFor="direccion"
                        >
                            Dirección
                        </label>
                        <input
                            id="direccion"
                            type="text"
                            className={styles.infoInput}
                            value={direccion}
                            onChange={e =>
                                setDireccion(e.target.value)
                            }
                            placeholder="Dirección del restaurante"
                        />
                    </div>

                    <div className={styles.infoRow}>
                        <label
                            className={styles.infoLabel}
                            htmlFor="webUrl"
                        >
                            Sitio web
                        </label>
                        <input
                            id="webUrl"
                            type="url"
                            className={styles.infoInput}
                            value={webUrl}
                            onChange={e =>
                                setWebUrl(e.target.value)
                            }
                            placeholder="https://..."
                        />
                    </div>

                    <div className={styles.infoRowGrid}>
                        <div>
                            <label
                                className={styles.infoLabel}
                                htmlFor="lat"
                            >
                                Latitud
                            </label>
                            <input
                                id="lat"
                                type="number"
                                step="0.000001"
                                className={styles.infoInput}
                                value={lat}
                                readOnly
                                disabled
                            />
                        </div>
                        <div>
                            <label
                                className={styles.infoLabel}
                                htmlFor="lng"
                            >
                                Longitud
                            </label>
                            <input
                                id="lng"
                                type="number"
                                step="0.000001"
                                className={styles.infoInput}
                                value={lng}
                                readOnly
                                disabled
                            />
                        </div>
                    </div>

                    <div className={styles.infoRow}>
                        <label className={styles.infoLabel}>
                            Ubicación en el mapa
                        </label>
                        <div className={styles.mapWrapper}>
                            <RestaurantMap
                                address={direccion}
                                onLocationSelect={
                                    handleLocationSelect
                                }
                                initialLat={lat}
                                initialLng={lng}
                            />
                        </div>
                    </div>


                    {/* Gustos y restricciones */}
                    <div className={styles.infoRow}>
                        <label className={styles.infoLabel}>
                            Gustos y restricciones
                        </label>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(2, minmax(0, 1fr))',
                                gap: '10px',
                            }}
                        >
                            <RestaurantSelect
                                name="tastes"
                                placeholder="Gustos que ofrece"
                                options={gustos.map(
                                    g => g.nombre
                                )}
                                value={selectedTastes}
                                onChange={handleSelectChange}
                                multiple
                            />
                            <RestaurantSelect
                                name="restrictions"
                                placeholder="Restricciones que respeta"
                                options={restricciones.map(
                                    r => r.nombre
                                )}
                                value={selectedRestrictions}
                                onChange={handleSelectChange}
                                multiple
                            />
                        </div>
                    </div>

                    {/* Horarios */}
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>
                            Horarios
                        </span>
                        <div className={styles.scheduleWrapper}>
                            <RestaurantTimeTable
                                onScheduleChange={
                                    handleScheduleChange
                                }
                                initialSchedule={
                                    initialSchedule || undefined
                                }
                            />
                        </div>
                    </div>

                    {/* Divider visual */}
                    <div className={styles.infoDivider} />

                    {/* Imágenes */}
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>
                            Imágenes
                        </span>

                        {imageState.error && (
                            <p
                                className={
                                    styles.imageErrorMessage
                                }
                            >
                                {imageState.error}
                            </p>
                        )}
                        {imageState.success && (
                            <p
                                className={
                                    styles.imageSuccessMessage
                                }
                            >
                                {imageState.success}
                            </p>
                        )}

                        <div className={styles.imagesGrid}>
                            {/* Imagen destacada */}
                            <div className={styles.imageGroup}>
                                <p
                                    className={
                                        styles.imageTitle
                                    }
                                >
                                    Imagen destacada
                                </p>
                                {imagenDestacadaUrl ? (
                                    <img
                                        src={
                                            imagenDestacadaUrl
                                        }
                                        alt="Imagen destacada"
                                        className={
                                            styles.imagePreview
                                        }
                                    />
                                ) : (
                                    <p
                                        className={
                                            styles.imageEmpty
                                        }
                                    >
                                        Sin imagen
                                    </p>
                                )}
                                <div
                                    className={
                                        styles.imageActions
                                    }
                                >
                                    <label
                                        className={
                                            styles.imageButton
                                        }
                                    >
                                        {isImageLoading(
                                            'destacada'
                                        )
                                            ? 'Subiendo...'
                                            : 'Cambiar'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className={
                                                styles.imageFileInput
                                            }
                                            onChange={e =>
                                                handleImageUpload(
                                                    'destacada',
                                                    e.target
                                                        .files
                                                )
                                            }
                                            disabled={isImageLoading(
                                                'destacada'
                                            )}
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        className={
                                            styles.imageButtonSecondary
                                        }
                                        onClick={() =>
                                            handleImageDelete(
                                                'destacada'
                                            )
                                        }
                                        disabled={isImageLoading(
                                            'destacada'
                                        )}
                                    >
                                        Borrar
                                    </button>
                                </div>
                            </div>

                            {/* Logo */}
                            <div className={styles.imageGroup}>
                                <p
                                    className={
                                        styles.imageTitle
                                    }
                                >
                                    Logo
                                </p>
                                {logoUrl ? (
                                    <img
                                        src={logoUrl}
                                        alt="Logo"
                                        className={
                                            styles.imagePreview
                                        }
                                    />
                                ) : (
                                    <p
                                        className={
                                            styles.imageEmpty
                                        }
                                    >
                                        Sin logo
                                    </p>
                                )}
                                <div
                                    className={
                                        styles.imageActions
                                    }
                                >
                                    <label
                                        className={
                                            styles.imageButton
                                        }
                                    >
                                        {isImageLoading(
                                            'logo'
                                        )
                                            ? 'Subiendo...'
                                            : 'Cambiar'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className={
                                                styles.imageFileInput
                                            }
                                            onChange={e =>
                                                handleImageUpload(
                                                    'logo',
                                                    e.target
                                                        .files
                                                )
                                            }
                                            disabled={isImageLoading(
                                                'logo'
                                            )}
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        className={
                                            styles.imageButtonSecondary
                                        }
                                        onClick={() =>
                                            handleImageDelete(
                                                'logo'
                                            )
                                        }
                                        disabled={isImageLoading(
                                            'logo'
                                        )}
                                    >
                                        Borrar
                                    </button>
                                </div>
                            </div>

                            {/* Interior */}
                            <div className={styles.imageGroup}>
                                <p
                                    className={
                                        styles.imageTitle
                                    }
                                >
                                    Interior
                                </p>
                                {imagenesInteriorUrls &&
                                    imagenesInteriorUrls.length >
                                    0 ? (
                                    <div
                                        className={
                                            styles.imageMultiPreview
                                        }
                                    >
                                        {imagenesInteriorUrls.map(
                                            (url, idx) => (
                                                <img
                                                    key={
                                                        url +
                                                        idx
                                                    }
                                                    src={url}
                                                    alt={`Interior ${idx +
                                                        1}`}
                                                    className={
                                                        styles.imagePreviewSmall
                                                    }
                                                />
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <p
                                        className={
                                            styles.imageEmpty
                                        }
                                    >
                                        Sin imágenes
                                    </p>
                                )}
                                <div
                                    className={
                                        styles.imageActions
                                    }
                                >
                                    <label
                                        className={
                                            styles.imageButton
                                        }
                                    >
                                        {isImageLoading(
                                            'interior'
                                        )
                                            ? 'Subiendo...'
                                            : 'Reemplazar'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className={
                                                styles.imageFileInput
                                            }
                                            onChange={e =>
                                                handleImageUpload(
                                                    'interior',
                                                    e.target
                                                        .files
                                                )
                                            }
                                            disabled={isImageLoading(
                                                'interior'
                                            )}
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        className={
                                            styles.imageButtonSecondary
                                        }
                                        onClick={() =>
                                            handleImageDelete(
                                                'interior'
                                            )
                                        }
                                        disabled={isImageLoading(
                                            'interior'
                                        )}
                                    >
                                        Borrar todas
                                    </button>
                                </div>
                            </div>

                            {/* Comidas */}
                            <div className={styles.imageGroup}>
                                <p
                                    className={
                                        styles.imageTitle
                                    }
                                >
                                    Comidas
                                </p>
                                {imagenesComidaUrls &&
                                    imagenesComidaUrls.length >
                                    0 ? (
                                    <div
                                        className={
                                            styles.imageMultiPreview
                                        }
                                    >
                                        {imagenesComidaUrls.map(
                                            (url, idx) => (
                                                <img
                                                    key={
                                                        url +
                                                        idx
                                                    }
                                                    src={url}
                                                    alt={`Comida ${idx +
                                                        1}`}
                                                    className={
                                                        styles.imagePreviewSmall
                                                    }
                                                />
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <p
                                        className={
                                            styles.imageEmpty
                                        }
                                    >
                                        Sin imágenes
                                    </p>
                                )}
                                <div
                                    className={
                                        styles.imageActions
                                    }
                                >
                                    <label
                                        className={
                                            styles.imageButton
                                        }
                                    >
                                        {isImageLoading(
                                            'comidas'
                                        )
                                            ? 'Subiendo...'
                                            : 'Reemplazar'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className={
                                                styles.imageFileInput
                                            }
                                            onChange={e =>
                                                handleImageUpload(
                                                    'comidas',
                                                    e.target
                                                        .files
                                                )
                                            }
                                            disabled={isImageLoading(
                                                'comidas'
                                            )}
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        className={
                                            styles.imageButtonSecondary
                                        }
                                        onClick={() =>
                                            handleImageDelete(
                                                'comidas'
                                            )
                                        }
                                        disabled={isImageLoading(
                                            'comidas'
                                        )}
                                    >
                                        Borrar todas
                                    </button>
                                </div>
                            </div>

                            {/* Menú */}
                            <div className={styles.imageGroup}>
                                <p
                                    className={
                                        styles.imageTitle
                                    }
                                >
                                    Imagen de menú
                                </p>
                                {imagenMenuUrl ? (
                                    <img
                                        src={imagenMenuUrl}
                                        alt="Imagen de menú"
                                        className={
                                            styles.imagePreview
                                        }
                                    />
                                ) : (
                                    <p
                                        className={
                                            styles.imageEmpty
                                        }
                                    >
                                        Sin imagen de menú
                                    </p>
                                )}
                                <div
                                    className={
                                        styles.imageActions
                                    }
                                >
                                    <label
                                        className={
                                            styles.imageButton
                                        }
                                    >
                                        {isImageLoading(
                                            'menu'
                                        )
                                            ? 'Subiendo...'
                                            : 'Cambiar'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className={
                                                styles.imageFileInput
                                            }
                                            onChange={e =>
                                                handleImageUpload(
                                                    'menu',
                                                    e.target
                                                        .files
                                                )
                                            }
                                            disabled={isImageLoading(
                                                'menu'
                                            )}
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        className={
                                            styles.imageButtonSecondary
                                        }
                                        onClick={() =>
                                            handleImageDelete(
                                                'menu'
                                            )
                                        }
                                        disabled={isImageLoading(
                                            'menu'
                                        )}
                                    >
                                        Borrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </section>
    )
}
