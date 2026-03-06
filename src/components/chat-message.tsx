import { MapPin, MessageCircle } from 'lucide-react';
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
}

export const ChatMessageItem = ({
  message,
  isOwnMessage,
  showHeader,
}: ChatMessageItemProps) => {
  const phone = extractPhone(message.content);
  const hasLocation = !!message.location;

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
            'py-2 px-3 rounded-xl text-sm w-fit',
            isOwnMessage
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          )}
        >
          {hasLocation
            ? message.content.replace(/\s*\[loc:.*?\]/, '')
            : message.content}
        </div>

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
