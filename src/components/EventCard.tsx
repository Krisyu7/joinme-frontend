import Link from 'next/link'
import { Event } from '@/lib/types'

const SPORT_ICONS: Record<string, string> = {
    FOOTBALL: '⚽',
    BADMINTON: '🏸',
    BASKETBALL: '🏀',
    TENNIS: '🎾',
    VOLLEYBALL: '🏐',
    OTHER: '🏃',
}

const SKILL_COLORS: Record<string, string> = {
    ALL: 'bg-blue-500/20 text-blue-400',
    BEGINNER: 'bg-green-500/20 text-green-400',
    INTERMEDIATE: 'bg-yellow-500/20 text-yellow-400',
    ADVANCED: 'bg-red-500/20 text-red-400',
}

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default function EventCard({ event }: { event: Event }) {
    return (
        <Link href={`/events/${event.id}`}>
            <div className="bg-gray-900 border border-gray-800 hover:border-green-400/50 rounded-xl p-5 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{SPORT_ICONS[event.sportType] || '🏃'}</span>
                            <h3 className="font-bold text-white group-hover:text-green-400 transition-colors">
                                {event.title}
                            </h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">
                            📍 {event.locationName}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-gray-300 text-sm">
                                🕐 {formatDate(event.startTime)}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SKILL_COLORS[event.skillRequirement]}`}>
                                {event.skillRequirement === 'ALL' ? 'All Levels' : event.skillRequirement}
                            </span>
                            {event.requireApproval && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-medium">
                                    Approval Required
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-black text-white">
                            {event.availableSpots}
                        </div>
                        <div className="text-xs text-gray-500">spots left</div>
                        <div className="text-xs text-gray-600 mt-1">
                            {event.currentParticipants}/{event.maxSpots - event.reservedSpots}
                        </div>
                    </div>
                </div>
                {event.feeDescription && (
                    <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-500">
                        💰 {event.feeDescription}
                    </div>
                )}
            </div>
        </Link>
    )
}