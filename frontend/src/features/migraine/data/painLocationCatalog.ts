import type {
  AnatomicalPainMap,
  BodySide,
  PainAnatomicalRegion,
  PainLocation,
  PainLocationPoint,
  PainLocationRecord,
  PainLocationRole,
  PainRadiationDirection,
  PainRadiationPath,
  PainRegionCategory,
} from '../types/migraine.types';

export interface PainRegionDefinition {
  value: PainAnatomicalRegion;

  label: string;

  category: PainRegionCategory;

  allowedSides: BodySide[];

  description?: string;

  searchTerms?: string[];

  frequent?: boolean;
}

const LEFT_RIGHT_BILATERAL: BodySide[] = [
  'left',
  'right',
  'bilateral',
  'alternating',
  'unknown',
];

const LEFT_RIGHT_CENTRAL: BodySide[] = [
  'left',
  'right',
  'bilateral',
  'central',
  'alternating',
  'unknown',
];

const CENTRAL_OR_DIFFUSE: BodySide[] = [
  'central',
  'bilateral',
  'unknown',
];

const ANY_SIDE: BodySide[] = [
  'left',
  'right',
  'bilateral',
  'alternating',
  'central',
  'unknown',
];

const defineRegion = (
  value: PainAnatomicalRegion,
  label: string,
  category: PainRegionCategory,
  allowedSides: BodySide[],
  options: Omit<
    PainRegionDefinition,
    'value' | 'label' | 'category' | 'allowedSides'
  > = {},
): PainRegionDefinition => {
  return {
    value,
    label,
    category,
    allowedSides,
    ...options,
  };
};

export const painRegionCategoryLabels: Record<
  PainRegionCategory,
  string
> = {
  head: 'Cabeza',
  eye: 'Ojos y zona ocular',
  face: 'Cara',
  ear: 'Oídos',
  jaw: 'Mandíbula',
  neck: 'Cuello y cervicales',
  upperBody: 'Hombros y espalda alta',
  diffuse: 'Dolor generalizado',
  other: 'Otros',
};

export const bodySideLabels: Record<BodySide, string> = {
  left: 'Izquierda',
  right: 'Derecha',
  bilateral: 'Ambos lados',
  alternating: 'Cambia de lado',
  central: 'Centro',
  unknown: 'No puedo determinarlo',
};

export const painLocationRoleLabels: Record<
  PainLocationRole,
  string
> = {
  primary: 'Zona principal',
  additional: 'Zona adicional',
  origin: 'Punto de inicio',
  radiationTarget: 'Zona hacia donde se extiende',
};

export const painRadiationDirectionLabels: Record<
  PainRadiationDirection,
  string
> = {
  frontToBack: 'De adelante hacia atrás',
  backToFront: 'De atrás hacia adelante',
  eyeToTemple: 'Del ojo hacia la sien',
  templeToEye: 'De la sien hacia el ojo',
  headToNeck: 'De la cabeza hacia el cuello',
  neckToHead: 'Del cuello hacia la cabeza',
  neckToShoulder: 'Del cuello hacia el hombro',
  shoulderToNeck: 'Del hombro hacia el cuello',
  changesSide: 'Cambia de lado',
  diffuseSpread: 'Se extiende de forma difusa',
  other: 'Otro recorrido',
  unknown: 'No puedo determinarlo',
};

