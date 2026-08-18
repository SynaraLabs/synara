import {
  useState,
} from 'react';

import type {
  AnatomicalPainMap,
  CrisisPhase,
  CrisisSymptom,
} from '../../types/migraine.types';

import type {
  NonPharmacologicalMeasure,
} from '../../data/nonPharmacologicalMeasureCatalog';

import {
  PainLocationSelector,
} from '../common/PainLocationSelector';

import {
  CrisisEvolutionCard,
} from './CrisisEvolutionCard';

import {
  FunctionalCapacityCard,
  type AffectedActivity,
  type FunctionalCapacityLevel,
  type FunctionalCapacityRecord,
} from './FunctionalCapacityCard';

import {
  MedicationCard,
  type CrisisMedicationRecord,
} from './MedicationCard';

import {
  NonPharmacologicalCard,
  type NonPharmacologicalRecord,
} from './NonPharmacologicalCard';

import {
  SymptomsCard,
} from './SymptomsCard';

import styles from './CrisisTools.module.css';

interface Props {
  crisis: CrisisPhase;

  symptoms: CrisisSymptom[];

  anatomicalLocation:
    AnatomicalPainMap;

  medicationRecords:
    CrisisMedicationRecord[];

  nonPharmacologicalRecords:
    NonPharmacologicalRecord[];

  functionalCapacityRecords:
    FunctionalCapacityRecord[];

  onSymptomToggle: (
    symptom: CrisisSymptom,
  ) => void;

  onLocationChange: (
    location: AnatomicalPainMap,
  ) => void;

  onMedicationRegister: (
    medication: string,
    dose: string,
    takenAt: string,
    notes: string,
  ) => void;

  onNonPharmacologicalRegister: (
    measures:
      NonPharmacologicalMeasure[],
    appliedAt: string,
    notes: string,
  ) => void;

  onFunctionalCapacityRegister: (
    level:
      FunctionalCapacityLevel,
    affectedActivities:
      AffectedActivity[],
    occurredAt: string,
    notes: string,
  ) => void;
}

type CrisisPanelId =
  | 'symptoms'
  | 'medication'
  | 'location'
  | 'relief'
  | 'capacity'
  | 'evolution';

interface ToolDefinition {
  id: CrisisPanelId;
  eyebrow: string;
  title: string;
  description: string;
  status: string;
}

const getLocationCount = (
  location: AnatomicalPainMap,
): number => {
  const keys = new Set<string>();

  const addPoint = (
    point:
      | AnatomicalPainMap['primary']
      | undefined,
  ) => {
    if (!point) {
      return;
    }

    keys.add(
      `${point.region}:${point.side ?? 'unknown'}`,
    );
  };

  addPoint(location.primary);
  addPoint(location.origin);

  (
    location.additional ?? []
  ).forEach(addPoint);

  return keys.size;
};

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

