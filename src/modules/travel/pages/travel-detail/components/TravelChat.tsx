import { useNavigate } from '@tanstack/react-router';
import {
  Clock,
  DoorOpen,
  HelpCircle,
  ImagePlus,
  MapPin,
  Plus,
  Send,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import type { ChatMessage } from '@/hooks/use-realtime-chat';
import { useRealtimeChat } from '@/hooks/use-realtime-chat';
import { cn } from '@/lib/utils';

interface TravelChatProps {
  roomId: string;
  currentUserId: string;
  participants: Array<{ userId: string; userTag: string }>;
}

const QUICK_MESSAGES = [
  { label: 'Esperando', icon: Clock },
  { label: 'Ya salí', icon: DoorOpen },
  { label: '¿Dónde estás?', icon: HelpCircle },
] as const;

const SEND_COOLDOWN_MS = 1500;

export default function TravelChat({
  roomId,
  currentUserId,
  participants,
}: TravelChatProps) {
  const { containerRef, scrollToBottom } = useChatScroll();
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const navigation = useNavigate();
  const cooldownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { messages, sendMessage, isConnected } = useRealtimeChat({ roomId });

  const [newMessage, setNewMessage] = useState('');
  const [quickOpen, setQuickOpen] = useState(false);
  const [isSendingLocation, setIsSendingLocation] = useState(false);
  const [isSendCooldown, setIsSendCooldown] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<
    string | null
  >(null);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!selectedImage) {
      setSelectedImagePreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    setSelectedImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedImage]);

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
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const text = newMessage.trim();
      if ((!text && !selectedImage) || !canSendMessage) return;
      const sent = await sendMessage(text, {
        image: selectedImage ?? undefined,
        replyToId: replyingTo?.id,
      });
      if (!sent) {
        toast.error('No se pudo enviar el mensaje.');
        return;
      }
      startSendCooldown();
      setNewMessage('');
      setSelectedImage(null);
      setReplyingTo(null);
      setMentionStart(null);
      inputRef.current?.focus();
    },
    [
      newMessage,
      canSendMessage,
      replyingTo,
      selectedImage,
      sendMessage,
      startSendCooldown,
    ]
  );

  const compressImage = useCallback(async (file: File) => {
    const source = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);
      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('No se pudo leer la imagen'));
      };
      image.src = objectUrl;
    });
    const maxSize = 1280;
    const scale = Math.min(
      1,
      maxSize / Math.max(source.naturalWidth, source.naturalHeight)
    );
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(source.naturalWidth * scale);
    canvas.height = Math.round(source.naturalHeight * scale);
    canvas
      .getContext('2d')
      ?.drawImage(source, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', 0.75)
    );
    if (!blob) throw new Error('No se pudo optimizar la imagen');
    return new File([blob], 'chat-image.webp', { type: 'image/webp' });
  }, []);

  const handleImageChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      try {
        setSelectedImage(await compressImage(file));
      } catch {
        setSelectedImage(null);
        toast.error('No se pudo procesar la imagen.');
      }
    },
    [compressImage]
  );

  const handleInputChange = useCallback((value: string) => {
    setNewMessage(value);
    const cursor = inputRef.current?.selectionStart ?? value.length;
    const match = value.slice(0, cursor).match(/@([^\s@]*)$/);
    if (!match) {
      setMentionStart(null);
      return;
    }
    setMentionStart(cursor - match[0].length);
    setMentionQuery(match[1].toLowerCase());
  }, []);

  const mentionOptions = participants.filter((participant) =>
    participant.userTag.toLowerCase().includes(mentionQuery)
  );

  const selectMention = useCallback(
    (participant: { userTag: string }) => {
      if (mentionStart === null) return;
      const before = newMessage.slice(0, mentionStart);
      const cursor = inputRef.current?.selectionStart ?? newMessage.length;
      setNewMessage(
        `${before}@${participant.userTag} ${newMessage.slice(cursor)}`
      );
      setMentionStart(null);
      inputRef.current?.focus();
    },
    [mentionStart, newMessage]
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
        sendMessage('Estoy acá 📍', {
          lat: latitude,
          lng: longitude,
        });
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
  }, [canSendMessage, sendMessage, showLocationHelpToast, startSendCooldown]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-2 min-h-30 max-h-[40vh]"
      >
        {messages.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-6">
            Sin mensajes aún. ¡Inicia la conversación!
          </p>
        ) : (
          <div className="space-y-1">
            {messages.map((message, index) => {
              const prev = index > 0 ? messages[index - 1] : null;
              const showHeader = !prev || prev.userId !== message.userId;

              return (
                <div
                  key={message.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                >
                  <ChatMessageItem
                    message={message}
                    isOwnMessage={message.userId === currentUserId}
                    showHeader={showHeader}
                    repliedMessage={
                      message.replyToId
                        ? messages.find((item) => item.id === message.replyToId)
                        : undefined
                    }
                    onReply={setReplyingTo}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="border-t border-border px-4">
        {(replyingTo || selectedImage) && (
          <div className="flex items-center justify-end gap-2 pt-1">
            <div className="flex min-w-0 items-center gap-2">
              {selectedImage && (
                <img
                  src={selectedImagePreview ?? undefined}
                  alt="Vista previa"
                  className="size-12 rounded object-cover"
                />
              )}
              {replyingTo && (
                <span className="truncate">
                  Respondiendo a {replyingTo.user.name}: {replyingTo.content}
                </span>
              )}
            </div>
            {(selectedImage || replyingTo) && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => {
                  setReplyingTo(null);
                  setSelectedImage(null);
                }}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        )}
        <form onSubmit={handleSend} className="flex items-center gap-2 py-3">
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
              <button
                type="button"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                onClick={() => {
                  imageInputRef.current?.click();
                  setQuickOpen(false);
                }}
                disabled={!canSendMessage}
              >
                <ImagePlus className="size-4" />
                Imagen
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
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Escribe un mensaje..."
            disabled={!isConnected}
          />
          <Button
            type="submit"
            size="icon"
            className={cn(
              'shrink-0 rounded-full size-9 transition-opacity',
              !newMessage.trim() &&
                !selectedImage &&
                'opacity-40 pointer-events-none'
            )}
            disabled={!canSendMessage || (!newMessage.trim() && !selectedImage)}
          >
            <Send className="size-4" />
          </Button>
        </form>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>
      {mentionStart !== null && mentionOptions.length > 0 && (
        <div className="absolute bottom-16 z-10 mx-4 flex max-h-32 flex-col overflow-y-auto rounded-lg border bg-background p-1 shadow-lg">
          {mentionOptions.map((participant) => (
            <button
              key={participant.userId}
              type="button"
              className="px-3 py-2 text-left text-sm hover:bg-muted"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectMention(participant)}
            >
              @{participant.userTag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
