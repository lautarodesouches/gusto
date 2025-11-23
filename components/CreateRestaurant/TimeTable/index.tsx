'use client'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faUnlock } from '@fortawesome/free-solid-svg-icons'
import styles from './page.module.css'

type DaySchedule = {
    from: string
    to: string
    locked: boolean
}

type ScheduleState = {
    [key: string]: DaySchedule
}

const days = [
    { key: 'lunes', label: 'Lunes' },
    { key: 'martes', label: 'Martes' },
    { key: 'miercoles', label: 'Miércoles' },
    { key: 'jueves', label: 'Jueves' },
    { key: 'viernes', label: 'Viernes' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' },
]

type TimeTableProps = {
    onScheduleChange?: (schedule: ScheduleState) => void
    
    initialSchedule?: Partial<ScheduleState> | null
}

export type { ScheduleState, DaySchedule, TimeTableProps }

export default function TimeTable({ onScheduleChange, initialSchedule }: TimeTableProps) {
    const [schedule, setSchedule] = useState<ScheduleState>(() => {
        const base: ScheduleState = Object.fromEntries(
            days.map(d => [
                d.key,
                { from: '12:00', to: '22:00', locked: false },
            ])
        ) as ScheduleState

        if (!initialSchedule) return base

        const result: ScheduleState = { ...base }

        for (const [key, value] of Object.entries(initialSchedule)) {
            if (!value || !result[key]) continue
            result[key] = {
                from: value.from ?? result[key].from,
                to: value.to ?? result[key].to,
                locked: value.locked ?? result[key].locked,
            }
        }

        return result
    })

    // Notificar cambios al padre
    useEffect(() => {
        onScheduleChange?.(schedule)
    }, [schedule, onScheduleChange])

    const handleTimeChange = (
        day: string,
        field: 'from' | 'to',
        value: string
    ) => {
        setSchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: value },
        }))
    }

    const toggleLock = (day: string) => {
        setSchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], locked: !prev[day].locked },
        }))
    }

    return (
        <div className={styles.timetable}>
            <div className={styles.timetable__header}>
                <span className={styles.timetable__day}></span>
                <span className={styles.timetable__label}>Desde</span>
                <span className={styles.timetable__label}>Hasta</span>
                <span className={styles.timetable__lock}></span>
            </div>
            {days.map(({ key, label }) => (
                <div key={key} className={styles.timetable__row}>
                    <span className={styles.timetable__day}>{label}</span>
                    <input
                        type="time"
                        className={styles.timetable__input}
                        value={schedule[key].from}
                        onChange={e =>
                            handleTimeChange(key, 'from', e.target.value)
                        }
                        disabled={schedule[key].locked}
                    />
                    <input
                        type="time"
                        className={styles.timetable__input}
                        value={schedule[key].to}
                        onChange={e =>
                            handleTimeChange(key, 'to', e.target.value)
                        }
                        disabled={schedule[key].locked}
                    />
                    <button
                        type="button"
                        className={styles.timetable__lockBtn}
                        onClick={() => toggleLock(key)}
                    >
                        <FontAwesomeIcon
                            icon={schedule[key].locked ? faLock : faUnlock}
                        />
                    </button>
                </div>
            ))}
        </div>
    )
}