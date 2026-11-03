import { Torus } from 'lucide-react';
import { motion } from 'motion/react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { TourFlowPrompt } from '../types';

type TourPromptDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: TourFlowPrompt;
  onStart: () => void;
  onSkip: () => void;
};

/**
 * Generic "do you want the tour?" dialog. Copy comes from the flow definition,
 * so no route needs to duplicate this UI.
 */
export function TourPromptDialog({
  open,
  onOpenChange,
  prompt,
  onStart,
  onSkip,
}: TourPromptDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md p-6">
        <AlertDialogHeader className="flex flex-col items-center justify-center">
          <div className="relative mb-4">
            <motion.div
              initial={{ scale: 0.7, filter: 'blur(10px)' }}
              animate={{
                scale: 1,
                filter: 'blur(0px)',
                y: [0, -8, 0],
                rotate: [42, 48, 42],
              }}
              transition={{
                duration: 0.4,
                ease: 'easeOut',
                y: {
                  duration: 2.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                },
                rotate: {
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                },
              }}
            >
              <Torus className="size-32 stroke-1 text-primary" />
            </motion.div>
          </div>
          <AlertDialogTitle className="text-center text-xl font-medium">
            {prompt.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground mt-2 text-center text-sm">
            {prompt.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-6 space-y-3">
          <Button onClick={onStart} className="w-full">
            {prompt.startLabel ?? 'Iniciar recorrido'}
          </Button>
          <Button onClick={onSkip} variant="ghost" className="w-full">
            {prompt.skipLabel ?? 'Omitir'}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
