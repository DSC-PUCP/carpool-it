import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  List,
  Repeat,
  Star,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PublicProfile as PublicProfileType } from '@/core/models';
import RecurrentTripCard from './components/RecurrentTripCard';

interface PublicProfileProps {
  profile: PublicProfileType;
}

function expandRecurrenceForMonth(rule: string, month: Date): Date[] {
  const parts = rule.replace('RRULE:', '').split(';');
  const freq = parts.find((p) => p.startsWith('FREQ='))?.split('=')[1];
  const byDay = parts.find((p) => p.startsWith('BYDAY='))?.split('=')[1];

  const dayMap: Record<string, number> = {
    SU: 0,
    MO: 1,
    TU: 2,
    WE: 3,
    TH: 4,
    FR: 5,
    SA: 6,
  };

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  if (freq === 'DAILY') return allDays;

  if (freq === 'WEEKLY' && byDay) {
    const targetDays = byDay
      .split(',')
      .map((d) => dayMap[d])
      .filter((d) => d !== undefined);
    return allDays.filter((d) => targetDays.includes(getDay(d)));
  }

  if (freq === 'MONTHLY') {
    return [monthStart];
  }

  return [];
}

export default function PublicProfile({ profile }: PublicProfileProps) {
  const initial = profile.tag.charAt(0).toUpperCase();
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const recurrentDays = expandRecurrenceForMonth(
    profile.recurrentTrips[0]?.recurrenceRule ?? 'RRULE:FREQ=WEEKLY;BYDAY=MO',
    calendarMonth
  );

  return (
    <main className="flex-1 px-4 pt-4 pb-24 space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-primary/20">
          {profile.avatar && <AvatarImage src={profile.avatar} />}
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{profile.tag}</h2>
          <div className="flex items-center gap-3 mt-1">
            {profile.rating != null && (
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm text-muted-foreground">
                  {profile.rating.toFixed(1)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Car size={14} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {profile.ridesCount} viajes
              </span>
            </div>
            {profile.isDriver && (
              <Badge variant="secondary" className="text-xs">
                Conductor
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Repeat size={18} className="text-primary" />
          <h3 className="text-lg font-semibold">Viajes Recurrentes</h3>
        </div>

        {profile.recurrentTrips.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                Este usuario no tiene viajes recurrentes.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="list">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="list" className="flex-1 gap-2">
                <List size={14} />
                Lista
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex-1 gap-2">
                <Calendar size={14} />
                Calendario
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <div className="space-y-3">
                {profile.recurrentTrips.map((trip) => (
                  <RecurrentTripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="calendar">
              <Card>
                <CardContent className="p-4 space-y-3">
                  {/* Month navigation */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setCalendarMonth(subMonths(calendarMonth, 1))
                      }
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-semibold capitalize">
                      {format(calendarMonth, 'MMMM yyyy', { locale: es })}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setCalendarMonth(addMonths(calendarMonth, 1))
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map((d) => (
                      <span
                        key={d}
                        className="text-[10px] text-muted-foreground font-medium"
                      >
                        {d}
                      </span>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({
                      length: (getDay(startOfMonth(calendarMonth)) + 6) % 7,
                    }).map((_, i) => (
                      <div
                        key={`pad-${String(i).padStart(2, '0')}`}
                        className="h-8"
                      />
                    ))}
                    {eachDayOfInterval({
                      start: startOfMonth(calendarMonth),
                      end: endOfMonth(calendarMonth),
                    }).map((day) => {
                      const isRecurrent = recurrentDays.some((d) =>
                        isSameDay(d, day)
                      );
                      return (
                        <div
                          key={day.toISOString()}
                          className={`h-8 flex items-center justify-center rounded-full text-xs ${
                            isRecurrent
                              ? 'bg-primary text-primary-foreground font-bold'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {format(day, 'd')}
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Los días marcados indican viajes recurrentes programados.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  );
}
