import { es } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';
import type { TravelRoom } from '@/core/models';
import { getRelativeDayLabelInTimeZone, LIMA_TIME_ZONE } from '@/lib/utils';
import { universityLabel } from '@/modules/travel/const';
import {
  farestPointFromCampus,
  getClosestReferencePoint,
} from '@/modules/travel/utils';

export default function RideCardOg(props: TravelRoom) {
  const { direction, datetime, driver, stops } = props;
  const isToCampus = direction === 'to_campus';

  const driverStop = stops.find((s) => s.userRole === 'driver');

  const relevantLocation = driver
    ? driverStop?.stopCoords
    : farestPointFromCampus(stops.map((s) => s.stopCoords));

  const closestRef = relevantLocation
    ? getClosestReferencePoint(relevantLocation)
    : null;

  const relevantLabel = closestRef?.label ?? 'Ubicación';

  const originLabel = isToCampus ? relevantLabel : universityLabel;
  const destinationLabel = isToCampus ? universityLabel : relevantLabel;

  const totalSeats = driver?.seats ?? 0;

  const occupiedSeats = stops.reduce(
    (acc, stop) => (stop.userRole === 'passenger' ? acc + stop.seats : acc),
    0
  );

  const availableSeats = Math.max(0, totalSeats - occupiedSeats);

  const dateObj = new Date(datetime);

  let dateLabel = formatInTimeZone(dateObj, LIMA_TIME_ZONE, "d 'de' MMMM", {
    locale: es,
  });

  const relativeDayLabel = getRelativeDayLabelInTimeZone(dateObj);
  if (relativeDayLabel) dateLabel = relativeDayLabel;

  const timeLabel = formatInTimeZone(dateObj, LIMA_TIME_ZONE, 'hh:mm a', {
    locale: es,
  });

  const priceLabel = driver
    ? new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        maximumFractionDigits: 2,
      }).format(driver.price)
    : null;

  const uniqueStopLocations = new Set(
    stops
      .filter((s) => {
        if (!relevantLocation) return true;

        return (
          s.stopCoords[0] !== relevantLocation[0] ||
          s.stopCoords[1] !== relevantLocation[1]
        );
      })
      .map((s) => `${s.stopCoords[0]},${s.stopCoords[1]}`)
  );

  const passengerStops = uniqueStopLocations.size;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        padding: '56px 120px',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '28px',
          marginBottom: '52px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#6366f1',
              marginBottom: '12px',
            }}
          >
            Carpool IT
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: '44px',
              fontWeight: '800',
              lineHeight: '1.15',
              color: '#1e293b',
            }}
          >
            {isToCampus ? 'Llegada' : 'Salida'} {dateLabel} {timeLabel}
          </div>
        </div>

        {priceLabel && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              backgroundColor: '#6366f1',
              color: 'white',
              padding: '14px 24px',
              borderRadius: '20px',
              fontSize: '36px',
              fontWeight: 'bold',
            }}
          >
            {priceLabel}
          </div>
        )}
      </div>

      {/* Route */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              width: '32px',
              height: '32px',
              borderRadius: '16px',
              backgroundColor: '#6366f1',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: '24px',
                color: '#64748b',
              }}
            >
              Origen
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: '44px',
                fontWeight: 'bold',
                color: '#1e293b',
              }}
            >
              {originLabel}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            position: 'absolute',
            left: '15px',
            top: '50px',
            bottom: '50px',
            width: '2px',
            backgroundColor: '#e2e8f0',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
          }}
        >
          <div
            style={{
              display: 'flex',
              width: '32px',
              height: '32px',
              borderRadius: '16px',
              border: '6px solid #6366f1',
              backgroundColor: 'white',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: '24px',
                color: '#64748b',
              }}
            >
              Destino
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: '44px',
                fontWeight: 'bold',
                color: '#1e293b',
              }}
            >
              {destinationLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '60px',
          paddingTop: '40px',
          borderTop: '2px solid #f1f5f9',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          {driver?.userAvatar ? (
            <img
              src={driver.userAvatar}
              alt={driver.userTag}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50px',
              }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                width: '100px',
                height: '100px',
                borderRadius: '50px',
                backgroundColor: '#f1f5f9',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
              }}
            >
              🚗
            </div>
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#1e293b',
              }}
            >
              {driver?.userTag ?? 'Vehículo Externo'}
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: '30px',
                color: '#64748b',
              }}
            >
              {driver
                ? `***-${driver.plate} • ${driver.color}`
                : 'Taxi / Otros'}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              backgroundColor: driver
                ? availableSeats > 0
                  ? '#dcfce7'
                  : '#fee2e2'
                : '#dbeafe',
              color: driver
                ? availableSeats > 0
                  ? '#166534'
                  : '#991b1b'
                : '#1e40af',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '28px',
              fontWeight: 'bold',
            }}
          >
            {driver
              ? `${availableSeats} asientos disponibles`
              : `${occupiedSeats} pasajeros`}
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: '22px',
              color: '#94a3b8',
            }}
          >
            {passengerStops} {passengerStops === 1 ? 'parada' : 'paradas'} en
            ruta
          </div>
        </div>
      </div>
    </div>
  );
}
