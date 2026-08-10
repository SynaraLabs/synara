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

type CrisisPanelId =
  | 'symptoms'
  | 'medication'
  | 'location'
  | 'relief'
  | 'capacity'
  | 'evolution';

const getLocationCount = (
  location: AnatomicalPainMap,
): number => {
  const keys = new Set();

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

  return (
    <div>
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
        isOpen={
          activePanel === 'symptoms'
        }
        onOpenChange={isOpen =>
          handlePanelChange(
            'symptoms',
            isOpen,
          )
        }
      >
        <SymptomsCard
          symptoms={symptoms}
          onToggle={
            onSymptomToggle
          }
          onDone={closePanel}
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
        <MedicationCard
          records={medicationRecords}
          onRegister={
            handleMedicationRegister
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
        isOpen={
          activePanel === 'location'
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
            onLocationChange
          }
          onComplete={closePanel}
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
        isOpen={
          activePanel === 'relief'
        }
        onOpenChange={isOpen =>
          handlePanelChange(
            'relief',
            isOpen,
          )
        }
      >
        <NonPharmacologicalCard
          records={
            nonPharmacologicalRecords
          }
          onRegister={
            handleReliefRegister
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
        <FunctionalCapacityCard
          records={
            functionalCapacityRecords
          }
          onRegister={
            handleCapacityRegister
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
        isOpen={
          activePanel ===
          'evolution'
        }
        onOpenChange={isOpen =>
          handlePanelChange(
            'evolution',
            isOpen,
          )
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
      </ClinicalPhasePanel>
    </div>
  );
}