export const painRegionCatalog: PainRegionDefinition[] = [
  // ----------------------------------------
  // HEAD
  // ----------------------------------------

  defineRegion(
    'forehead',
    'Frente',
    'head',
    LEFT_RIGHT_CENTRAL,
    {
      frequent: true,
      searchTerms: ['frontal'],
    },
  ),

  defineRegion(
    'temple',
    'Sien',
    'head',
    LEFT_RIGHT_BILATERAL,
    {
      frequent: true,
      searchTerms: ['temporal'],
    },
  ),

  defineRegion(
    'crown',
    'Coronilla',
    'head',
    CENTRAL_OR_DIFFUSE,
    {
      searchTerms: ['parte superior de la cabeza'],
    },
  ),

  defineRegion(
    'parietal',
    'Lateral superior de la cabeza',
    'head',
    LEFT_RIGHT_BILATERAL,
    {
      searchTerms: ['zona parietal', 'costado de la cabeza'],
    },
  ),

  defineRegion(
    'occipital',
    'Parte posterior de la cabeza',
    'head',
    LEFT_RIGHT_CENTRAL,
    {
      frequent: true,
      searchTerms: ['occipital', 'atrás de la cabeza'],
    },
  ),

  defineRegion(
    'baseOfSkull',
    'Base del cráneo',
    'head',
    LEFT_RIGHT_CENTRAL,
    {
      frequent: true,
      searchTerms: ['unión entre cabeza y cuello'],
    },
  ),

  defineRegion(
    'wholeHead',
    'Toda la cabeza',
    'head',
    CENTRAL_OR_DIFFUSE,
    {
      frequent: true,
      searchTerms: ['dolor general', 'cabeza completa'],
    },
  ),

  // ----------------------------------------
  // EYE
  // ----------------------------------------

  defineRegion(
    'aroundEye',
    'Alrededor del ojo',
    'eye',
    LEFT_RIGHT_BILATERAL,
    {
      frequent: true,
      searchTerms: ['zona periocular'],
    },
  ),

  defineRegion(
    'behindEye',
    'Detrás del ojo',
    'eye',
    LEFT_RIGHT_BILATERAL,
    {
      frequent: true,
      searchTerms: ['dolor retroocular'],
    },
  ),

  defineRegion(
    'eyebrow',
    'Ceja',
    'eye',
    LEFT_RIGHT_BILATERAL,
  ),

  defineRegion(
    'eyeSocket',
    'Cuenca del ojo',
    'eye',
    LEFT_RIGHT_BILATERAL,
    {
      searchTerms: ['órbita ocular'],
    },
  ),

  // ----------------------------------------
  // FACE
  // ----------------------------------------

  defineRegion(
    'cheek',
    'Mejilla',
    'face',
    LEFT_RIGHT_BILATERAL,
  ),

  defineRegion(
    'sinus',
    'Zona de los senos paranasales',
    'face',
    LEFT_RIGHT_CENTRAL,
    {
      searchTerms: ['senos', 'presión sinusal'],
    },
  ),

  defineRegion(
    'nose',
    'Nariz',
    'face',
    CENTRAL_OR_DIFFUSE,
  ),

  defineRegion(
    'face',
    'Cara',
    'face',
    LEFT_RIGHT_BILATERAL,
  ),

  defineRegion(
    'teeth',
    'Dientes',
    'face',
    LEFT_RIGHT_BILATERAL,
  ),

  // ----------------------------------------
  // EAR AND JAW
  // ----------------------------------------

  defineRegion(
    'ear',
    'Oído',
    'ear',
    LEFT_RIGHT_BILATERAL,
  ),

  defineRegion(
    'aroundEar',
    'Alrededor del oído',
    'ear',
    LEFT_RIGHT_BILATERAL,
  ),

  defineRegion(
    'jaw',
    'Mandíbula',
    'jaw',
    LEFT_RIGHT_BILATERAL,
    {
      frequent: true,
    },
  ),

  defineRegion(
    'temporomandibularJoint',
    'Articulación de la mandíbula',
    'jaw',
    LEFT_RIGHT_BILATERAL,
    {
      frequent: true,
      searchTerms: [
        'atm',
        'articulación temporomandibular',
      ],
    },
  ),

  // ----------------------------------------
  // NECK
  // ----------------------------------------

  defineRegion(
    'upperNeck',
    'Parte alta del cuello',
    'neck',
    LEFT_RIGHT_CENTRAL,
    {
      frequent: true,
      searchTerms: ['cervical alta'],
    },
  ),

  defineRegion(
    'middleNeck',
    'Parte media del cuello',
    'neck',
    LEFT_RIGHT_CENTRAL,
    {
      frequent: true,
      searchTerms: ['cervical media'],
    },
  ),

  defineRegion(
    'lowerNeck',
    'Parte baja del cuello',
    'neck',
    LEFT_RIGHT_CENTRAL,
    {
      frequent: true,
      searchTerms: ['cervical baja'],
    },
  ),

  // ----------------------------------------
  // UPPER BODY
  // ----------------------------------------

  defineRegion(
    'trapezius',
    'Trapecio',
    'upperBody',
    LEFT_RIGHT_BILATERAL,
    {
      frequent: true,
    },
  ),

  defineRegion(
    'shoulder',
    'Hombro',
    'upperBody',
    LEFT_RIGHT_BILATERAL,
  ),

  defineRegion(
    'shoulderBlade',
    'Omóplato',
    'upperBody',
    LEFT_RIGHT_BILATERAL,
    {
      searchTerms: ['escápula'],
    },
  ),

  // ----------------------------------------
  // OTHER
  // ----------------------------------------

  defineRegion(
    'diffuse',
    'Dolor difuso',
    'diffuse',
    ANY_SIDE,
    {
      frequent: true,
      searchTerms: [
        'no está localizado',
        'se extiende por varias zonas',
      ],
    },
  ),

  defineRegion(
    'other',
    'Otra zona',
    'other',
    ANY_SIDE,
  ),
];

