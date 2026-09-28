import { useCallback, useEffect, useRef, useState } from 'react';
import getSupabaseClient from '@/lib/supabase';

interface UseRealtimeChatProps {
  roomId: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  user: {
    name: string;
  };
  userId: string;
  createdAt: string;
  location?: {
    lat: number;
    lng: number;
  };
}

const EVENT_MESSAGE_TYPE = 'message_created';

type BroadcastMessage = {
  id: string;
  content: string;
  created_at: string;
  tag: string;
  user_id: string;
};

type HistoryMessage = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile: { tag: string } | null;
};

function getLocationFromContent(content: string) {
  const match = content.match(/\[loc:([\d.-]+),([\d.-]+)\]/);
  if (!match) return undefined;

  return { lat: Number(match[1]), lng: Number(match[2]) };
}

function mapMessage(message: {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  tag: string;
}): ChatMessage {
  return {
    id: message.id,
    content: message.content,
    user: { name: message.tag },
    userId: message.user_id,
    createdAt: message.created_at,
    location: getLocationFromContent(message.content),
  };
}

function mergeMessages(
  current: ChatMessage[],
  incoming: ChatMessage[]
): ChatMessage[] {
  const messagesById = new Map(current.map((message) => [message.id, message]));
  for (const message of incoming) {
    messagesById.set(message.id, message);
  }

  return [...messagesById.values()].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
}

export function useRealtimeChat({ roomId }: UseRealtimeChatProps) {
  const supabase = getSupabaseClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const loadHistory = async () => {
      const { data, error: historyError } = await supabase
        .from('travel_room_message')
        .select('id, content, created_at, user_id, profile(tag)')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (!active) return;
      if (historyError) {
        setError(historyError);
        return;
      }

      const historyMessages = ((data ?? []) as unknown as HistoryMessage[]).map(
        (message) =>
          mapMessage({
            ...message,
            tag: message.profile?.tag ?? 'Usuario',
          })
      );
      setMessages((current) => mergeMessages(current, historyMessages));
    };

    const setup = async () => {
      try {
        await supabase.realtime.setAuth();
        if (!active) return;

        channel = supabase.channel(`room:${roomId}`, {
          config: { private: true },
        });
        channelRef.current = channel;

        channel
          .on('broadcast', { event: EVENT_MESSAGE_TYPE }, (payload) => {
            if (!active) return;
            const message = mapMessage(payload.payload as BroadcastMessage);
            setMessages((current) => mergeMessages(current, [message]));
          })
          .subscribe((status) => {
            if (!active) return;
            const connected = status === 'SUBSCRIBED';
            setIsConnected(connected);
            if (connected) void loadHistory();
          });
      } catch (setupError) {
        if (active) setError(setupError as Error);
      }
    };

    setMessages([]);
    setError(null);
    void setup();

    return () => {
      active = false;
      setIsConnected(false);
      channelRef.current = null;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [roomId, supabase]);

  const sendMessage = useCallback(
    async (content: string, location?: { lat: number; lng: number }) => {
      if (!isConnected) return;

      const persistedContent = location
        ? `${content} [loc:${location.lat},${location.lng}]`
        : content;
      const { error: insertError } = await supabase
        .from('travel_room_message')
        .insert({ room_id: roomId, content: persistedContent });

      if (insertError) {
        setError(insertError);
      }
    },
    [isConnected, roomId, supabase]
  );

  return { messages, sendMessage, isConnected, error };
}
