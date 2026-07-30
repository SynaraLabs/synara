import {
  useMemo,
  type CSSProperties,
} from 'react';

import {
  painRegionCatalog,
} from '../../data/painLocationCatalog';

import type {
  BodySide,
  PainAnatomicalRegion,
  PainLocationPoint,
} from '../../types/migraine.types';


interface PainBodyMapProps {
  selectedPoints?: PainLocationPoint[];

  pendingRegion?:
    PainAnatomicalRegion;

  pendingSide?: BodySide;

  disabled?: boolean;

  onSelect: (
    region: PainAnatomicalRegion,
    side: BodySide,
  ) => void;
}


type MapView =
  | 'front'
  | 'back';


interface HotspotDefinition {
  id: string;

  label: string;

  view: MapView;

  side: BodySide;

  regionTerms: string[];

  x: number;

  y: number;

  width?: number;

  height?: number;
}


interface ResolvedHotspot
  extends HotspotDefinition {
  region: PainAnatomicalRegion;
}


const mapContainerStyle:
  CSSProperties = {
  display: 'grid',

  gridTemplateColumns:
    'repeat(auto-fit, minmax(250px, 1fr))',

  gap: '1rem',

  marginTop: '1rem',
};


const viewStyle:
  CSSProperties = {
  display: 'grid',

  justifyItems: 'center',

  gap: '0.75rem',
};


const figureStyle:
  CSSProperties = {
  position: 'relative',

  width: '250px',

  height: '390px',

  maxWidth: '100%',

  border:
    '1px solid var(--color-border, #d1d5db)',

  borderRadius:
    'var(--radius-medium, 16px)',

  background:
    'var(--color-surface-soft, #f8fafc)',

  overflow: 'hidden',
};


const figureLabelStyle:
  CSSProperties = {
  margin: 0,

  fontWeight: 700,
};


const hotspotBaseStyle:
  CSSProperties = {
  position: 'absolute',

  display: 'grid',

  placeItems: 'center',

  minWidth: '34px',

  minHeight: '34px',

  padding: '0.25rem',

  border:
    '2px solid var(--color-primary, #5667d8)',

  borderRadius: '999px',

  color:
    'var(--color-text-strong, #111827)',

  background:
    'var(--color-surface, #ffffff)',

  fontSize: '0.7rem',

  fontWeight: 700,

  lineHeight: 1,

  cursor: 'pointer',

  transform:
    'translate(-50%, -50%)',

  zIndex: 2,
};


const selectedHotspotStyle:
  CSSProperties = {
  color: '#ffffff',

  background:
    'var(--color-primary, #5667d8)',

  boxShadow:
    '0 0 0 4px rgba(86, 103, 216, 0.18)',
};


const pendingHotspotStyle:
  CSSProperties = {
  outline:
    '3px solid var(--color-warning, #d97706)',

  outlineOffset: '2px',
};