export const painRegionCatalogById = Object.fromEntries(
  painRegionCatalog.map(definition => [
    definition.value,
    definition,
  ]),
) as Record<PainAnatomicalRegion, PainRegionDefinition>;

export function getPainRegionDefinition(
  region: PainAnatomicalRegion,
): PainRegionDefinition {
  return painRegionCatalogById[region];
}

export function getPainRegionsByCategory(
  category: PainRegionCategory,
): PainRegionDefinition[] {
  return painRegionCatalog.filter(
    definition => definition.category === category,
  );
}

export function getFrequentPainRegions(): PainRegionDefinition[] {
  return painRegionCatalog.filter(
    definition => definition.frequent,
  );
}

export function getAvailableSidesForRegion(
  region: PainAnatomicalRegion,
): BodySide[] {
  return getPainRegionDefinition(region).allowedSides;
}

export function createPainLocationPoint(
  region: PainAnatomicalRegion,
  side: BodySide = 'unknown',
  role: PainLocationRole = 'additional',
): PainLocationPoint {
  return {
    region,
    category: getPainRegionDefinition(region).category,
    side,
    role,
  };
}


// ------------------------------------------
// LEGACY LOCATION COMPATIBILITY
// ------------------------------------------

export const legacyPainLocationMap: Record<
  PainLocation,
  PainLocationPoint
> = {
  front: createPainLocationPoint(
    'forehead',
    'central',
  ),

  temple: createPainLocationPoint(
    'temple',
    'unknown',
  ),

  eye: createPainLocationPoint(
    'aroundEye',
    'unknown',
  ),

  neck: createPainLocationPoint(
    'middleNeck',
    'unknown',
  ),

  general: createPainLocationPoint(
    'wholeHead',
    'unknown',
  ),

  forehead: createPainLocationPoint(
    'forehead',
    'central',
  ),

  rightTemple: createPainLocationPoint(
    'temple',
    'right',
  ),

  leftTemple: createPainLocationPoint(
    'temple',
    'left',
  ),

  bothTemples: createPainLocationPoint(
    'temple',
    'bilateral',
  ),

  rightEyeArea: createPainLocationPoint(
    'aroundEye',
    'right',
  ),

  leftEyeArea: createPainLocationPoint(
    'aroundEye',
    'left',
  ),

  behindRightEye: createPainLocationPoint(
    'behindEye',
    'right',
  ),

  behindLeftEye: createPainLocationPoint(
    'behindEye',
    'left',
  ),

  topOfHead: createPainLocationPoint(
    'crown',
    'central',
  ),

  backOfHead: createPainLocationPoint(
    'occipital',
    'central',
  ),

  baseOfSkull: createPainLocationPoint(
    'baseOfSkull',
    'central',
  ),

  rightSideOfHead: createPainLocationPoint(
    'parietal',
    'right',
  ),

  leftSideOfHead: createPainLocationPoint(
    'parietal',
    'left',
  ),

  wholeHead: createPainLocationPoint(
    'wholeHead',
    'bilateral',
  ),

  rightJaw: createPainLocationPoint(
    'jaw',
    'right',
  ),

  leftJaw: createPainLocationPoint(
    'jaw',
    'left',
  ),

  bothJaws: createPainLocationPoint(
    'jaw',
    'bilateral',
  ),

  rightCheek: createPainLocationPoint(
    'cheek',
    'right',
  ),

  leftCheek: createPainLocationPoint(
    'cheek',
    'left',
  ),

  sinusArea: createPainLocationPoint(
    'sinus',
    'central',
  ),

  teeth: createPainLocationPoint(
    'teeth',
    'unknown',
  ),

  rightNeck: createPainLocationPoint(
    'middleNeck',
    'right',
  ),

  leftNeck: createPainLocationPoint(
    'middleNeck',
    'left',
  ),

  centralNeck: createPainLocationPoint(
    'middleNeck',
    'central',
  ),

  rightTrapezius: createPainLocationPoint(
    'trapezius',
    'right',
  ),

  leftTrapezius: createPainLocationPoint(
    'trapezius',
    'left',
  ),

  rightShoulder: createPainLocationPoint(
    'shoulder',
    'right',
  ),

  leftShoulder: createPainLocationPoint(
    'shoulder',
    'left',
  ),

  rightShoulderBlade: createPainLocationPoint(
    'shoulderBlade',
    'right',
  ),

  leftShoulderBlade: createPainLocationPoint(
    'shoulderBlade',
    'left',
  ),

  diffuse: createPainLocationPoint(
    'diffuse',
    'unknown',
  ),

  other: createPainLocationPoint(
    'other',
    'unknown',
  ),
};

