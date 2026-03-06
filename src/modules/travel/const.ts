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
] as const;
