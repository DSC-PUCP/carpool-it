import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TripHistory() {
  return (
    <div className="flex flex-col px-4 pb-4">
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="history" className="flex-1">
            History
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex-1">
            Upcoming
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-0">
          <div className="flex flex-col gap-3">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 px-1">
              Last Month
            </div>

            {/* Trip Card 1 - Passenger */}
            <Card className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <Badge className="mb-2 w-fit">Passenger</Badge>
                  <h4 className="font-bold">To: Campus Main Gate</h4>
                  <p className="text-sm text-muted-foreground">
                    Oct 24 • 09:30 AM
                  </p>
                </div>
                <span className="text-lg font-bold">$4.50</span>
              </div>
              <div className="w-full h-[1px] bg-border" />
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBi5Jukuh_p4nBuNeGokurujWqLVXWiXfptCWB5GkBKaN84JQgYFOg_uljqDImihATDbcXXHAtBUkHFBtoK8vhEBlf7zqKCHAec4sAursB8Z45Vmbm1s4fbjn4N1GPGpMNmmj9j8pqosRoPbxcnwSnmu0eMGhG_xi8WN00L8749tvrHoNgzI_E1KCTI_UjNt4YHVGZk1yhqvylZARN5EHDnKXb10sEX2EknpFx3IWoj9v2tb6e-SxM68bOTfkNONhmfYbsF05b65Lc"
                    alt="Small thumbnail of driver Sarah"
                  />
                  <AvatarFallback>S</AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground">Driven by Sarah</span>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_) => (
                    <Star
                      key={_}
                      className="w-4 h-4 text-yellow-500 fill-yellow-500"
                    />
                  ))}
                </div>
              </div>
            </Card>

            {/* Trip Card 2 - Driver */}
            <Card className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <Badge
                    variant="secondary"
                    className="mb-2 w-fit bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  >
                    Driver
                  </Badge>
                  <h4 className="font-bold">To: Downtown Brooklyn</h4>
                  <p className="text-sm text-muted-foreground">
                    Oct 22 • 06:15 PM
                  </p>
                </div>
                <span className="text-lg font-bold">$12.00</span>
              </div>
              <div className="w-full h-[1px] bg-border" />
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <Avatar className="w-6 h-6 border-2 border-background">
                    <AvatarImage
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVArcCoQKldAUZxPRK0DHsW-GrHEcuX7WWhY-IJAmiflXRiXGbrLOlVUN0lkqgYN7EVAREWCMXJSWvtk5twg3il9LAYeaB0066hKJCrzMcHoA6wrQbfzRliSg6ZoGl0oTsI4o2kWsogB93bgOGW9dHpNn-o9i_eHeV7XrBbRzxi_smb3HpL74t58h8-Kaa1n6f8UJ511orG6c47cfAkNMnp8kJMHqgSJ_b9zHl2o2za9Pfg59SU-2Nr2o5ms-Cc0T9bjoUo5avr8w"
                      alt="Passenger 1 thumbnail"
                    />
                    <AvatarFallback>P1</AvatarFallback>
                  </Avatar>
                  <Avatar className="w-6 h-6 border-2 border-background">
                    <AvatarImage
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7msxabiQ7Q-qEQ5jsSMFKKR-U-7WFmsML8UMKYj9Hw06ugszkdPkzkSdzKiBswId6n-rfqq9NGChYOSowAzCZjgW4EGy5YslPwvHSPPdxvjmRxanLtjLFr0YqRANSM8kaTyX-FtF_BsdEk1VOTKicXyImUH1xkzyz3BIzXfhtTNNzzcQq9-03GnNnBoNdnOIEAImn3z8jqYcdkmpbLqGStI2xU4QCFevkIYpCi2y9olSutUauIL1opovHKbL4cbXoHHlivP4F60Q"
                      alt="Passenger 2 thumbnail"
                    />
                    <AvatarFallback>P2</AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-sm text-foreground pl-1">
                  2 Passengers
                </span>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-0">
          <div className="text-center text-muted-foreground py-8">
            No upcoming trips
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
