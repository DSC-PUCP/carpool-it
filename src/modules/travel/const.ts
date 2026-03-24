export type LatLngTuple = [number, number];
export type LatLngBoundsLiteral = LatLngTuple[];

export const universityCoordinates: LatLngTuple = [
  -12.069695, -77.078125,
] as const;
export const universityLabel = 'PUCP' as const;
export const limitBoundaries: LatLngBoundsLiteral = [
  [-12.5199, -77.1992],
  [-11.5724, -76.6208],
] as const;

export type ReferencePoint = {
  label: string;
  cords: LatLngTuple;
};

/** Convert LatLngTuple [lat, lng] to Map center [lng, lat] */
export const toMapCenter = (tuple: LatLngTuple): [number, number] => [
  tuple[1],
  tuple[0],
];
export const referencePoints: ReferencePoint[] = [
  {
    label: universityLabel,
    cords: universityCoordinates,
  },
  {
    label: 'La Rambla San Borja',
    cords: [-12.088658, -77.005092],
  },
  {
    label: 'Las Palmeras',
    cords: [-12.083364, -76.970717],
  },
  {
    label: 'Centro Empresarial',
    cords: [-12.0917344, -77.0337999],
  },
  {
    label: 'Clinica Ricardo Palma',
    cords: [-12.090402762021041, -77.0182332882948],
  },
  {
    label: 'Británico San Borja',
    cords: [-12.08732049586869, -76.99738460178936],
  },
  {
    label: 'Ovalo Higereta',
    cords: [-12.129198, -77.000736],
  },
  {
    label: 'Cc Arenales',
    cords: [-12.082242, -77.035786],
  },
  {
    label: 'Pentagonito',
    cords: [-12.101109, -76.98669],
  },
  {
    label: 'Naranjal',
    cords: [-11.983086, -77.058512],
  },
  {
    label: 'Gamarra',
    cords: [-12.068412, -77.014714],
  },
  {
    label: 'Ovalo Santa Anita',
    cords: [-12.054944, -76.964307],
  },
  {
    label: 'Plaza Norte',
    cords: [-12.007818, -77.06018],
  },
  {
    label: 'Mun. de Los Olivos',
    cords: [-11.99355, -77.07193],
  },
  {
    label: 'Mun. de Chorrillos',
    cords: [-12.18388, -77.00739],
  },
  {
    label: 'Mall Plaza Angamos',
    cords: [-12.11136, -77.01254],
  },
  {
    label: 'Parque Kennedy',
    cords: [-12.12115, -77.0307],
  },
  {
    label: 'Mun. de Ate',
    cords: [-12.02592, -76.91923],
  },
  {
    label: 'Mun. de La Molina',
    cords: [-12.07809, -76.91721],
  },
  {
    label: 'Mun. de El Agustino',
    cords: [-12.04496, -76.999666],
  },
  {
    label: 'Mun. de San Juan de Lurigancho',
    cords: [-12.02899, -77.01039],
  },
  {
    label: 'Mun. de San Martin de Porres',
    cords: [-12.03025, -77.05738],
  },
  {
    label: 'Mun. de Chosica',
    cords: [-11.92896, -76.69799],
  },
  {
    label: 'Mun. de Villa El Salvador',
    cords: [-12.2131, -76.93698],
  },
  {
    label: 'Mun. de Puente Piedra',
    cords: [-11.86433, -77.07773],
  },
  {
    label: 'Mun. de Ventanilla',
    cords: [-11.87582, -77.12836],
  },
  {
    label: 'Mun. de Comas',
    cords: [-11.95705, -77.04937],
  },
  {
    label: 'Mun. de San Juan de Miraflores',
    cords: [-12.16296, -76.96361],
  },
  {
    label: 'Mun. de Lima',
    cords: [-12.04532, -77.03096],
  },
  {
    label: 'Mun. de Barranco',
    cords: [-12.14907, -77.02173],
  },
  {
    label: 'Mun. de San Isidro',
    cords: [-12.09643, -77.02712],
  },
  {
    label: 'Mun. de Miraflores',
    cords: [-12.12797, -77.02491],
  },
  {
    label: 'Mun. de Lince',
    cords: [-12.08331, -77.0318],
  },
  {
    label: 'Mun. de Breña',
    cords: [-12.05854, -77.04596],
  },
  {
    label: 'Mun. de Rímac',
    cords: [-12.04208, -77.02703],
  },
  {
    label: 'Mun. de Jesus María',
    cords: [-12.07638, -77.04403],
  },
  {
    label: 'Lima Golf Club',
    cords: [-12.10118, -77.04355],
  },
  {
    label: 'Mun. de Independencia',
    cords: [-11.99688, -77.05456],
  },
] as const;
