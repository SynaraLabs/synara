import {
  useState,
} from 'react';

import type {
  AnatomicalPainMap,
  MigraineEpisode,
  PainIntensity,
} from '../../migraine/types/migraine.types';

import {
  ClinicalPhasePanel,
} from '../../migraine/components/common/ClinicalPhasePanel';

import {
  PainLocationSelector,
} from '../../migraine/components/common/PainLocationSelector';

import {
  getRetrospectivePhaseSymptoms,
  setRetrospectivePhaseNotes,
  setRetrospectivePhaseSymptoms,
} from '../utils/retrospectiveEpisode';

import {
  RetrospectiveFunctionalCapacityEditor,
} from './RetrospectiveFunctionalCapacityEditor';

import {
  RetrospectiveMedicationEditor,
} from './RetrospectiveMedicationEditor';

import {
  RetrospectiveNonPharmacologicalEditor,
} from './RetrospectiveNonPharmacologicalEditor';

import {
  RetrospectiveSymptomSelector,
} from './RetrospectiveSymptomSelector';

import styles from './RetrospectiveCrisisPanels.module.css';

interface Props {
  episode: MigraineEpisode;

  onChange: (
    episode: MigraineEpisode,
  ) => void;
}

type CrisisPanelId =
  | 'intensity'
  | 'symptoms'
  | 'location'
  | 'medication'
  | 'relief'
  | 'capacity'
  | 'notes';

const PAIN_LEVELS:
  readonly PainIntensity[] = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
];

const formatCount = (
  count: number,
  singular: string,
  plural: string,
): string => {
  if (count === 0) {
    return 'Sin registrar';
  }

  return `${count} ${
    count === 1
      ? singular
      : plural
  }`;
};

const getLocationCount = (
  location: AnatomicalPainMap,
): number => {
  const locations =
    new Set<string>();

  const addPoint = (
    point:
      | AnatomicalPainMap['primary']
      | undefined,
  ) => {
    if (!point) {
      return;
    }

    locations.add(
      `${point.region}:${
        point.side ?? 'unknown'
      }`,
    );
  };

  addPoint(location.primary);
  addPoint(location.origin);

  (
    location.additional ?? []
  ).forEach(addPoint);

  return locations.size;
};

const getEventCount = (
  episode: MigraineEpisode,
  kind:
    | 'medication'
    | 'nonPharmacological'
    | 'functionalCapacity',
): number => {
  return (
    episode.crisis.events ?? []
  ).filter(event => {
    if (kind === 'medication') {
      return (
        event.type ===
        'medication'
      );
    }

    return (
      event.type === 'note' &&
      event.data.kind === kind
    );
  }).length;
};

