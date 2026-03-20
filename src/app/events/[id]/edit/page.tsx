'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { ApiResponse, Event } from '@/lib/types'
import Navbar from '@/components/Navbar'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const SPORTS = ['FOOTBALL', 'BADMINTON', 'BASKETBALL', 'TENNIS', 'VOLLEYBALL', 'OTHER']
const SPORT_ICONS: Record<string, string> = {
    FOOTBALL: '⚽',
    BADMINTON: '🏸',
    BASKETBALL: '🏀',
    TENNIS: '🎾',
    VOLLEYBALL: '🏐',
    OTHER: '🏃',
}

export default function EditEventPage() {
    const { id } = useParams()
    const router = useRouter()
    const { user, isAuthenticated, authLoading } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [reservedNames, setReservedNames] = useState<string[]>([])
    const [reservedInput, setReservedInput] = useState('')
    const [form, setForm] = useState<{
        title: string
        sportType: string
        locationName: string
        startTime: Date | null
        maxSpots: number
        requireApproval: boolean
        skillRequirement: string
        feeDescription: string
        cancelDeadlineHours: number
    } | null>(null)

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, authLoading, router])

    useEffect(() => {
        if (!isAuthenticated) return
        fetchEvent()
    }, [id, isAuthenticated])

    const fetchEvent = async () => {
        try {
            const res = await api.get<ApiResponse<Event>>(`/api/events/${id}`)
            const event = res.data.data

            if (Number(user?.userId) !== Number(event.organizerId)) {
                router.push(`/events/${id}`)
                return
            }

            setReservedNames(event.reservedNames || [])
            setForm({
                title: event.title,
                sportType: event.sportType,
                locationName: event.locationName,
                startTime: new Date(event.startTime),
                maxSpots: event.maxSpots,
                requireApproval: event.requireApproval,
                skillRequirement: event.skillRequirement,
                feeDescription: event.feeDescription || '',
                cancelDeadlineHours: event.cancelDeadlineHours,
            })
        } catch (err) {
            console.error(err)
            setError('Failed to load event')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form) return
        setError('')
        setSaving(true)
        try {
            await api.put(`/api/events/${id}`, {
                ...form,
                startTime: form.startTime!.toISOString().slice(0, 19),
                reservedSpots: reservedNames.length,
                reservedNames,
            })
            router.push(`/events/${id}`)
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            setError(error.response?.data?.message || 'Failed to update event')
        } finally {
            setSaving(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        )
    }

    if (!form) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-gray-500">Event not found</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <main className="max-w-xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-black mb-8">
                    Edit <span className="text-green-400">Game</span>
                </h1>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Title */}
                    <div>
                        <label className="text-sm text-gray-400 mb-1.5 block">Game Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-colors"
                            required
                        />
                    </div>

                    {/* Sport Type */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Sport</label>
                        <div className="flex gap-2 flex-wrap">
                            {SPORTS.map(sport => (
                                <button
                                    key={sport}
                                    type="button"
                                    onClick={() => setForm({ ...form, sportType: sport })}
                                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                        form.sportType === sport
                                            ? 'bg-green-400 text-gray-950'
                                            : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {SPORT_ICONS[sport]} {sport.charAt(0) + sport.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="text-sm text-gray-400 mb-1.5 block">Location</label>
                        <input
                            type="text"
                            value={form.locationName}
                            onChange={e => setForm({ ...form, locationName: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-colors"
                            required
                        />
                    </div>

                    {/* Start Time */}
                    <div>
                        <label className="text-sm text-gray-400 mb-1.5 block">Date & Time</label>
                        <DatePicker
                            selected={form.startTime}
                            onChange={(date: Date | null) => setForm({ ...form, startTime: date })}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="yyyy-MM-dd HH:mm"
                            minDate={new Date()}
                            className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-colors"
                            wrapperClassName="w-full"
                            required
                        />
                    </div>

                    {/* Total Spots */}
                    <div>
                        <label className="text-sm text-gray-400 mb-1.5 block">Total Spots</label>
                        <input
                            type="number"
                            value={form.maxSpots}
                            onChange={e => setForm({ ...form, maxSpots: parseInt(e.target.value) })}
                            className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-colors"
                            min={2}
                            required
                        />
                    </div>

                    {/* Reserved Spots */}
                    <div>
                        <label className="text-sm text-gray-400 mb-1.5 block">
                            Reserved Spots
                            {reservedNames.length > 0 && (
                                <span className="ml-2 text-green-400">{reservedNames.length} reserved</span>
                            )}
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={reservedInput}
                                onChange={e => setReservedInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        const name = reservedInput.trim()
                                        if (name) {
                                            setReservedNames([...reservedNames, name])
                                            setReservedInput('')
                                        }
                                    }
                                }}
                                className="flex-1 bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-colors"
                                placeholder="Enter a name"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const name = reservedInput.trim()
                                    if (name) {
                                        setReservedNames([...reservedNames, name])
                                        setReservedInput('')
                                    }
                                }}
                                className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        {reservedNames.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {reservedNames.map((name, i) => (
                                    <span key={i} className="flex items-center gap-1.5 bg-gray-800 text-gray-300 text-xs px-3 py-1.5 rounded-full">
                                        {name}
                                        <button
                                            type="button"
                                            onClick={() => setReservedNames(reservedNames.filter((_, idx) => idx !== i))}
                                            className="text-gray-500 hover:text-red-400 transition-colors"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Skill Level */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Skill Level</label>
                        <div className="flex gap-2">
                            {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(level => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setForm({ ...form, skillRequirement: level })}
                                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                                        form.skillRequirement === level
                                            ? 'bg-green-400 text-gray-950'
                                            : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {level === 'ALL' ? 'All' : level.charAt(0) + level.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Fee */}
                    <div>
                        <label className="text-sm text-gray-400 mb-1.5 block">Fee Description <span className="text-gray-600">(optional)</span></label>
                        <input
                            type="text"
                            value={form.feeDescription}
                            onChange={e => setForm({ ...form, feeDescription: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-colors"
                            placeholder="Free / $5 per person"
                        />
                    </div>

                    {/* Cancel Deadline */}
                    <div>
                        <label className="text-sm text-gray-400 mb-1.5 block">Cancel Deadline (hours before start)</label>
                        <input
                            type="number"
                            value={form.cancelDeadlineHours}
                            onChange={e => setForm({ ...form, cancelDeadlineHours: parseInt(e.target.value) })}
                            className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-colors"
                            min={0}
                        />
                    </div>

                    {/* Require Approval */}
                    <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                        <div>
                            <p className="text-sm font-medium">Require Approval</p>
                            <p className="text-xs text-gray-500">Manually approve each participant</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, requireApproval: !form.requireApproval })}
                            className={`w-12 h-6 rounded-full transition-colors relative ${
                                form.requireApproval ? 'bg-green-400' : 'bg-gray-700'
                            }`}
                        >
                            <span className={`absolute top-1 left-0 w-4 h-4 bg-white rounded-full transition-transform ${
                                form.requireApproval ? 'translate-x-7' : 'translate-x-1'
                            }`} />
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => router.push(`/events/${id}`)}
                            className="flex-1 border border-gray-700 text-gray-400 hover:text-white font-bold rounded-xl py-4 text-sm transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !form.sportType || !form.startTime}
                            className="flex-1 bg-green-400 hover:bg-green-300 text-gray-950 font-black rounded-xl py-4 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}
