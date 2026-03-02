export interface User {
    userId: number
    name: string
    email: string
    city?: string
    avatarUrl?: string
    skillLevel?: string
    sports?: string[]
    attendCount: number
    attendRate: number
    kudosCount: number
}

export interface Event {
    id: number
    organizerName: string
    organizerId: number
    title: string
    sportType: string
    locationName: string
    locationLat?: number
    locationLng?: number
    startTime: string
    maxSpots: number
    reservedSpots: number
    availableSpots: number
    currentParticipants: number
    requireApproval: boolean
    skillRequirement: string
    feeDescription?: string
    cancelDeadlineHours: number
    status: string
    createdAt: string
}

export interface Participation {
    id: number
    eventId: number
    eventTitle: string
    userId: number
    userName: string
    userAvatarUrl?: string
    userAttendRate: number
    status: string
    joinedAt: string
}

export interface Message {
    id: number
    eventId: number
    senderId: number
    senderName: string
    senderAvatarUrl?: string
    content: string
    createdAt: string
}

export interface Notification {
    id: number
    type: string
    message: string
    eventId: number
    eventTitle: string
    isRead: boolean
    createdAt: string
}

export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
}