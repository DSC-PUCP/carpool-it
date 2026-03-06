export default function TimelineGraph() {
  return (
    <div className="flex flex-col items-center h-full pt-1.5">
      <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20"></div>
      <div className="w-0.5 bg-linear-to-b from-primary/50 to-primary/10 grow my-1"></div>
      <div className="w-2.5 h-2.5 rounded-full border-2 border-primary bg-background-light dark:bg-background-dark"></div>
    </div>
  );
}
