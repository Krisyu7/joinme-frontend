'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Notification, ApiResponse } from '@/lib/types'
import Navbar from '@/components/Navbar'



const NOTIFICATION_ICONS: Record<string, string> = {
    JOINED: '🙋',
    CANCELLED: '👋',
    APPROVED: '✅',
    REJECTED: '❌',
    EVENT_UPDATED: '📝',
    EVENT_CANCELLED: '🚫',
}

export default function NotificationsPage() {
    const router = useRouter()
    const { isAuthenticated,authLoading } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login')
            return
        }
        if (!authLoading && isAuthenticated) {
            fetchNotifications()
        }
    }, [isAuthenticated, authLoading, router])

    const fetchNotifications = async () => {
        try {
            const res = await api.get<ApiResponse<Notification[]>>('/api/notifications')
            setNotifications(res.data.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const markAllRead = async () => {
        try {
            await api.put('/api/notifications/read-all')
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        } catch (err) {
            console.error(err)
        }
    }

    const deleteNotification = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await api.delete(`/api/notifications/${id}`)
            setNotifications(prev => prev.filter(n => n.id !== id))
        } catch (err) {
            console.error(err)
        }
    }

    const deleteAll = async () => {
        try {
            await api.delete('/api/notifications/delete-all')
            setNotifications([])
        } catch (err) {
            console.error(err)
        }
    }

    const markRead = async (id: number) => {
        try {
            await api.put(`/api/notifications/${id}/read`)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
        } catch (err) {
            console.error(err)
        }
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (days > 0) return `${days}d ago`
        if (hours > 0) return `${hours}h ago`
        if (minutes > 0) return `${minutes}m ago`
        return 'Just now'
    }

    const unreadCount = notifications.filter(n => !n.isRead).length

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <main className="max-w-xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black">Notifications</h1>
                        {unreadCount > 0 && (
                            <p className="text-gray-400 text-sm mt-1">{unreadCount} unread</p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
                            >
                                Mark all read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={deleteAll}
                                className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                            >
                                Delete all
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center text-gray-500 py-20">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center text-gray-500 py-20">
                        <p className="text-4xl mb-4">🔔</p>
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notifications.map(n => (
                            <div
                                key={n.id}
                                onClick={() => {
                                    markRead(n.id)
                                    router.push(`/events/${n.eventId}`)
                                }}
                                className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-colors ${
                                    n.isRead
                                        ? 'bg-gray-900 border border-gray-800 hover:border-gray-700'
                                        : 'bg-gray-900 border border-green-400/30 hover:border-green-400/50'
                                }`}
                            >
                                <span className="text-2xl">{NOTIFICATION_ICONS[n.type]}</span>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${n.isRead ? 'text-gray-400' : 'text-white font-medium'}`}>
                                        {n.message}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">{formatTime(n.createdAt)}</p>
                                </div>
                                {!n.isRead && (
                                    <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />

                                )}
                                <button
                                    onClick={(e) => deleteNotification(n.id, e)}
                                    className="text-gray-600 hover:text-red-400 transition-colors ml-2 flex-shrink-0"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}