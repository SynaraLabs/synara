import {
  useState,
} from 'react';

import type {
  MigraineEpisode,
} from '../../migraine/types/migraine.types';

import {
  ClinicalPhasePanel,
} from '../../migraine/components/common/ClinicalPhasePanel';

import {
  TreatmentSelector,
} from '../../migraine/components/TreatmentSelector';

interface Props {
  episode: MigraineEpisode;

  onChange: (
    episode: MigraineEpisode,
  ) => void;
}

const hasTreatmentData = (
  treatment:
    MigraineEpisode['treatment'],
): boolean => {
  return Boolean(
    treatment.type ||
    treatment.medication?.trim() ||
    treatment.dose?.trim() ||
    treatment.takenAt ||
    treatment.effectiveness ||
    treatment.responseTimeMinutes !==
      undefined ||
    treatment.sideEffects?.length ||
    treatment.notes?.trim(),
  );
};

export function RetrospectiveTreatmentPanel({
  episode,
  onChange,
}: Props) {
  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const treatment =
    episode.treatment;

  const isRegistered =
    hasTreatmentData(
      treatment,
    );

  return (
    <ClinicalPhasePanel
      id="retrospective-treatment-title"
      eyebrow="Contexto del episodio"
      title="Tratamiento utilizado"
      description="Completá la medicación, dosis, respuesta y posibles efectos secundarios."
      icon="✚"
      status={
        isRegistered
          ? 'Registrado'
          : 'Sin registrar'
      }
      isOpen={isOpen}
      onOpenChange={
        setIsOpen
      }
    >
      <TreatmentSelector
        value={treatment}
        onChange={
          updatedTreatment =>
            onChange({
              ...episode,

              treatment: {
                ...updatedTreatment,
              },
            })
        }
      />
    </ClinicalPhasePanel>
  );
}