const HOTSPOTS:
  readonly HotspotDefinition[] = [
  // FRONT — HEAD
  {
    id: 'front-top',

    label: 'Parte superior',

    view: 'front',

    side: 'central',

    regionTerms: [
      'topOfHead',
      'top of head',
      'parte superior',
      'coronilla',
    ],

    x: 50,

    y: 12,

    width: 42,

    height: 28,
  },

  {
    id: 'front-forehead',

    label: 'Frente',

    view: 'front',

    side: 'central',

    regionTerms: [
      'forehead',
      'frente',
      'frontal',
    ],

    x: 50,

    y: 23,

    width: 54,

    height: 30,
  },

  {
    id: 'front-left-temple',

    label: 'Sien izquierda',

    view: 'front',

    side: 'left',

    regionTerms: [
      'temple',
      'sien',
      'temporal',
    ],

    x: 28,

    y: 28,
  },

  {
    id: 'front-right-temple',

    label: 'Sien derecha',

    view: 'front',

    side: 'right',

    regionTerms: [
      'temple',
      'sien',
      'temporal',
    ],

    x: 72,

    y: 28,
  },

  {
    id: 'front-left-eye',

    label: 'Ojo izquierdo',

    view: 'front',

    side: 'left',

    regionTerms: [
      'eyeArea',
      'eye area',
      'orbital',
      'alrededor del ojo',
      'ojo',
    ],

    x: 39,

    y: 35,
  },

  {
    id: 'front-right-eye',

    label: 'Ojo derecho',

    view: 'front',

    side: 'right',

    regionTerms: [
      'eyeArea',
      'eye area',
      'orbital',
      'alrededor del ojo',
      'ojo',
    ],

    x: 61,

    y: 35,
  },

  {
    id: 'front-left-behind-eye',

    label: 'Detrás del ojo izquierdo',

    view: 'front',

    side: 'left',

    regionTerms: [
      'behindEye',
      'behind eye',
      'detrás del ojo',
      'detras del ojo',
      'retroocular',
    ],

    x: 36,

    y: 41,

    width: 28,

    height: 24,
  },

  {
    id: 'front-right-behind-eye',

    label: 'Detrás del ojo derecho',

    view: 'front',

    side: 'right',

    regionTerms: [
      'behindEye',
      'behind eye',
      'detrás del ojo',
      'detras del ojo',
      'retroocular',
    ],

    x: 64,

    y: 41,

    width: 28,

    height: 24,
  },

  {
    id: 'front-sinus',

    label: 'Senos paranasales',

    view: 'front',

    side: 'central',

    regionTerms: [
      'sinusArea',
      'sinus',
      'senos paranasales',
      'zona sinusal',
    ],

    x: 50,

    y: 44,

    width: 36,

    height: 24,
  },

  {
    id: 'front-left-cheek',

    label: 'Mejilla izquierda',

    view: 'front',

    side: 'left',

    regionTerms: [
      'cheek',
      'mejilla',
      'pómulo',
      'pomulo',
    ],

    x: 35,

    y: 49,
  },

  {
    id: 'front-right-cheek',

    label: 'Mejilla derecha',

    view: 'front',

    side: 'right',

    regionTerms: [
      'cheek',
      'mejilla',
      'pómulo',
      'pomulo',
    ],

    x: 65,

    y: 49,
  },

  {
    id: 'front-left-ear',

    label: 'Oído izquierdo',

    view: 'front',

    side: 'left',

    regionTerms: [
      'ear',
      'oído',
      'oido',
      'oreja',
    ],

    x: 20,

    y: 42,
  },

  {
    id: 'front-right-ear',

    label: 'Oído derecho',

    view: 'front',

    side: 'right',

    regionTerms: [
      'ear',
      'oído',
      'oido',
      'oreja',
    ],

    x: 80,

    y: 42,
  },

  {
    id: 'front-left-jaw',

    label: 'Mandíbula izquierda',

    view: 'front',

    side: 'left',

    regionTerms: [
      'jaw',
      'mandíbula',
      'mandibula',
      'maxilar',
    ],

    x: 39,

    y: 57,
  },

  {
    id: 'front-right-jaw',

    label: 'Mandíbula derecha',

    view: 'front',

    side: 'right',

    regionTerms: [
      'jaw',
      'mandíbula',
      'mandibula',
      'maxilar',
    ],

    x: 61,

    y: 57,
  },

  {
    id: 'front-teeth',

    label: 'Dientes',

    view: 'front',

    side: 'central',

    regionTerms: [
      'teeth',
      'dientes',
      'dental',
    ],

    x: 50,

    y: 54,

    width: 34,

    height: 24,
  },

  // FRONT — NECK AND SHOULDERS
  {
    id: 'front-left-neck',

    label: 'Cuello izquierdo',

    view: 'front',

    side: 'left',

    regionTerms: [
      'neck',
      'cuello',
      'cervical',
    ],

    x: 43,

    y: 68,
  },

  {
    id: 'front-right-neck',

    label: 'Cuello derecho',

    view: 'front',

    side: 'right',

    regionTerms: [
      'neck',
      'cuello',
      'cervical',
    ],

    x: 57,

    y: 68,
  },

  {
    id: 'front-central-neck',

    label: 'Centro del cuello',

    view: 'front',

    side: 'central',

    regionTerms: [
      'centralNeck',
      'central neck',
      'centro del cuello',
      'cuello central',
    ],

    x: 50,

    y: 72,

    width: 28,

    height: 30,
  },

  {
    id: 'front-left-shoulder',

    label: 'Hombro izquierdo',

    view: 'front',

    side: 'left',

    regionTerms: [
      'shoulder',
      'hombro',
    ],

    x: 26,

    y: 82,

    width: 50,

    height: 30,
  },

  {
    id: 'front-right-shoulder',

    label: 'Hombro derecho',

    view: 'front',

    side: 'right',

    regionTerms: [
      'shoulder',
      'hombro',
    ],

    x: 74,

    y: 82,

    width: 50,

    height: 30,
  },

  // BACK — HEAD
  {
    id: 'back-top',

    label: 'Parte superior',

    view: 'back',

    side: 'central',

    regionTerms: [
      'topOfHead',
      'top of head',
      'parte superior',
      'coronilla',
    ],

    x: 50,

    y: 12,

    width: 42,

    height: 28,
  },

  {
    id: 'back-left-side-head',

    label: 'Lado izquierdo de la cabeza',

    view: 'back',

    side: 'left',

    regionTerms: [
      'sideOfHead',
      'side of head',
      'lateral de la cabeza',
      'costado de la cabeza',
    ],

    x: 31,

    y: 29,

    width: 34,

    height: 44,
  },

  {
    id: 'back-right-side-head',

    label: 'Lado derecho de la cabeza',

    view: 'back',

    side: 'right',

    regionTerms: [
      'sideOfHead',
      'side of head',
      'lateral de la cabeza',
      'costado de la cabeza',
    ],

    x: 69,

    y: 29,

    width: 34,

    height: 44,
  },

  {
    id: 'back-head',

    label: 'Parte posterior',

    view: 'back',

    side: 'central',

    regionTerms: [
      'backOfHead',
      'back of head',
      'nuca',
      'occipital',
      'parte posterior',
    ],

    x: 50,

    y: 36,

    width: 54,

    height: 40,
  },

  {
    id: 'back-base-skull',

    label: 'Base del cráneo',

    view: 'back',

    side: 'central',

    regionTerms: [
      'baseOfSkull',
      'base of skull',
      'base del cráneo',
      'base del craneo',
      'suboccipital',
    ],

    x: 50,

    y: 55,

    width: 46,

    height: 25,
  },

  // BACK — NECK AND UPPER BODY
  {
    id: 'back-left-neck',

    label: 'Cuello izquierdo',

    view: 'back',

    side: 'left',

    regionTerms: [
      'neck',
      'cuello',
      'cervical',
    ],

    x: 42,

    y: 67,

    width: 28,

    height: 38,
  },

  {
    id: 'back-right-neck',

    label: 'Cuello derecho',

    view: 'back',

    side: 'right',

    regionTerms: [
      'neck',
      'cuello',
      'cervical',
    ],

    x: 58,

    y: 67,

    width: 28,

    height: 38,
  },

  {
    id: 'back-central-neck',

    label: 'Centro del cuello',

    view: 'back',

    side: 'central',

    regionTerms: [
      'centralNeck',
      'central neck',
      'centro del cuello',
      'cuello central',
    ],

    x: 50,

    y: 70,

    width: 25,

    height: 42,
  },

  {
    id: 'back-left-trapezius',

    label: 'Trapecio izquierdo',

    view: 'back',

    side: 'left',

    regionTerms: [
      'trapezius',
      'trapecio',
    ],

    x: 35,

    y: 77,

    width: 42,

    height: 34,
  },

  {
    id: 'back-right-trapezius',

    label: 'Trapecio derecho',

    view: 'back',

    side: 'right',

    regionTerms: [
      'trapezius',
      'trapecio',
    ],

    x: 65,

    y: 77,

    width: 42,

    height: 34,
  },

  {
    id: 'back-left-shoulder',

    label: 'Hombro izquierdo',

    view: 'back',

    side: 'left',

    regionTerms: [
      'shoulder',
      'hombro',
    ],

    x: 24,

    y: 83,

    width: 48,

    height: 30,
  },

  {
    id: 'back-right-shoulder',

    label: 'Hombro derecho',

    view: 'back',

    side: 'right',

    regionTerms: [
      'shoulder',
      'hombro',
    ],

    x: 76,

    y: 83,

    width: 48,

    height: 30,
  },

  {
    id: 'back-left-shoulder-blade',

    label: 'Omóplato izquierdo',

    view: 'back',

    side: 'left',

    regionTerms: [
      'shoulderBlade',
      'shoulder blade',
      'omóplato',
      'omoplato',
      'escápula',
      'escapula',
    ],

    x: 36,

    y: 91,

    width: 40,

    height: 28,
  },

  {
    id: 'back-right-shoulder-blade',

    label: 'Omóplato derecho',

    view: 'back',

    side: 'right',

    regionTerms: [
      'shoulderBlade',
      'shoulder blade',
      'omóplato',
      'omoplato',
      'escápula',
      'escapula',
    ],

    x: 64,

    y: 91,

    width: 40,

    height: 28,
  },
];