export function CrisisTools({
  crisis,
  symptoms,
  anatomicalLocation,
  medicationRecords,
  nonPharmacologicalRecords,
  functionalCapacityRecords,
  onSymptomToggle,
  onLocationChange,
  onMedicationRegister,
  onNonPharmacologicalRegister,
  onFunctionalCapacityRegister,
}: Props) {
  const [
    activePanel,
    setActivePanel,
  ] = useState<
    CrisisPanelId | null
  >(null);

  const locationCount =
    getLocationCount(
      anatomicalLocation,
    );

  const eventCount =
    crisis.events?.length ?? 0;

  const closePanel = () => {
    setActivePanel(null);
  };

  const handlePanelToggle = (
    panel: CrisisPanelId,
  ) => {
    setActivePanel(current =>
      current === panel
        ? null
        : panel,
    );
  };

  const handleMedicationRegister = (
    medication: string,
    dose: string,
    takenAt: string,
    notes: string,
  ) => {
    onMedicationRegister(
      medication,
      dose,
      takenAt,
      notes,
    );

    closePanel();
  };

  const handleReliefRegister = (
    measures:
      NonPharmacologicalMeasure[],
    appliedAt: string,
    notes: string,
  ) => {
    onNonPharmacologicalRegister(
      measures,
      appliedAt,
      notes,
    );

    closePanel();
  };

  const handleCapacityRegister = (
    level:
      FunctionalCapacityLevel,
    affectedActivities:
      AffectedActivity[],
    occurredAt: string,
    notes: string,
  ) => {
    onFunctionalCapacityRegister(
      level,
      affectedActivities,
      occurredAt,
      notes,
    );

    closePanel();
  };

  const tools: ToolDefinition[] = [
    {
      id: 'symptoms',
      eyebrow: 'Actualización rápida',
      title: 'Síntomas',
      description:
        'Marcá lo que estés sintiendo ahora.',
      status: formatCount(
        symptoms.length,
        'activo',
        'activos',
      ),
    },
    {
      id: 'medication',
      eyebrow: 'Tratamiento',
      title: 'Medicación',
      description:
        'Registrá una toma.',
      status: formatCount(
        medicationRecords.length,
        'toma',
        'tomas',
      ),
    },
    {
      id: 'location',
      eyebrow: 'Dolor',
      title: 'Localización',
      description:
        'Actualizá dónde sentís el dolor.',
      status: formatCount(
        locationCount,
        'zona',
        'zonas',
      ),
    },
    {
      id: 'relief',
      eyebrow: 'Alivio',
      title: 'Medidas de alivio',
      description:
        'Reposo, oscuridad, frío u otras.',
      status: formatCount(
        nonPharmacologicalRecords
          .length,
        'registro',
        'registros',
      ),
    },
    {
      id: 'capacity',
      eyebrow: 'Impacto',
      title: 'Capacidad funcional',
      description:
        'Registrá cuánto te limita.',
      status: formatCount(
        functionalCapacityRecords
          .length,
        'registro',
        'registros',
      ),
    },
  ];

  const activeTool =
    tools.find(
      tool =>
        tool.id === activePanel,
    );

  return (
    <section
      className={styles.tools}
      aria-labelledby="crisis-tools-title"
    >
      <header
        className={
          styles.toolsHeader
        }
      >
        <div>
          <p
            className={
              styles.eyebrow
            }
          >
            Registrar un cambio
          </p>

          <h2 id="crisis-tools-title">
            ¿Qué necesitás actualizar?
          </h2>

          <p>
            Elegí solo lo que cambió.
            No hace falta completar todo.
          </p>
        </div>
      </header>

      <div
        className={
          styles.quickGrid
        }
      >
        {tools.map(tool => {
          const isActive =
            activePanel === tool.id;

          return (
            <button
              key={tool.id}
              type="button"
              className={
                styles.quickAction
              }
              aria-expanded={
                isActive
              }
              aria-controls={
                `crisis-tool-${tool.id}`
              }
              onClick={() =>
                handlePanelToggle(
                  tool.id,
                )
              }
            >
              <span
                className={
                  styles.quickActionTop
                }
              >
                <small>
                  {tool.eyebrow}
                </small>

                <span
                  aria-hidden="true"
                  className={
                    styles.chevron
                  }
                />
              </span>

              <strong>
                {tool.title}
              </strong>

              <span
                className={
                  styles.quickStatus
                }
              >
                {tool.status}
              </span>
            </button>
          );
        })}
      </div>

      {activeTool && (
        <section
          id={
            `crisis-tool-${activeTool.id}`
          }
          className={
            styles.activePanel
          }
          aria-labelledby={
            `crisis-tool-${activeTool.id}-title`
          }
        >
          <header
            className={
              styles.activePanelHeader
            }
          >
            <div>
              <p
                className={
                  styles.eyebrow
                }
              >
                {activeTool.eyebrow}
              </p>

              <h3
                id={
                  `crisis-tool-${activeTool.id}-title`
                }
              >
                {activeTool.title}
              </h3>

              <p>
                {
                  activeTool.description
                }
              </p>
            </div>

            <button
              type="button"
              className={
                styles.closeButton
              }
              onClick={closePanel}
            >
              Cerrar
            </button>
          </header>

          <div
            className={
              styles.panelContent
            }
          >
            {activePanel ===
              'symptoms' && (
              <SymptomsCard
                symptoms={symptoms}
                onToggle={
                  onSymptomToggle
                }
                onDone={closePanel}
              />
            )}

            {activePanel ===
              'medication' && (
              <MedicationCard
                records={
                  medicationRecords
                }
                onRegister={
                  handleMedicationRegister
                }
              />
            )}

            {activePanel ===
              'location' && (
              <PainLocationSelector
                value={
                  anatomicalLocation
                }
                onChange={
                  onLocationChange
                }
                onComplete={
                  closePanel
                }
                title="¿Dónde sentís el dolor?"
              />
            )}

            {activePanel ===
              'relief' && (
              <NonPharmacologicalCard
                records={
                  nonPharmacologicalRecords
                }
                onRegister={
                  handleReliefRegister
                }
              />
            )}

            {activePanel ===
              'capacity' && (
              <FunctionalCapacityCard
                records={
                  functionalCapacityRecords
                }
                onRegister={
                  handleCapacityRegister
                }
              />
            )}
          </div>
        </section>
      )}

      <section
        className={
          styles.evolutionArea
        }
      >
        <button
          type="button"
          className={
            styles.evolutionButton
          }
          aria-expanded={
            activePanel ===
            'evolution'
          }
          aria-controls="crisis-tool-evolution"
          onClick={() =>
            handlePanelToggle(
              'evolution',
            )
          }
        >
          <span>
            <small>
              Resumen
            </small>

            <strong>
              Evolución de la crisis
            </strong>
          </span>

          <span
            className={
              styles.evolutionStatus
            }
          >
            {formatCount(
              eventCount,
              'cambio',
              'cambios',
            )}
          </span>
        </button>

        {activePanel ===
          'evolution' && (
          <div
            id="crisis-tool-evolution"
            className={
              styles.evolutionContent
            }
          >
            <CrisisEvolutionCard
              crisis={crisis}
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
                Cerrar resumen
              </button>
            </div>
          </div>
        )}
      </section>
    </section>
  );
}