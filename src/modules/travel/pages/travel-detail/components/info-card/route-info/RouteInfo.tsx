import TimelineGraph from './TimelineGraph';

export default function RouteInfo() {
  return (
    <div className="grid grid-cols-[24px_1fr] gap-x-4">
      <TimelineGraph />
      {/* <!-- Timeline Content --> */}
      <div className="flex flex-col gap-8 pb-1">
        {/* <!-- Origin --> */}
        <div className="flex flex-col">
          <div className="flex justify-between items-start">
            <span className="text-base font-bold">09:00 AM</span>
            <span className="text-sm font-bold bg-primary/10 px-2 py-0.5 rounded text-center">
              Punto de Partida
            </span>
          </div>
          <p className=" mt-0.5">University Library</p>
          <p className="text-muted-foreground text-sm mt-0.5">
            Main Entrance, Pickup Zone A
          </p>
        </div>
        {/* <!-- Destination --> */}
        <div className="flex flex-col">
          <div className="flex justify-between items-start">
            <span className="text-base font-bold">09:45 AM</span>
            <span className="text-sm font-medium">~45 min</span>
          </div>
          <p className="text-sm mt-0.5">Downtown Station</p>
          <p className="text-muted-foreground text-sm mt-0.5">
            Drop-off at North Gate
          </p>
        </div>
      </div>
    </div>
  );
}
