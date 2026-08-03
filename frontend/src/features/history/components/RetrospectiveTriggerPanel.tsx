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
  TriggerSelector,
} from '../../migraine/components/TriggerSelector';

interface Props {
  episode: MigraineEpisode;

  onChange: (
    episode: MigraineEpisode,
  ) => void;
}

const formatTriggerCount = (
  count: number,
): string => {
  if (count === 0) {
    return 'Sin registrar';
  }

  return count === 1
    ? '1 seleccionado'
    : `${count} seleccionados`;
};

export function RetrospectiveTriggerPanel({
  episode,
  onChange,
}: Props) {
  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const triggers =
    episode.triggers ?? [];

  return (
    <ClinicalPhasePanel
      id="retrospective-triggers-title"
      eyebrow="Contexto del episodio"
      title="Posibles desencadenantes"
      description="Agregá factores que podrían haber influido en este episodio."
      icon="⌁"
      status={formatTriggerCount(
        triggers.length,
      )}
      isOpen={isOpen}
      onOpenChange={
        setIsOpen
      }
    >
      <TriggerSelector
        value={triggers}
        onChange={
          updatedTriggers =>
            onChange({
              ...episode,

              triggers: [
                ...updatedTriggers,
              ],
            })
        }
        onComplete={() =>
          setIsOpen(false)
        }
      />
    </ClinicalPhasePanel>
  );
}