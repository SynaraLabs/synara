import type {
  MigraineEpisode,
} from '../types/migraine.types';

import { AuraSelector } from './AuraSelector';
import { PremonitorySelector } from './PremonitorySelector';

import {
  ClinicalPhasePanel,
} from './common/ClinicalPhasePanel';

import styles from './TrackingPhasePanels.module.css';

interface Props {
  episode: MigraineEpisode;
}

const getPremonitoryStatus = (
  episode: MigraineEpisode,
): string => {
  if (
    !episode.premonitory.present
  ) {
    return 'Sin registrar';
  }

  if (
    episode.premonitory.status ===
    'ended'
  ) {
    return 'Finalizado';
  }

  if (
    episode.premonitory.status ===
    'uncertain'
  ) {
    return 'Desenlace incierto';
  }

  return 'En curso';
};

const getAuraStatus = (
  episode: MigraineEpisode,
): string => {
  if (!episode.aura.present) {
    return 'Sin registrar';
  }

  if (
    episode.aura.status ===
    'ended'
  ) {
    return 'Finalizada';
  }

  if (
    episode.aura.status ===
    'uncertain'
  ) {
    return 'Desenlace incierto';
  }

  return 'En curso';
};

export function TrackingPhasePanels({
  episode,
}: Props) {
  const premonitoryIsOpen =
    episode.premonitory.present &&
    episode.premonitory.status !==
      'ended' &&
    episode.premonitory.status !==
      'uncertain';

  const auraIsOpen =
    episode.aura.present &&
    episode.aura.status !==
      'ended' &&
    episode.aura.status !==
      'uncertain';

  return (
    <div
      className={
        styles.list
      }
    >
      <ClinicalPhasePanel
        id="premonitory-panel-title"
        eyebrow="Fase posible"
        title="Señales premonitorias"
        description="Cambios que pueden aparecer horas o días antes del dolor."
        icon="◌"
        status={
          getPremonitoryStatus(
            episode,
          )
        }
        defaultOpen={
          premonitoryIsOpen
        }
      >
        <PremonitorySelector
          context="tracking"
        />
      </ClinicalPhasePanel>

      <ClinicalPhasePanel
        id="aura-panel-title"
        eyebrow="Fase posible"
        title="Aura"
        description="Síntomas visuales, sensitivos, del lenguaje, motores o vestibulares."
        icon="◉"
        status={
          getAuraStatus(
            episode,
          )
        }
        defaultOpen={
          auraIsOpen
        }
      >
        <AuraSelector />
      </ClinicalPhasePanel>
    </div>
  );
}