function normalizeText(
  value: string,
): string {
  return value
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .toLocaleLowerCase('es-AR');
}


function resolveRegion(
  terms: string[],
): PainAnatomicalRegion | undefined {
  const normalizedTerms =
    terms.map(normalizeText);

  const exactMatch =
    painRegionCatalog.find(
      definition => {
        const value =
          normalizeText(
            definition.value,
          );

        return normalizedTerms.includes(
          value,
        );
      },
    );

  if (exactMatch) {
    return exactMatch.value;
  }

  const semanticMatch =
    painRegionCatalog.find(
      definition => {
        const searchableText =
          normalizeText(
            [
              definition.value,
              definition.label,
              ...(
                definition.searchTerms ??
                []
              ),
            ].join(' '),
          );

        return normalizedTerms.some(
          term =>
            searchableText.includes(
              term,
            ),
        );
      },
    );

  return semanticMatch?.value;
}


function resolveHotspots():
  ResolvedHotspot[] {
  return HOTSPOTS.flatMap(
    hotspot => {
      const region =
        resolveRegion(
          hotspot.regionTerms,
        );

      if (!region) {
        return [];
      }

      return [
        {
          ...hotspot,
          region,
        },
      ];
    },
  );
}


function isSamePoint(
  point: PainLocationPoint,
  region: PainAnatomicalRegion,
  side: BodySide,
): boolean {
  return (
    point.region === region &&
    point.side === side
  );
}


