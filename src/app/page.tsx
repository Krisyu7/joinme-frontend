'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Event, ApiResponse } from '@/lib/types'
import Navbar from '@/components/Navbar'
import EventCard from '@/components/EventCard'
import SportFilter from '@/components/SportFilter'

export default function HomePage() {
    const { user, isAuthenticated } = useAuth()
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [sportFilter, setSportFilter] = useState<string>('')

    useEffect(() => {
        fetchEvents()
    }, [sportFilter])

    const fetchEvents = async () => {
        setLoading(true)
        try {
            const params = sportFilter ? { sportType: sportFilter } : {}
            const res = await api.get<ApiResponse<Event[]>>('/api/events', { params })
            setEvents(res.data.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Hero */}
                <div className="mb-8">
                    <h2 className="text-4xl font-black mb-2">
                        Find your <span className="text-green-400">game</span>
                    </h2>
                    <p className="text-gray-400">
                        {isAuthenticated
                            ? `Welcome back, ${user?.name}!`
                            : 'Join local sports drop-in games near you.'}
                    </p>
                </div>

                {/* Filter */}
                <div className="mb-6">
                    <SportFilter selected={sportFilter} onChange={setSportFilter} />
                </div>

                {/* Events */}
                {loading ? (
                    <div className="text-center text-gray-500 py-20">Loading...</div>
                ) : events.length === 0 ? (
                    <div className="text-center text-gray-500 py-20">
                        <p className="text-4xl mb-4">🏃</p>
                        <p>No games found. Be the first to create one!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {events.map(event => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}