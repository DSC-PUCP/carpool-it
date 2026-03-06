import { EllipsisVertical, Share } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SupportSection() {
  return (
    <section id="asistencia" className="scroll-mt-24 px-4 pb-10">
      <div className="rounded-3xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur-sm">
        <div className="space-y-2 pb-4">
          <h2 className="text-xl font-semibold tracking-tight">Asistencia</h2>
          <p className="text-sm text-muted-foreground">
            Preguntas frecuentes y ayuda rápida para seguir usando Carpool It.
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          defaultValue="que-es-carpool-it"
          className="w-full"
        >
          <AccordionItem value="que-es-carpool-it">
            <AccordionTrigger>¿Qué es Carpool It?</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm leading-6 text-muted-foreground">
                Carpool It es un proyecto para facilitar la visibilidad de los
                viajes compartidos en la universidad, con los principios de ser
                ligero, seguro y 100% gratuito.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="interrupciones-del-servicio">
            <AccordionTrigger>Interrupciones del servicio</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>
                  El servicio puede interrumpirse temporalmente por caídas o
                  incidencias en nuestros proveedores principales: Supabase y
                  Cloudflare.
                </p>
                <p>
                  También puede verse afectado si existe mal uso que consuma los
                  recursos disponibles de la capa gratuita, lo que puede limitar
                  funciones como el chat, la autenticación o la carga de datos.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="agregar-a-pantalla-de-inicio">
            <AccordionTrigger>
              Agregar acceso directo a pantalla de inicio
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  Si tu navegador bloquea permisos de ubicación, agregar Carpool
                  It a la pantalla de inicio suele mejorar el acceso rápido y el
                  comportamiento en dispositivos móviles.
                </p>

                <Tabs defaultValue="ios" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="android">Android</TabsTrigger>
                    <TabsTrigger value="ios">iPhone / iPad</TabsTrigger>
                  </TabsList>

                  <TabsContent value="android" className="pt-4">
                    <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                      <li>Abre Carpool It en Chrome.</li>
                      <li>
                        Toca el menú{' '}
                        <EllipsisVertical className="inline size-4 align-text-bottom" />{' '}
                        en la esquina superior derecha.
                      </li>
                      <li>
                        Selecciona Agregar a pantalla principal o Instalar
                        aplicación.
                      </li>
                      <li>Confirma la acción con Agregar.</li>
                    </ol>
                  </TabsContent>

                  <TabsContent value="ios" className="pt-4">
                    <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                      <li>Abre Carpool It en Safari.</li>
                      <li>
                        Toca el botón Compartir{' '}
                        <Share className="inline size-4 align-text-bottom" />.
                      </li>
                      <li>Elige Agregar a pantalla de inicio.</li>
                      <li>
                        Confirma con Agregar para crear el acceso directo.
                      </li>
                    </ol>
                  </TabsContent>
                </Tabs>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