function HumanSilhouette({
  view,
}: {
  view: MapView;
}) {
  return (
    <svg
      viewBox="0 0 250 390"
      width="250"
      height="390"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse
        cx="125"
        cy="115"
        rx="64"
        ry="86"
        fill="var(--color-surface, #ffffff)"
        stroke="var(--color-border-strong, #94a3b8)"
        strokeWidth="2"
      />

      {view === 'front' && (
        <>
          <ellipse
            cx="100"
            cy="112"
            rx="11"
            ry="7"
            fill="none"
            stroke="var(--color-border-strong, #94a3b8)"
          />

          <ellipse
            cx="150"
            cy="112"
            rx="11"
            ry="7"
            fill="none"
            stroke="var(--color-border-strong, #94a3b8)"
          />

          <path
            d="M125 120 L119 151 L131 151"
            fill="none"
            stroke="var(--color-border-strong, #94a3b8)"
          />

          <path
            d="M104 170 Q125 182 146 170"
            fill="none"
            stroke="var(--color-border-strong, #94a3b8)"
          />
        </>
      )}

      {view === 'back' && (
        <path
          d="M88 100 Q125 72 162 100"
          fill="none"
          stroke="var(--color-border-strong, #94a3b8)"
        />
      )}

      <path
        d="M101 192 L101 235"
        fill="none"
        stroke="var(--color-border-strong, #94a3b8)"
        strokeWidth="18"
        strokeLinecap="round"
      />

      <path
        d="M149 192 L149 235"
        fill="none"
        stroke="var(--color-border-strong, #94a3b8)"
        strokeWidth="18"
        strokeLinecap="round"
      />

      <path
        d="M24 340 Q34 246 95 229 Q125 218 155 229 Q216 246 226 340"
        fill="var(--color-surface, #ffffff)"
        stroke="var(--color-border-strong, #94a3b8)"
        strokeWidth="2"
      />

      {view === 'back' && (
        <>
          <path
            d="M125 228 L125 360"
            fill="none"
            stroke="var(--color-border, #d1d5db)"
            strokeDasharray="5 5"
          />

          <path
            d="M69 280 Q100 302 125 280"
            fill="none"
            stroke="var(--color-border, #d1d5db)"
          />

          <path
            d="M181 280 Q150 302 125 280"
            fill="none"
            stroke="var(--color-border, #d1d5db)"
          />
        </>
      )}
    </svg>
  );
}


