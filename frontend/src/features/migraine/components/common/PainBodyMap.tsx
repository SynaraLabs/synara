import {
  useState,
} from 'react';

import type {
  BodySide,
  PainAnatomicalRegion,
  PainLocationPoint,
  PainLocationRole,
} from '../../types/migraine.types';

import styles from './PainBodyMap.module.css';

interface PainBodyMapProps {
  selectedPoints?: PainLocationPoint[];
  pendingRegion?: PainAnatomicalRegion;
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

interface MapZone {
  id: string;
  label: string;
  shortLabel: string;
  view: MapView;
  region: PainAnatomicalRegion;
  side: BodySide;
  className: string;
}

const MAP_ZONES:
  readonly MapZone[] = [
  {
    id: 'front-crown',
    label: 'Coronilla',
    shortLabel: 'Coronilla',
    view: 'front',
    region: 'crown',
    side: 'central',
    className: styles.frontCrown,
  },
  {
    id: 'front-forehead-left',
    label: 'Frente izquierda',
    shortLabel: 'Frente',
    view: 'front',
    region: 'forehead',
    side: 'left',
    className:
      styles.frontForeheadLeft,
  },
  {
    id: 'front-forehead-right',
    label: 'Frente derecha',
    shortLabel: 'Frente',
    view: 'front',
    region: 'forehead',
    side: 'right',
    className:
      styles.frontForeheadRight,
  },
  {
    id: 'front-temple-left',
    label: 'Sien izquierda',
    shortLabel: 'Sien',
    view: 'front',
    region: 'temple',
    side: 'left',
    className:
      styles.frontTempleLeft,
  },
  {
    id: 'front-temple-right',
    label: 'Sien derecha',
    shortLabel: 'Sien',
    view: 'front',
    region: 'temple',
    side: 'right',
    className:
      styles.frontTempleRight,
  },
  {
    id: 'front-eye-left',
    label: 'Alrededor del ojo izquierdo',
    shortLabel: 'Ojo',
    view: 'front',
    region: 'aroundEye',
    side: 'left',
    className:
      styles.frontEyeLeft,
  },
  {
    id: 'front-eye-right',
    label: 'Alrededor del ojo derecho',
    shortLabel: 'Ojo',
    view: 'front',
    region: 'aroundEye',
    side: 'right',
    className:
      styles.frontEyeRight,
  },
  {
    id: 'front-sinus',
    label: 'Senos paranasales',
    shortLabel: 'Senos',
    view: 'front',
    region: 'sinus',
    side: 'central',
    className: styles.frontSinus,
  },
  {
    id: 'front-cheek-left',
    label: 'Mejilla izquierda',
    shortLabel: 'Mejilla',
    view: 'front',
    region: 'cheek',
    side: 'left',
    className:
      styles.frontCheekLeft,
  },
  {
    id: 'front-cheek-right',
    label: 'Mejilla derecha',
    shortLabel: 'Mejilla',
    view: 'front',
    region: 'cheek',
    side: 'right',
    className:
      styles.frontCheekRight,
  },
  {
    id: 'front-jaw-left',
    label: 'Mandíbula izquierda',
    shortLabel: 'Mandíbula',
    view: 'front',
    region: 'jaw',
    side: 'left',
    className:
      styles.frontJawLeft,
  },
  {
    id: 'front-jaw-right',
    label: 'Mandíbula derecha',
    shortLabel: 'Mandíbula',
    view: 'front',
    region: 'jaw',
    side: 'right',
    className:
      styles.frontJawRight,
  },
  {
    id: 'front-neck-left',
    label: 'Cuello izquierdo',
    shortLabel: 'Cuello',
    view: 'front',
    region: 'middleNeck',
    side: 'left',
    className:
      styles.frontNeckLeft,
  },
  {
    id: 'front-neck-right',
    label: 'Cuello derecho',
    shortLabel: 'Cuello',
    view: 'front',
    region: 'middleNeck',
    side: 'right',
    className:
      styles.frontNeckRight,
  },
  {
    id: 'back-crown',
    label: 'Coronilla',
    shortLabel: 'Coronilla',
    view: 'back',
    region: 'crown',
    side: 'central',
    className: styles.backCrown,
  },
  {
    id: 'back-parietal-left',
    label: 'Lateral superior izquierdo',
    shortLabel: 'Lateral',
    view: 'back',
    region: 'parietal',
    side: 'left',
    className:
      styles.backParietalLeft,
  },
  {
    id: 'back-parietal-right',
    label: 'Lateral superior derecho',
    shortLabel: 'Lateral',
    view: 'back',
    region: 'parietal',
    side: 'right',
    className:
      styles.backParietalRight,
  },
  {
    id: 'back-occipital-left',
    label: 'Parte posterior izquierda',
    shortLabel: 'Occipital',
    view: 'back',
    region: 'occipital',
    side: 'left',
    className:
      styles.backOccipitalLeft,
  },
  {
    id: 'back-occipital-right',
    label: 'Parte posterior derecha',
    shortLabel: 'Occipital',
    view: 'back',
    region: 'occipital',
    side: 'right',
    className:
      styles.backOccipitalRight,
  },
  {
    id: 'back-skull-left',
    label: 'Base izquierda del cráneo',
    shortLabel: 'Base',
    view: 'back',
    region: 'baseOfSkull',
    side: 'left',
    className:
      styles.backSkullLeft,
  },
  {
    id: 'back-skull-right',
    label: 'Base derecha del cráneo',
    shortLabel: 'Base',
    view: 'back',
    region: 'baseOfSkull',
    side: 'right',
    className:
      styles.backSkullRight,
  },
  {
    id: 'back-neck-left',
    label: 'Cuello izquierdo',
    shortLabel: 'Cuello',
    view: 'back',
    region: 'middleNeck',
    side: 'left',
    className:
      styles.backNeckLeft,
  },
  {
    id: 'back-neck-right',
    label: 'Cuello derecho',
    shortLabel: 'Cuello',
    view: 'back',
    region: 'middleNeck',
    side: 'right',
    className:
      styles.backNeckRight,
  },
  {
    id: 'back-trapezius-left',
    label: 'Trapecio izquierdo',
    shortLabel: 'Trapecio',
    view: 'back',
    region: 'trapezius',
    side: 'left',
    className:
      styles.backTrapeziusLeft,
  },
  {
    id: 'back-trapezius-right',
    label: 'Trapecio derecho',
    shortLabel: 'Trapecio',
    view: 'back',
    region: 'trapezius',
    side: 'right',
    className:
      styles.backTrapeziusRight,
  },
  {
    id: 'back-shoulder-left',
    label: 'Hombro izquierdo',
    shortLabel: 'Hombro',
    view: 'back',
    region: 'shoulder',
    side: 'left',
    className:
      styles.backShoulderLeft,
  },
  {
    id: 'back-shoulder-right',
    label: 'Hombro derecho',
    shortLabel: 'Hombro',
    view: 'back',
    region: 'shoulder',
    side: 'right',
    className:
      styles.backShoulderRight,
  },
];

const roleLabels:
  Partial<Record<
    PainLocationRole,
    string
  >> = {
  primary: 'Principal',
  origin: 'Inicio',
  additional: 'Adicional',
};

type VisualLocationRole =
  | PainLocationRole
  | 'origin-primary';

function findPoints(
  points: PainLocationPoint[],
  zone: MapZone,
): PainLocationPoint[] {
  return points.filter(
    point =>
      point.region === zone.region &&
      point.side === zone.side,
  );
}

function getVisualRole(
  points: PainLocationPoint[],
): VisualLocationRole | undefined {
  const hasOrigin =
    points.some(
      point =>
        point.role === 'origin',
    );

  const hasPrimary =
    points.some(
      point =>
        point.role === 'primary',
    );

  if (hasOrigin && hasPrimary) {
    return 'origin-primary';
  }

  return points[0]?.role;
}

function getRoleLabel(
  role: VisualLocationRole,
): string {
  if (role === 'origin-primary') {
    return 'Inicio y principal';
  }

  return (
    roleLabels[role] ??
    'Seleccionada'
  );
}

export function PainBodyMap({
  selectedPoints = [],
  pendingRegion,
  pendingSide,
  disabled = false,
  onSelect,
}: PainBodyMapProps) {
  const [view, setView] =
    useState<MapView>('front');

  const visibleZones =
    MAP_ZONES.filter(
      zone =>
        zone.view === view,
    );

  return (
    <section
      className={styles.container}
      aria-labelledby="pain-map-title"
    >
      <header
        className={styles.header}
      >
        <div>
          <h4 id="pain-map-title">
            Tocá dónde sentís el dolor
          </h4>

          <p>
            Elegí una vista y tocá
            directamente una zona.
          </p>
        </div>

        <div
          className={styles.viewSwitch}
          role="group"
          aria-label="Vista del mapa anatómico"
        >
          <button
            type="button"
            aria-pressed={
              view === 'front'
            }
            onClick={() =>
              setView('front')
            }
          >
            Frente
          </button>

          <button
            type="button"
            aria-pressed={
              view === 'back'
            }
            onClick={() =>
              setView('back')
            }
          >
            Atrás
          </button>
        </div>
      </header>

      <div
        className={styles.mapStage}
        data-view={view}
      >
        <svg
          className={styles.silhouette}
          viewBox="0 0 320 440"
          aria-hidden="true"
          focusable="false"
        >
          <ellipse
            cx="160"
            cy="135"
            rx="82"
            ry="108"
          />

          {view === 'front' && (
            <g
              className={
                styles.faceDetails
              }
            >
              <path d="M112 128 Q128 117 143 128" />
              <path d="M177 128 Q192 117 208 128" />
              <path d="M160 137 L153 174 L168 174" />
              <path d="M132 199 Q160 215 188 199" />
            </g>
          )}

          {view === 'back' && (
            <g
              className={
                styles.backDetails
              }
            >
              <path d="M104 120 Q160 78 216 120" />
              <path d="M160 245 L160 425" />
            </g>
          )}

          <path
            className={styles.neck}
            d="M127 226 L127 297 Q160 316 193 297 L193 226"
          />

          <path
            className={styles.shoulders}
            d="M34 430 Q45 325 126 297 Q160 314 194 297 Q275 325 286 430 Z"
          />
        </svg>

        {visibleZones.map(
          zone => {
            const points =
              findPoints(
                selectedPoints,
                zone,
              );

            const isPending =
              pendingRegion ===
                zone.region &&
              pendingSide ===
                zone.side;

            const role =
              getVisualRole(points);

            return (
              <button
                key={zone.id}
                type="button"
                className={`${styles.zone} ${zone.className}`}
                disabled={disabled}
                aria-label={
                  role
                    ? `${zone.label}: ${getRoleLabel(
                        role,
                      )}`
                    : zone.label
                }
                aria-pressed={
                  points.length > 0 ||
                  isPending
                }
                data-role={role}
                data-pending={
                  isPending
                    ? 'true'
                    : undefined
                }
                title={zone.label}
                onClick={() =>
                  onSelect(
                    zone.region,
                    zone.side,
                  )
                }
              >
                <span>
                  {zone.shortLabel}
                </span>

                {role && (
                  <small>
                    {getRoleLabel(role)}
                  </small>
                )}
              </button>
            );
          },
        )}
      </div>

      <div
        className={styles.legend}
        aria-label="Leyenda del mapa"
      >
        <span
          className={styles.originLegend}
        >
          Lugar de inicio
        </span>

        <span
          className={styles.primaryLegend}
        >
          Zona principal
        </span>

        <span
          className={styles.additionalLegend}
        >
          Zona adicional
        </span>
      </div>
    </section>
  );
}