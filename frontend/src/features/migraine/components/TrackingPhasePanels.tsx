import {
  useState,
} from 'react';

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

type TrackingPanel =
  | 'premonitory'
  | 'aura';

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

const getInitialPanel = (
  episode: MigraineEpisode,
): TrackingPanel | null => {
  const auraIsOpen =
    episode.aura.present &&
    episode.aura.status !==
      'ended' &&
    episode.aura.status !==
      'uncertain';

  if (auraIsOpen) {
    return 'aura';
  }

  const premonitoryIsOpen =
    episode.premonitory.present &&
    episode.premonitory.status !==
      'ended' &&
    episode.premonitory.status !==
      'uncertain';

  return premonitoryIsOpen
    ? 'premonitory'
    : null;
};

export function TrackingPhasePanels({
  episode,
}: Props) {
  const [
    activePanel,
    setActivePanel,
  ] = useState<
    TrackingPanel | null
  >(() =>
    getInitialPanel(episode),
  );

  const handlePanelChange = (
    panel: TrackingPanel,
    isOpen: boolean,
  ) => {
    setActivePanel(
      currentPanel => {
        if (isOpen) {
          return panel;
        }

        return currentPanel ===
          panel
          ? null
          : currentPanel;
      },
    );
  };

  const closeActivePanel = () => {
    setActivePanel(null);
  };

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
        isOpen={
          activePanel ===
          'premonitory'
        }
        onOpenChange={isOpen =>
          handlePanelChange(
            'premonitory',
            isOpen,
          )
        }
      >
        <PremonitorySelector
          context="tracking"
          onComplete={
            closeActivePanel
          }
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
        isOpen={
          activePanel ===
          'aura'
        }
        onOpenChange={isOpen =>
          handlePanelChange(
            'aura',
            isOpen,
          )
        }
      >
        <AuraSelector
          onComplete={
            closeActivePanel
          }
        />
      </ClinicalPhasePanel>
    </div>
  );
}