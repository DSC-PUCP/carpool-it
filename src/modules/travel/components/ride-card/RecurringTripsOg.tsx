import type { RecurringTrip } from '@/core/models';

interface RecurringTripsOgProps {
  trips: RecurringTrip[];
}

const dayLabels: Record<string, string> = {
  MO: 'L',
  TU: 'Ma',
  WE: 'Mi',
  TH: 'J',
  FR: 'V',
  SA: 'S',
  SU: 'D',
};

const dayLabelsThreeCharacters: Record<string, string> = {
  MO: 'Lun',
  TU: 'Mar',
  WE: 'Mie',
  TH: 'Jue',
  FR: 'Vie',
  SA: 'Sab',
  SU: 'Dom',
};

function formatTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, '0')} ${period}`;
}

function formatDays(rule: string) {
  const parts = rule.replace('RRULE:', '').split(';');
  const frequency = parts
    .find((part) => part.startsWith('FREQ='))
    ?.split('=')[1];
  if (frequency === 'DAILY') return 'Diario';
  if (frequency === 'MONTHLY') return 'Mensual';

  const byDay = parts.find((part) => part.startsWith('BYDAY='))?.split('=')[1];
  const days = byDay?.split(',');
  const labels = days && days.length < 4 ? dayLabelsThreeCharacters : dayLabels;

  return days?.map((day) => labels[day] ?? day).join(', ') ?? 'Diario';
}

function RecurringTripRow({ trip }: { trip: RecurringTrip }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1px',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: '21px',
          lineHeight: '1.1',
          color: '#334155',
        }}
      >
        {formatDays(trip.recurrenceRule)}
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: '22px',
          lineHeight: '1.1',
          fontWeight: 'bold',
          color: '#0f172a',
        }}
      >
        {formatTime(trip.tripTime)}
      </div>
    </div>
  );
}

export default function RecurringTripsOg({ trips }: RecurringTripsOgProps) {
  if (trips.length === 0) return null;

  const arrivals = trips
    .filter((trip) => trip.direction === 'to_campus')
    .slice(0, 2);
  const departures = trips
    .filter((trip) => trip.direction !== 'to_campus')
    .slice(0, 2);
  const hiddenTrips =
    Math.max(
      0,
      trips.filter((trip) => trip.direction === 'to_campus').length - 2
    ) +
    Math.max(
      0,
      trips.filter((trip) => trip.direction !== 'to_campus').length - 2
    );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '460px',
        boxSizing: 'border-box',
        flexShrink: 0,
        alignSelf: 'stretch',
        padding: '2px 24px 14px',
        backgroundColor: '#f8fafc',
        borderRadius: '14px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          fontSize: '31px',
          fontWeight: 'bold',
          color: '#64748b',
          height: '36px',
          lineHeight: '1.2',
          marginBottom: '16px',
          position: 'relative',
          top: '-20px',
        }}
      >
        Viajes programados
      </div>
      <div
        style={{
          display: 'flex',
          gap: '20px',
          flex: '0 0 auto',
          minHeight: 0,
        }}
      >
        {[
          { label: 'Llegadas', trips: arrivals },
          { label: 'Salidas', trips: departures },
        ].map((group, index) => (
          <div
            key={group.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              flex: '1 0 0',
              width: 0,
              minWidth: 0,
              boxSizing: 'border-box',
              flexShrink: 0,
              paddingLeft: index === 1 ? '24px' : 0,
              borderLeft: index === 1 ? '2px solid #cbd5e1' : 'none',
              paddingTop: '42px',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: '29px',
                lineHeight: '1.2',
                fontWeight: 'bold',
                color: '#0f172a',
                position: 'absolute',
                top: '0',
                left: index === 1 ? '24px' : '0',
              }}
            >
              {group.label}
            </div>
            {group.trips.map((trip) => (
              <RecurringTripRow key={trip.id} trip={trip} />
            ))}
          </div>
        ))}
      </div>

      {hiddenTrips > 0 && (
        <div
          style={{
            display: 'flex',
            fontSize: '21px',
            color: '#64748b',
            flexShrink: 0,
            marginTop: '10px',
          }}
        >
          +{hiddenTrips} viaje{hiddenTrips > 1 ? 's' : ''} más
        </div>
      )}
    </div>
  );
}