export function PainBodyMap({
  selectedPoints = [],
  pendingRegion,
  pendingSide,
  disabled = false,
  onSelect,
}: PainBodyMapProps) {
  const resolvedHotspots =
    useMemo(
      resolveHotspots,
      [],
    );

  const renderView = (
    view: MapView,
    title: string,
  ) => {
    const hotspots =
      resolvedHotspots.filter(
        hotspot =>
          hotspot.view === view,
      );

    return (
      <section style={viewStyle}>
        <h4 style={figureLabelStyle}>
          {title}
        </h4>

        <div style={figureStyle}>
          <HumanSilhouette
            view={view}
          />

          {hotspots.map(
            hotspot => {
              const isSelected =
                selectedPoints.some(
                  point =>
                    isSamePoint(
                      point,
                      hotspot.region,
                      hotspot.side,
                    ),
                );

              const isPending =
                pendingRegion ===
                  hotspot.region &&
                pendingSide ===
                  hotspot.side;

              const style:
                CSSProperties = {
                ...hotspotBaseStyle,

                left:
                  `${hotspot.x}%`,

                top:
                  `${hotspot.y}%`,

                width:
                  hotspot.width
                    ? `${hotspot.width}px`
                    : undefined,

                height:
                  hotspot.height
                    ? `${hotspot.height}px`
                    : undefined,

                ...(isSelected
                  ? selectedHotspotStyle
                  : {}),

                ...(isPending
                  ? pendingHotspotStyle
                  : {}),
              };

              return (
                <button
                  key={hotspot.id}
                  type="button"
                  style={style}
                  disabled={disabled}
                  aria-label={
                    hotspot.label
                  }
                  aria-pressed={
                    isSelected ||
                    isPending
                  }
                  title={
                    hotspot.label
                  }
                  onClick={() =>
                    onSelect(
                      hotspot.region,
                      hotspot.side,
                    )
                  }
                >
                  <span
                    aria-hidden="true"
                  >
                    ●
                  </span>
                </button>
              );
            },
          )}
        </div>
      </section>
    );
  };


  return (
    <section
      aria-labelledby="pain-map-title"
    >
      <header>
        <h4 id="pain-map-title">
          Mapa del dolor
        </h4>

        <p>
          Tocá una zona para
          seleccionarla. Después podés
          indicar si es la zona
          principal, el punto de inicio
          o una zona adicional.
        </p>
      </header>

      <div style={mapContainerStyle}>
        {renderView(
          'front',
          'Vista frontal',
        )}

        {renderView(
          'back',
          'Vista posterior',
        )}
      </div>
    </section>
  );
}