export function convertLegacyPainLocation(
  location: PainLocation,
  role: PainLocationRole = 'additional',
): PainLocationPoint {
  return {
    ...legacyPainLocationMap[location],
    role,
  };
}

function locationPointKey(
  point: PainLocationPoint,
): string {
  return [
    point.region,
    point.side ?? 'unknown',
    point.role ?? 'additional',
  ].join(':');
}

function removeDuplicatePoints(
  points: PainLocationPoint[],
): PainLocationPoint[] {
  const uniquePoints = new Map<
    string,
    PainLocationPoint
  >();

  points.forEach(point => {
    uniquePoints.set(
      locationPointKey(point),
      point,
    );
  });

  return Array.from(uniquePoints.values());
}

export function convertLegacyLocationRecord(
  record: PainLocationRecord,
): AnatomicalPainMap {
  if (record.anatomicalMap) {
    return record.anatomicalMap;
  }

  const primary = record.primary
    ? convertLegacyPainLocation(
        record.primary,
        'primary',
      )
    : undefined;

  const additional = removeDuplicatePoints(
    record.additional.map(location =>
      convertLegacyPainLocation(
        location,
        'additional',
      ),
    ),
  );

  const origin = record.onsetPoint
    ? {
        ...record.onsetPoint,
        role: 'origin' as const,
      }
    : undefined;

  return {
    primary,
    additional,
    origin,
    radiation: record.radiationPaths,
    spreadPattern: record.spreadPattern,
    changesSide:
      record.side === 'alternating' ||
      record.changedOverTime,
    notes: record.notes,
  };
}


// ------------------------------------------
// RADIATION
// ------------------------------------------

export function createPainRadiationPath(
  from: PainLocationPoint,
  to: PainLocationPoint,
  direction: PainRadiationDirection = 'unknown',
  notes?: string,
): PainRadiationPath {
  return {
    from: {
      ...from,
      role: 'origin',
    },
    to: {
      ...to,
      role: 'radiationTarget',
    },
    direction,
    notes,
  };
}


// ------------------------------------------
// DISPLAY HELPERS
// ------------------------------------------

export function formatPainLocationPoint(
  point: PainLocationPoint,
): string {
  const regionLabel =
    getPainRegionDefinition(
      point.region,
    ).label;

  const sideLabel = point.side
    ? bodySideLabels[point.side]
    : undefined;

  if (
    !sideLabel ||
    point.side === 'unknown'
  ) {
    return regionLabel;
  }

  return `${regionLabel} · ${sideLabel}`;
}

export function formatPainRadiationPath(
  path: PainRadiationPath,
): string {
  return `${formatPainLocationPoint(
    path.from,
  )} → ${formatPainLocationPoint(
    path.to,
  )}`;
}