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
  ClinicalPhasePanel,
} from '../common/ClinicalPhasePanel';

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

const getLocationCount = (
  location: AnatomicalPainMap,
): number => {
  const keys =
    new Set<string>();

  const addPoint = (
    point:
      | AnatomicalPainMap[
          'primary'
        ]
      | undefined,
  ) => {
    if (!point) {
      return;
    }

    keys.add(
      `${point.region}:${point.side ?? 'unknown'}`,
    );
  };

  addPoint(
    location.primary,
  );

  addPoint(
    location.origin,
  );

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
  const locationCount =
    getLocationCount(
      anatomicalLocation,
    );

  const eventCount =
    crisis.events?.length ?? 0;

  return (
    <div
      className={
        styles.list
      }
    >
      <ClinicalPhasePanel
        id="crisis-symptoms-title"
        eyebrow="Actualización rápida"
        title="Síntomas"
        description="Marcá solamente lo que estés sintiendo ahora."
        icon="○"
        status={
          formatCount(
            symptoms.length,
            'seleccionado',
            'seleccionados',
          )
        }
      >
        <SymptomsCard
          symptoms={symptoms}
          onToggle={
            onSymptomToggle
          }
        />
      </ClinicalPhasePanel>

      <ClinicalPhasePanel
        id="crisis-medication-title"
        eyebrow="Tratamiento"
        title="Medicación"
        description="Registrá una toma sin salir del modo crisis."
        icon="+"
        status={
          formatCount(
            medicationRecords.length,
            'toma',
            'tomas',
          )
        }
      >
        <MedicationCard
          records={
            medicationRecords
          }
          onRegister={
            onMedicationRegister
          }
        />
      </ClinicalPhasePanel>

      <ClinicalPhasePanel
        id="crisis-location-title"
        eyebrow="Dolor"
        title="Localización"
        description="Indicá dónde empezó y hacia dónde se extendió."
        icon="⌖"
        status={
          formatCount(
            locationCount,
            'zona',
            'zonas',
          )
        }
      >
        <PainLocationSelector
          value={
            anatomicalLocation
          }
          onChange={
            onLocationChange
          }
          title="¿Dónde sentís el dolor?"
        />
      </ClinicalPhasePanel>

      <ClinicalPhasePanel
        id="crisis-relief-title"
        eyebrow="Alivio"
        title="Medidas no farmacológicas"
        description="Reposo, oscuridad, frío, hidratación u otras medidas."
        icon="◇"
        status={
          formatCount(
            nonPharmacologicalRecords
              .length,
            'registro',
            'registros',
          )
        }
      >
        <NonPharmacologicalCard
          records={
            nonPharmacologicalRecords
          }
          onRegister={
            onNonPharmacologicalRegister
          }
        />
      </ClinicalPhasePanel>

      <ClinicalPhasePanel
        id="crisis-capacity-title"
        eyebrow="Impacto"
        title="Capacidad funcional"
        description="Registrá cuánto limita tus actividades en este momento."
        icon="↔"
        status={
          formatCount(
            functionalCapacityRecords
              .length,
            'registro',
            'registros',
          )
        }
      >
        <FunctionalCapacityCard
          records={
            functionalCapacityRecords
          }
          onRegister={
            onFunctionalCapacityRegister
          }
        />
      </ClinicalPhasePanel>

      <ClinicalPhasePanel
        id="crisis-evolution-title"
        eyebrow="Resumen"
        title="Evolución de la crisis"
        description="Revisá los cambios registrados durante este episodio."
        icon="⌁"
        status={
          formatCount(
            eventCount,
            'cambio',
            'cambios',
          )
        }
      >
        <CrisisEvolutionCard
          crisis={crisis}
        />
      </ClinicalPhasePanel>
    </div>
  );
}