export function RetrospectiveCrisisPanels({
  episode,
  onChange,
}: Props) {
  const [
    activePanel,
    setActivePanel,
  ] = useState<
    CrisisPanelId | null
  >(null);

  const symptoms =
    getRetrospectivePhaseSymptoms(
      episode,
      'crisis',
    );

  const anatomicalLocation:
    AnatomicalPainMap =
    episode.crisis
      .anatomicalLocation ??
    episode.crisis
      .locationDetails
      ?.anatomicalMap ?? {
      additional: [],
      radiation: [],
    };

  const notes =
    episode.crisis.notes ?? '';

  const handlePanelChange = (
    panel: CrisisPanelId,
    isOpen: boolean,
  ) => {
    setActivePanel(current => {
      if (isOpen) {
        return panel;
      }

      return current === panel
        ? null
        : current;
    });
  };

  const closePanel = () => {
    setActivePanel(null);
  };

  const handlePainChange = (
    intensity: PainIntensity,
  ) => {
    onChange({
      ...episode,

      crisis: {
        ...episode.crisis,

        intensity,
      },
    });
  };

  const handleLocationChange = (
    location: AnatomicalPainMap,
  ) => {
    onChange({
      ...episode,

      crisis: {
        ...episode.crisis,

        anatomicalLocation:
          location,

        locationDetails: {
          ...(episode.crisis
            .locationDetails ?? {
            additional: [],
          }),

          anatomicalMap:
            location,
        },
      },
    });
  };

  return (
    <div className={styles.list}>
      <ClinicalPhasePanel
        id="retrospective-crisis-intensity-title"
        eyebrow="Dolor"
        title="Intensidad máxima"
        description="Indicá la mayor intensidad que alcanzó esta crisis."
        icon="◆"
        status={`${episode.crisis.intensity}/10`}
        isOpen={
          activePanel ===
          'intensity'
        }
        onOpenChange={isOpen =>
          handlePanelChange(
            'intensity',
            isOpen,
          )
        }
      >
        <section
          className={
            styles.pain
          }
          aria-labelledby="retrospective-crisis-intensity-title"
        >
          <div>
            <h4>
              Intensidad máxima
            </h4>

            <strong>
              {
                episode.crisis
                  .intensity
              }
              /10
            </strong>
          </div>

          <div
            className={
              styles.painLevels
            }
            role="group"
            aria-label="Intensidad máxima del dolor"
          >
            {PAIN_LEVELS.map(
              intensity => (
                <button
                  key={intensity}
                  type="button"
                  aria-pressed={
                    episode.crisis
                      .intensity ===
                    intensity
                  }
                  onClick={() =>
                    handlePainChange(
                      intensity,
                    )
                  }
                >
                  {intensity}
                </button>
              ),
            )}
          </div>

          <div
            className={
              styles.completion
            }
          >
            <button
              type="button"
              onClick={closePanel}
            >
              Listo
            </button>
          </div>
        </section>
      </ClinicalPhasePanel>

      <ClinicalPhasePanel
        id="retrospective-crisis-symptoms-title"
        eyebrow="Manifestaciones"
        title="Síntomas"
        description="Completá los síntomas que recordaste después."
        icon="○"
        status={formatCount(
          symptoms.length,
          'seleccionado',
          'seleccionados',
        )}
        isOpen={
          activePanel ===
          'symptoms'
        }
        onOpenChange={isOpen =>
          handlePanelChange(
            'symptoms',
            isOpen,
          )
        }
      >
        <RetrospectiveSymptomSelector
          phase="crisis"
          value={symptoms}
          onChange={
            updatedSymptoms =>
              onChange(
                setRetrospectivePhaseSymptoms(
                  episode,
                  'crisis',
                  updatedSymptoms,
                ),
              )
          }
        />

        <div
          className={
            styles.completion
          }
        >
          <button
            type="button"
            onClick={closePanel}
          >
            Listo
          </button>
        </div>
      </ClinicalPhasePanel>

      <ClinicalPhasePanel
        id="retrospective-crisis-location-title"
        eyebrow="Dolor"
        title="Localización"
        description="Indicá dónde comenzó y hacia dónde se extendió."
        icon="⌖"
        status={formatCount(
          getLocationCount(
            anatomicalLocation,
          ),
          'zona',
          'zonas',
        )}
        isOpen={
          activePanel ===
          'location'
        }
        onOpenChange={isOpen =>
          handlePanelChange(
            'location',
            isOpen,
          )
        }
      >
        <PainLocationSelector
          value={
            anatomicalLocation
          }
          onChange={
            handleLocationChange
          }
          title="¿Dónde sentiste el dolor?"
        />

        <div
          className={
            styles.completion
          }
        >
          <button
            type="button"
            onClick={closePanel}
          >
            Listo
          </button>
        </div>
      </ClinicalPhasePanel>

      <ClinicalPhasePanel
        id="retrospective-crisis-medication-title"
        eyebrow="Tratamiento"
        title="Medicación"
        description="Agregá las tomas realizadas durante la crisis."
        icon="+"
        status={formatCount(
          getEventCount(
            episode,
            'medication',
          ),
          'toma',
          'tomas',
        )}
        isOpen={
          activePanel ===
          'medication'
        }
        onOpenChange={isOpen =>
          handlePanelChange(
            'medication',
            isOpen,
          )
        }
      >
        <RetrospectiveMedicationEditor
          episode={episode}
          onChange={onChange}
        />
      </ClinicalPhasePanel>

      <ClinicalPhasePanel
        id="retrospective-crisis-relief-title"
        eyebrow="Alivio"
        title="Medidas no farmacológicas"
        description="Reposo, oscuridad, frío, hidratación u otras medidas."
        icon="◇"
        status={formatCount(
          getEventCount(
            episode,
            'nonPharmacological',
          ),
          'registro',
          'registros',
        )}
        isOpen={
          activePanel ===
          'relief'
        }
        onOpenChange={isOpen =>
          handlePanelChange(
            'relief',
            isOpen,
          )
        }
      >
        <RetrospectiveNonPharmacologicalEditor
          episode={episode}
          onChange={onChange}
        />
      </ClinicalPhasePanel>

      <ClinicalPhasePanel
        id="retrospective-crisis-capacity-title"
        eyebrow="Impacto"
        title="Capacidad funcional"
        description="Registrá cuánto limitó tus actividades durante la crisis."
        icon="↔"
        status={formatCount(
          getEventCount(
            episode,
            'functionalCapacity',
          ),
          'registro',
          'registros',
        )}
        isOpen={
          activePanel ===
          'capacity'
        }
        onOpenChange={isOpen =>
          handlePanelChange(
            'capacity',
            isOpen,
          )
        }
      >
        <RetrospectiveFunctionalCapacityEditor
          episode={episode}
          onChange={onChange}
        />
      </ClinicalPhasePanel>

      <ClinicalPhasePanel
        id="retrospective-crisis-notes-title"
        eyebrow="Información adicional"
        title="Notas"
        description="Agregá cualquier detalle que recordaste después."
        icon="✎"
        status={
          notes.trim()
            ? 'Con notas'
            : 'Sin registrar'
        }
        isOpen={
          activePanel ===
          'notes'
        }
        onOpenChange={isOpen =>
          handlePanelChange(
            'notes',
            isOpen,
          )
        }
      >
        <label
          className={
            styles.notes
          }
        >
          <span>
            Notas de la crisis
          </span>

          <textarea
            value={notes}
            rows={4}
            placeholder="Agregá algo que recordaste después..."
            onChange={event =>
              onChange(
                setRetrospectivePhaseNotes(
                  episode,
                  'crisis',
                  event.target.value,
                ),
              )
            }
          />
        </label>

        <div
          className={
            styles.completion
          }
        >
          <button
            type="button"
            onClick={closePanel}
          >
            Listo
          </button>
        </div>
      </ClinicalPhasePanel>
    </div>
  );
}