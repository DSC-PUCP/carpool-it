import { Users } from 'lucide-react';

export default function ChipsGrid() {
  return (
    <div className="flex flex-wrap gap-2 pt-2">
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
        <span className="text-green-700 dark:text-green-300 text-sm font-medium">
          S/. 5.00/asiento
        </span>
      </div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <Users className=" text-blue-600 dark:text-blue-400 text-[18px]" />
        <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">
          2 asientos disponibles
        </span>
      </div>
    </div>
  );
}
