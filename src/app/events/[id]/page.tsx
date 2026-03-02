'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Event, Participation, ApiResponse } from '@/lib/types'
import Navbar from '@/components/Navbar'

const SPORT_ICONS: Record<string, string> = {
    FOOTBALL: '⚽',
    BADMINTON: '🏸',
    BASKETBALL: '🏀',
    TENNIS: '🎾',
    VOLLEYBALL: '🏐',
    OTHER: '🏃',
}

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default function EventDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()

    const [event, setEvent] = useState<Event | null>(null)
    const [participants, setParticipants] = useState<Participation[]>([])
    const [myParticipation, setMyParticipation] = useState<Participation | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchEvent()
    }, [id])

    const fetchEvent = async () => {
        try {
            const res = await api.get<ApiResponse<Event>>(`/api/events/${id}`)
            setEvent(res.data.data)

            if (isAuthenticated) {
                fetchParticipants()
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchParticipants = async () => {
        try {
            // 组织者获取全部名单
            if (user?.userId === event?.organizerId) {
                const res = await api.get<ApiResponse<Participation[]>>(`/api/events/${id}/participants`)
                setParticipants(res.data.data)
            }
            // 所有登录用户获取自己的状态
            const statusRes = await api.get<ApiResponse<Participation>>(`/api/events/${id}/my-status`)
            setMyParticipation(statusRes.data.data)
        } catch {
            // 忽略错误
        }
    }

    const handleJoin = async () => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        setActionLoading(true)
        try {
            await api.post(`/api/events/${id}/join`)
            setMessage('Successfully joined!')
            fetchEvent()
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            setMessage(error.response?.data?.message || 'Failed to join')
        } finally {
            setActionLoading(false)
        }
    }

    const handleLeave = async () => {
        setActionLoading(true)
        try {
            await api.delete(`/api/events/${id}/leave`)
            setMessage('Successfully left the event')
            fetchEvent()
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            setMessage(error.response?.data?.message || 'Failed to leave')
        } finally {
            setActionLoading(false)
        }
    }

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this event?')) return
        setActionLoading(true)
        try {
            await api.delete(`/api/events/${id}`)
            router.push('/')
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            setMessage(error.response?.data?.message || 'Failed to cancel')
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 text-white">
                <Navbar />
                <div className="text-center py-20 text-gray-500">Loading...</div>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-gray-950 text-white">
                <Navbar />
                <div className="text-center py-20 text-gray-500">Event not found</div>
            </div>
        )
    }

    const isOrganizer = Number(user?.userId) === Number(event.organizerId)
    const isParticipant = myParticipation?.status === 'APPROVED'
    const isPending = myParticipation?.status === 'PENDING'

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <main className="max-w-2xl mx-auto px-6 py-8">

                {/* Back */}
                <Link href="/" className="text-gray-500 hover:text-white text-sm mb-6 inline-block transition-colors">
                    ← Back to games
                </Link>

                {/* Header */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-3xl">{SPORT_ICONS[event.sportType]}</span>
                                <h1 className="text-2xl font-black">{event.title}</h1>
                            </div>
                            <p className="text-gray-400 text-sm">by {event.organizerName}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                            event.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                                event.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-gray-500/20 text-gray-400'
                        }`}>
                            {event.status}
                        </div>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                            <span>📍</span> {event.locationName}
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <span>🕐</span> {formatDate(event.startTime)}
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <span>👥</span> {event.currentParticipants} joined · {event.availableSpots} spots left
                        </div>
                        {event.feeDescription && (
                            <div className="flex items-center gap-2 text-gray-300">
                                <span>💰</span> {event.feeDescription}
                            </div>
                        )}
                        {event.cancelDeadlineHours > 0 && (
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                                <span>⚠️</span> Cancel at least {event.cancelDeadlineHours}h before start
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 mt-4 flex-wrap">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 font-medium">
                            {event.skillRequirement === 'ALL' ? 'All Levels' : event.skillRequirement}
                        </span>
                        {event.requireApproval && (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 font-medium">
                                Approval Required
                            </span>
                        )}
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-lg px-4 py-3 mb-4">
                        {message}
                    </div>
                )}

                {/* Actions */}
                {event.status === 'ACTIVE' && (
                    <div className="mb-4">
                        {isOrganizer ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancel}
                                    disabled={actionLoading}
                                    className="flex-1 border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold rounded-xl py-3 text-sm transition-colors disabled:opacity-50"
                                >
                                    Cancel Event
                                </button>
                            </div>
                        ) : isParticipant ? (
                            <button
                                onClick={handleLeave}
                                disabled={actionLoading}
                                className="w-full border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 font-bold rounded-xl py-3 text-sm transition-colors disabled:opacity-50"
                            >
                                {actionLoading ? 'Loading...' : 'Leave Event'}
                            </button>
                        ) : isPending ? (
                            <div className="w-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-bold rounded-xl py-3 text-sm text-center">
                                Pending Approval
                            </div>
                        ) : (
                            <button
                                onClick={handleJoin}
                                disabled={actionLoading || event.availableSpots === 0}
                                className="w-full bg-green-400 hover:bg-green-300 text-gray-950 font-bold rounded-xl py-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {actionLoading ? 'Loading...' : event.availableSpots === 0 ? 'Event Full' : 'Join Game'}
                            </button>
                        )}
                    </div>
                )}

                {(isOrganizer || isParticipant) && (
                    <Link href={`/events/${id}/chat`}>
                        <div className="bg-gray-900 border border-gray-800 hover:border-green-400/50 rounded-2xl p-4 mb-4 flex items-center justify-between cursor-pointer transition-all">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">💬</span>
                                <div>
                                    <p className="font-bold text-sm">Event Chat</p>
                                    <p className="text-xs text-gray-500">Chat with participants</p>
                                </div>
                            </div>
                            <span className="text-gray-500">→</span>
                        </div>
                    </Link>
                )}

                {/* Participants */}
                {isOrganizer && participants.length > 0 && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <h2 className="font-bold text-white mb-4">
                            Participants ({participants.length})
                        </h2>
                        <div className="space-y-3">
                            {participants.map(p => (
                                <div key={p.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
                                            {p.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{p.userName}</p>
                                            <p className="text-xs text-gray-500">
                                                {Math.round(p.userAttendRate * 100)}% attendance
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                        p.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                                            p.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-gray-500/20 text-gray-400'
                                    }`}>
                                        {p.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}