'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Message, ApiResponse } from '@/lib/types'
import Navbar from '@/components/Navbar'

export default function ChatPage() {
    const { id } = useParams()
    const router = useRouter()
    const { user, token, isAuthenticated, authLoading } = useAuth()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [connected, setConnected] = useState(false)
    const stompClient = useRef<Client | null>(null)
    const bottomRef = useRef<HTMLDivElement>(null)

// 先定义函数
    const fetchMessages = async () => {
        try {
            const res = await api.get<ApiResponse<Message[]>>(`/api/events/${id}/messages`)
            setMessages(res.data.data)
        } catch (err) {
            console.error(err)
        }
    }

    const connectWebSocket = () => {
        const client = new Client({
            webSocketFactory: () => new SockJS(`${process.env.NEXT_PUBLIC_API_URL}/ws`),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            onConnect: () => {
                setConnected(true)
                client.subscribe(`/topic/event/${id}`, (message) => {
                    const body: Message = JSON.parse(message.body)
                    setMessages(prev => [...prev, body])
                })
            },
            onDisconnect: () => {
                setConnected(false)
            },
        })
        client.activate()
        stompClient.current = client
    }

// 再定义 useEffect
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, authLoading, router])

    useEffect(() => {
        if (!token || !id) return
        fetchMessages()
        connectWebSocket()
        return () => {
            stompClient.current?.deactivate()
        }
    }, [token, id])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])


    const sendMessage = () => {
        if (!input.trim() || !connected) return

        stompClient.current?.publish({
            destination: `/app/event/${id}/send`,
            body: JSON.stringify({ content: input.trim() }),
        })

        setInput('')
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            <Navbar />

            {/* Chat Header */}
            <div className="border-b border-gray-800 px-6 py-3 flex items-center gap-3">
                <Link href={`/events/${id}`} className="text-gray-500 hover:text-white transition-colors">
                    ←
                </Link>
                <div>
                    <h2 className="font-bold text-sm">Event Chat</h2>
                    <p className={`text-xs ${connected ? 'text-green-400' : 'text-gray-500'}`}>
                        {connected ? 'Connected' : 'Connecting...'}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-600 py-20">
                        <p className="text-3xl mb-2">💬</p>
                        <p className="text-sm">No messages yet. Say hello!</p>
                    </div>
                ) : (
                    messages.map(msg => {
                        const isMe = msg.senderId === user?.userId
                        return (
                            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                    {msg.senderName.charAt(0).toUpperCase()}
                                </div>
                                <div className={`max-w-xs ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                    {!isMe && (
                                        <p className="text-xs text-gray-500 mb-1">{msg.senderName}</p>
                                    )}
                                    <div className={`px-4 py-2 rounded-2xl text-sm ${
                                        isMe
                                            ? 'bg-green-400 text-gray-950 rounded-tr-sm'
                                            : 'bg-gray-800 text-white rounded-tl-sm'
                                    }`}>
                                        {msg.content}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">{formatTime(msg.createdAt)}</p>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-800 px-6 py-4 flex gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-colors"
                />
                <button
                    onClick={sendMessage}
                    disabled={!connected || !input.trim()}
                    className="bg-green-400 hover:bg-green-300 text-gray-950 font-bold rounded-xl px-5 py-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </div>
        </div>
    )
}