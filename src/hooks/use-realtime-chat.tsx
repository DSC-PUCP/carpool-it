import { useCallback, useEffect, useState } from 'react';
import getSupabaseClient from '@/lib/supabase';
import { PushNotificationsService } from '@/modules/notifications/services';

interface UseRealtimeChatProps {
  roomName: string;
  username: string;
  actorUserId?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  user: {
    name: string;
  };
  createdAt: string;
  location?: {
    lat: number;
    lng: number;
  };
}

const EVENT_MESSAGE_TYPE = 'message';

export function useRealtimeChat({
  roomName,
  username,
  actorUserId,
}: UseRealtimeChatProps) {
  const supabase = getSupabaseClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [channel, setChannel] = useState<ReturnType<
    typeof supabase.channel
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newChannel = supabase.channel(roomName);

    newChannel
      .on('broadcast', { event: EVENT_MESSAGE_TYPE }, (payload) => {
        setMessages((current) => [...current, payload.payload as ChatMessage]);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      });

    setChannel(newChannel);

    return () => {
      supabase.removeChannel(newChannel);
    };
  }, [roomName, supabase]);

  const sendMessage = useCallback(
    async (content: string, location?: { lat: number; lng: number }) => {
      if (!channel || !isConnected) return;

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        content,
        user: {
          name: username,
        },
        createdAt: new Date().toISOString(),
        ...(location && { location }),
      };

      // Update local state immediately for the sender
      setMessages((current) => [...current, message]);

      await channel.send({
        type: 'broadcast',
        event: EVENT_MESSAGE_TYPE,
        payload: message,
      });

      if (actorUserId) {
        void PushNotificationsService.notifyChatMessage({
          roomId: roomName,
          actorUserId,
          message: content,
        }).catch((error) => {
          console.error('No se pudo enviar notificacion de chat:', error);
        });
      }
    },
    [actorUserId, channel, isConnected, roomName, username]
  );

  return { messages, sendMessage, isConnected };
}
