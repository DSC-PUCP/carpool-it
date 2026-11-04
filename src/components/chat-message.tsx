import { MapPin, MessageCircle, Reply } from 'lucide-react';
import type { ChatMessage } from '@/hooks/use-realtime-chat';
import { cn } from '@/lib/utils';

const PHONE_REGEX = /(\d{3}[\s-]?\d{3}[\s-]?\d{3})/g;

function extractPhone(text: string): string | null {
  const match = text.match(PHONE_REGEX);
  if (!match) return null;
  return match[0].replace(/[\s-]/g, '');
}

interface MessageActionProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

function MessageAction({ icon, label, href }: MessageActionProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
    >
      {icon}
      {label}
    </a>
  );
}

interface ChatMessageItemProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showHeader: boolean;
  repliedMessage?: ChatMessage;
  onReply?: (message: ChatMessage) => void;
}

export const ChatMessageItem = ({
  message,
  isOwnMessage,
  showHeader,
  repliedMessage,
  onReply,
}: ChatMessageItemProps) => {
  const hasLocation = !!message.location;
  const phone = hasLocation ? null : extractPhone(message.content);
  const visibleContent = hasLocation
    ? message.content.replace(/\s*\[loc:.*?\]/, '')
    : message.content;
  const isImageOnly = Boolean(message.imageUrl && message.content === 'Imagen');

  return (
    <div
      className={`flex mt-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={cn('max-w-[75%] w-fit flex flex-col gap-1', {
          'items-end': isOwnMessage,
        })}
      >
        {showHeader && (
          <div
            className={cn('flex items-center gap-2 text-xs px-3', {
              'justify-end flex-row-reverse': isOwnMessage,
            })}
          >
            <span className="font-medium">{message.user.name}</span>
            <span className="text-foreground/50 text-xs">
              {new Date(message.createdAt).toLocaleTimeString('es-PE', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
          </div>
        )}
        <div
          className={cn(
            'rounded-xl text-sm w-fit',
            isImageOnly ? 'overflow-hidden p-0' : 'px-3 py-2',
            isOwnMessage
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          )}
        >
          {repliedMessage && (
            <div className="mb-1 rounded border-l-2 border-current/50 px-2 py-1 text-xs opacity-75">
              <span className="font-medium">{repliedMessage.user.name}</span>
              <p className="truncate">{repliedMessage.content}</p>
            </div>
          )}
          {message.imageUrl && (
            <img
              src={message.imageUrl}
              alt="Imagen compartida en el chat"
              className="block max-h-64 max-w-full object-cover"
              loading="lazy"
            />
          )}
          {!isImageOnly && visibleContent}
        </div>

        {onReply && (
          <button
            type="button"
            className="flex items-center gap-1 self-start px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onReply(message)}
          >
            <Reply className="size-3" />
            Responder
          </button>
        )}

        {phone && (
          <MessageAction
            icon={<MessageCircle className="size-4 text-green-600" />}
            label={`${phone} · Abrir en WhatsApp`}
            href={`https://wa.me/51${phone}`}
          />
        )}

        {hasLocation && message.location && (
          <MessageAction
            icon={<MapPin className="size-4 text-blue-600" />}
            label="Abrir en Google Maps"
            href={`https://www.google.com/maps?q=${message.location.lat},${message.location.lng}`}
          />
        )}
      </div>
    </div>
  );
};
