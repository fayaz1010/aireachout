'use client'

import { useEffect, useCallback, useState } from 'react'
import { useSocket } from '@/contexts/SocketContext'
import { toast } from 'sonner'

interface RealtimeNotification {
  id: string
  type: 'hot_lead' | 'message' | 'call' | 'campaign' | 'ticket'
  title: string
  body: string
  time: string
  read: boolean
  href?: string
  data?: any
}

export function useRealtimeNotifications() {
  const { socket, connected } = useSocket()
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([])

  const addNotification = useCallback((notif: Omit<RealtimeNotification, 'id' | 'time' | 'read'>) => {
    const newNotif: RealtimeNotification = {
      ...notif,
      id: Math.random().toString(36).slice(2),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    }
    setNotifications((prev) => [newNotif, ...prev].slice(0, 50))
    return newNotif
  }, [])

  useEffect(() => {
    if (!socket) return

    // Hot lead alert (email opened/clicked)
    const handleHotLead = (data: any) => {
      const notif = addNotification({
        type: 'hot_lead',
        title: 'Hot Lead Alert',
        body: `${data.leadName || 'A lead'} just ${data.action || 'engaged'} with your campaign`,
        href: `/leads/${data.leadId}`,
        data,
      })
      toast('🔥 Hot Lead Alert', {
        description: notif.body,
        action: { label: 'View', onClick: () => window.location.href = notif.href || '/leads' },
      })
    }

    // New inbox message
    const handleNewMessage = (data: any) => {
      const notif = addNotification({
        type: 'message',
        title: 'New Message',
        body: `${data.senderName || 'Contact'} sent a message`,
        href: `/inbox/${data.conversationId}`,
        data,
      })
      toast('💬 New Message', { description: notif.body })
    }

    // Incoming call
    const handleIncomingCall = (data: any) => {
      const notif = addNotification({
        type: 'call',
        title: 'Incoming Call',
        body: `Call from ${data.fromName || data.fromNumber || 'Unknown'}`,
        href: '/calls',
        data,
      })
      toast('📞 Incoming Call', {
        description: notif.body,
        duration: 10000,
        action: { label: 'Answer', onClick: () => window.location.href = '/calls' },
      })
    }

    // Campaign complete
    const handleCampaignComplete = (data: any) => {
      addNotification({
        type: 'campaign',
        title: 'Campaign Complete',
        body: `"${data.campaignName}" finished sending`,
        href: `/campaigns/${data.campaignId}`,
        data,
      })
      toast('✅ Campaign Complete', { description: `"${data.campaignName}" finished sending` })
    }

    socket.on('lead:hot', handleHotLead)
    socket.on('message:new', handleNewMessage)
    socket.on('call:incoming', handleIncomingCall)
    socket.on('campaign:complete', handleCampaignComplete)

    return () => {
      socket.off('lead:hot', handleHotLead)
      socket.off('message:new', handleNewMessage)
      socket.off('call:incoming', handleIncomingCall)
      socket.off('campaign:complete', handleCampaignComplete)
    }
  }, [socket, addNotification])

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return { notifications, unreadCount, markRead, markAllRead, connected }
}
