import { useNavigate } from '@tanstack/react-router';
import { Clock, DoorOpen, HelpCircle, MapPin, Plus, Send } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ChatMessageItem } from '@/components/chat-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useChatScroll } from '@/hooks/use-chat-scroll';
import { type ChatMessage, useRealtimeChat } from '@/hooks/use-realtime-chat';
import { cn } from '@/lib/utils';

interface TravelChatProps {
  roomId: string;
  username: string;
  userId: string;
}

const QUICK_MESSAGES = [
  { label: 'Esperando', icon: Clock },
  { label: 'Ya salí', icon: DoorOpen },
  { label: '¿Dónde estás?', icon: HelpCircle },
] as const;

const SEND_COOLDOWN_MS = 1500;

export default function TravelChat({
  roomId,
  username,
  userId,
}: TravelChatProps) {
  const { containerRef, scrollToBottom } = useChatScroll();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigation = useNavigate();
  const cooldownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    messages: realtimeMessages,
    sendMessage,
    isConnected,
  } = useRealtimeChat({ roomName: roomId, username, actorUserId: userId });

  const [newMessage, setNewMessage] = useState('');
  const [quickOpen, setQuickOpen] = useState(false);
  const [isSendingLocation, setIsSendingLocation] = useState(false);
  const [isSendCooldown, setIsSendCooldown] = useState(false);

  useEffect(() => {
    return () => {
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current);
      }
    };
  }, []);

  const allMessages = useMemo(() => {
    const sorted = [...realtimeMessages].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt)
    );
    // Side-effect: scroll after render when messages change
    queueMicrotask(() => scrollToBottom());
    return sorted;
  }, [realtimeMessages, scrollToBottom]);

  const showLocationHelpToast = useCallback(() => {
    toast.error(
      'Tu navegador tiene desativado los permisos de ubicación, activalos o agrega la aplicación a la pantalla',
      {
        action: {
          label: 'Ver ayuda',
          onClick: () => {
            navigation({
              to: '/profile/asisstance',
            });
          },
        },
      }
    );
  }, [navigation]);

  const startSendCooldown = useCallback(() => {
    setIsSendCooldown(true);
    if (cooldownTimeoutRef.current) {
      clearTimeout(cooldownTimeoutRef.current);
    }
    cooldownTimeoutRef.current = setTimeout(() => {
      setIsSendCooldown(false);
      cooldownTimeoutRef.current = null;
    }, SEND_COOLDOWN_MS);
  }, []);

  const canSendMessage = isConnected && !isSendCooldown;

  const handleSend = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const text = newMessage.trim();
      if (!text || !canSendMessage) return;
      sendMessage(text);
      startSendCooldown();
      setNewMessage('');
      inputRef.current?.focus();
    },
    [newMessage, canSendMessage, sendMessage, startSendCooldown]
  );

  const handleQuickMessage = useCallback(
    (text: string) => {
      if (!canSendMessage) return;
      sendMessage(text);
      startSendCooldown();
      setQuickOpen(false);
    },
    [canSendMessage, sendMessage, startSendCooldown]
  );

  const handleSendLocation = useCallback(() => {
    if (!canSendMessage) return;
    if (!navigator.geolocation) {
      showLocationHelpToast();
      return;
    }
    setIsSendingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const msg: ChatMessage = {
          id: crypto.randomUUID(),
          content: 'Estoy acá 📍',
          user: { name: username },
          createdAt: new Date().toISOString(),
          location: { lat: latitude, lng: longitude },
        };
        sendMessage(msg.content, msg.location);
        startSendCooldown();
        setIsSendingLocation(false);
        setQuickOpen(false);
      },
      () => {
        showLocationHelpToast();
        setIsSendingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [
    canSendMessage,
    sendMessage,
    showLocationHelpToast,
    startSendCooldown,
    username,
  ]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-2 min-h-30 max-h-[40vh]"
      >
        {allMessages.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-6">
            Sin mensajes aún. ¡Inicia la conversación!
          </p>
        ) : (
          <div className="space-y-1">
            {allMessages.map((message, index) => {
              const prev = index > 0 ? allMessages[index - 1] : null;
              const showHeader = !prev || prev.user.name !== message.user.name;

              return (
                <div
                  key={message.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                >
                  <ChatMessageItem
                    message={message}
                    isOwnMessage={message.user.name === username}
                    showHeader={showHeader}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-border px-4 py-3"
      >
        {/* Quick messages */}
        <Popover open={quickOpen} onOpenChange={setQuickOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full size-9"
              disabled={!canSendMessage || isSendingLocation}
            >
              <Plus className="size-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            className="w-auto p-2 flex flex-col gap-1"
          >
            <button
              type="button"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
              onClick={handleSendLocation}
              disabled={isSendingLocation}
            >
              <MapPin className="size-4 text-blue-600" />
              {isSendingLocation ? 'Obteniendo...' : 'Ubicación actual'}
            </button>
            {QUICK_MESSAGES.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                onClick={() => handleQuickMessage(label)}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        <Input
          ref={inputRef}
          className="rounded-full bg-background text-sm flex-1"
          type="text"
          enterKeyHint="send"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          disabled={!isConnected}
        />

        <Button
          type="submit"
          size="icon"
          className={cn(
            'shrink-0 rounded-full size-9 transition-opacity',
            !newMessage.trim() && 'opacity-40 pointer-events-none'
          )}
          disabled={!canSendMessage || !newMessage.trim()}
        >
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
