import { LoginForm } from '@/modules/auth/components/LoginForm';
import { useLogin } from './hooks/useAuth';

const features = [
  {
    title: 'Comparte viajes',
    description: 'Conecta con compañeros que van a tu mismo destino',
    image:
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80',
  },
  {
    title: 'Ahorra dinero',
    description: 'Divide los gastos del viaje entre todos',
    image:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80',
  },
  {
    title: 'Reduce el tráfico',
    description: 'Menos autos, menos congestión, mejor ciudad',
    image:
      'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&q=80',
  },
  {
    title: 'Conoce gente',
    description: 'Haz amigos en el camino a la universidad',
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
  },
];

export default function Auth() {
  const { mutate, isPending, error } = useLogin();
  return (
    <div className="flex h-dvh w-full flex-col lg:flex-row">
      {/* Feature cards – 2×2 vertical on mobile */}
      <div className="grid grid-cols-2 gap-3 p-4 lg:hidden">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="relative aspect-3/4 overflow-hidden rounded-2xl"
          >
            <img
              src={feature.image}
              alt={feature.title}
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3">
              <h3 className="text-sm font-bold text-white">{feature.title}</h3>
              <p className="mt-0.5 text-xs text-white/80">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Login – modern, no card border */}
      <div className="flex flex-1 items-center justify-center p-6 lg:max-w-md lg:p-12">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Bienvenid@!</h1>
            <p className="text-muted-foreground">
              Ingresa con tu correo PUCP para continuar
            </p>
          </div>
          <LoginForm
            error={error}
            isPending={isPending}
            onSubmit={() => mutate('/travel/new')}
          />
        </div>
      </div>

      {/* Feature cards – desktop 2×2 grid, vertical */}
      <div className="hidden flex-1 grid-cols-2 gap-4 p-6 lg:grid">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="relative overflow-hidden rounded-2xl"
          >
            <img
              src={feature.image}
              alt={feature.title}
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <h3 className="text-xl font-bold text-white">{feature.title}</h3>
              <p className="mt-1 text-sm text-white/80">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
