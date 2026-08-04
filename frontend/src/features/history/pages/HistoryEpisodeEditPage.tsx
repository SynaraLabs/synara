import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import type {
  ClinicalPhase,
  MigraineEpisode,
} from '../../migraine/types/migraine.types';

import {
  useMigraineStore,
} from '../../migraine/store/migraine.store';

import {
  RetrospectivePhaseEditor,
} from '../components/RetrospectivePhaseEditor';

import {
  RetrospectiveTreatmentPanel,
} from '../components/RetrospectiveTreatmentPanel';

import {
  RetrospectiveTriggerPanel,
} from '../components/RetrospectiveTriggerPanel';

import {
  getRetrospectivePhaseTime,
  normalizeRetrospectiveEpisode,
} from '../utils/retrospectiveEpisode';

import {
  reactivateHistoryEpisode,
} from '../utils/reactivateHistoryEpisode';

import {
  updateHistoryEpisode,
} from '../utils/updateHistoryEpisode';

import {
  formatCreatedDate,
} from '../utils/historyFormatters';

import styles from './HistoryEpisodeEditPage.module.css';

const PHASES:
  {
    id: ClinicalPhase;
    label: string;
    shortLabel: string;
    icon: string;
  }[] = [
  {
    id: 'premonitory',
    label:
      'Señales premonitorias',
    shortLabel: 'Señales',
    icon: '◌',
  },
  {
    id: 'aura',
    label: 'Aura',
    shortLabel: 'Aura',
    icon: '◉',
  },
  {
    id: 'crisis',
    label: 'Crisis',
    shortLabel: 'Crisis',
    icon: '◆',
  },
  {
    id: 'postdrome',
    label: 'Postdromo',
    shortLabel: 'Post',
    icon: '◇',
  },
];

const cloneEpisode = (
  episode: MigraineEpisode,
): MigraineEpisode => {
  if (
    typeof structuredClone ===
    'function'
  ) {
    return structuredClone(
      episode,
    );
  }

  return JSON.parse(
    JSON.stringify(
      episode,
    ),
  ) as MigraineEpisode;
};

const phaseIsPresent = (
  episode: MigraineEpisode,
  phase: ClinicalPhase,
): boolean => {
  if (
    phase === 'premonitory'
  ) {
    return (
      episode.premonitory
        .present === true
    );
  }

  if (phase === 'aura') {
    return (
      episode.aura.present ===
      true
    );
  }

  if (phase === 'crisis') {
    return Boolean(
      episode.timeline
        ?.crisisStart ||
        episode.crisis
          .startTime ||
        episode.crisis.time
          ?.start?.value ||
        episode.crisis.events
          ?.length ||
        episode.crisis
          .intensityHistory
          ?.length ||
        (
          episode.crisis.status &&
          episode.crisis.status !==
            'notStarted'
        ),
    );
  }

  return (
    episode.postdrome.present ===
    true
  );
};

const validatePhaseDates = (
  episode: MigraineEpisode,
  phase: ClinicalPhase,
): string | null => {
  if (
    !phaseIsPresent(
      episode,
      phase,
    )
  ) {
    return null;
  }

  const time =
    getRetrospectivePhaseTime(
      episode,
      phase,
    );

  const start =
    time.start?.value;

  const end =
    time.end?.value;

  if (
    start &&
    Number.isNaN(
      new Date(start).getTime(),
    )
  ) {
    return 'La fecha de inicio no es válida.';
  }

  if (
    end &&
    Number.isNaN(
      new Date(end).getTime(),
    )
  ) {
    return 'La fecha de finalización no es válida.';
  }

  if (
    start &&
    end &&
    new Date(end).getTime() <
      new Date(start).getTime()
  ) {
    return 'La finalización no puede ser anterior al inicio.';
  }

  if (
    phase === 'crisis' &&
    !start
  ) {
    return 'Para agregar una crisis, registrá su fecha y hora de inicio.';
  }

  return null;
};

export function HistoryEpisodeEditPage() {
  const {
    episodeId = '',
  } = useParams<{
    episodeId: string;
  }>();

  const navigate =
    useNavigate();

  const storedEpisode =
    useMigraineStore(
      state =>
        state.history.find(
          episode =>
            episode.id ===
            episodeId,
        ),
    );

  const [
    draft,
    setDraft,
  ] = useState<
    MigraineEpisode | null
  >(
    storedEpisode
      ? cloneEpisode(
          storedEpisode,
        )
      : null,
  );

  const [
    activePhase,
    setActivePhase,
  ] = useState<ClinicalPhase>(
    'premonitory',
  );

  const [
    feedback,
    setFeedback,
  ] = useState('');

  const [
    isSaved,
    setIsSaved,
  ] = useState(false);

  useEffect(() => {
    if (!storedEpisode) {
      setDraft(null);
      return;
    }

    setDraft(
      cloneEpisode(
        storedEpisode,
      ),
    );

    setFeedback('');
    setIsSaved(false);
  }, [
    episodeId,
    storedEpisode,
  ]);

  const hasChanges =
    useMemo(() => {
      if (
        !draft ||
        !storedEpisode
      ) {
        return false;
      }

      return (
        JSON.stringify(draft) !==
        JSON.stringify(
          storedEpisode,
        )
      );
    }, [
      draft,
      storedEpisode,
    ]);

  if (
    !storedEpisode ||
    !draft
  ) {
    return (
      <section
        className={
          styles.notFound
        }
      >
        <span
          aria-hidden="true"
        >
          ◷
        </span>

        <h1>
          No encontramos el episodio
        </h1>

        <p>
          Es posible que haya sido
          eliminado o que el enlace ya
          no sea válido.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate('/history')
          }
        >
          Volver al historial
        </button>
      </section>
    );
  }

  const handleSave = () => {
    for (
      const phase of PHASES
    ) {
      const error =
        validatePhaseDates(
          draft,
          phase.id,
        );

      if (error) {
        setActivePhase(
          phase.id,
        );

        setFeedback(
          `${phase.label}: ${error}`,
        );

        setIsSaved(false);

        return;
      }
    }

    const crisisIsPresent =
      phaseIsPresent(
        draft,
        'crisis',
      );

    const crisisTime =
      getRetrospectivePhaseTime(
        draft,
        'crisis',
      );

    const crisisStart =
      crisisTime.start?.value;

    const crisisEnd =
      crisisTime.end?.value;

    if (
      crisisIsPresent &&
      crisisStart &&
      !crisisEnd
    ) {
      const result =
        reactivateHistoryEpisode(
          episodeId,
          draft,
        );

      if (!result.ok) {
        if (
          result.error ===
          'anotherEpisodeIsActive'
        ) {
          setFeedback(
            'Ya existe otro episodio activo. Finalizalo o descartalo antes de reabrir esta crisis.',
          );
        } else {
          setFeedback(
            'No se pudo reabrir esta crisis. Volvé a intentarlo.',
          );
        }

        setIsSaved(false);

        return;
      }

      navigate('/migraine');

      return;
    }

    const normalizedEpisode =
      normalizeRetrospectiveEpisode(
        draft,
      );

    const result =
      updateHistoryEpisode(
        episodeId,
        () =>
          normalizedEpisode,
      );

    if (!result.ok) {
      setFeedback(
        'No se pudieron guardar los cambios. Volvé a intentarlo.',
      );

      setIsSaved(false);

      return;
    }

    setDraft(
      result.episode
        ? cloneEpisode(
            result.episode,
          )
        : normalizedEpisode,
    );

    setFeedback(
      'Los cambios retrospectivos se guardaron correctamente.',
    );

    setIsSaved(true);
  };

  const handleCancel = () => {
    if (
      !hasChanges ||
      window.confirm(
        'Hay cambios sin guardar. ¿Querés volver al historial igualmente?',
      )
    ) {
      navigate('/history');
    }
  };

  return (
    <section
      className={
        styles.container
      }
    >
      <header
        className={
          styles.pageHeader
        }
      >
        <div>
          <p>
            Edición retrospectiva
          </p>

          <h1>
            Completar episodio
          </h1>

          <span>
            {formatCreatedDate(
              storedEpisode.createdAt,
            )}
          </span>

          <small>
            Agregá información que
            recordaste después sin
            modificar la fecha original
            del registro.
          </small>
        </div>

        <button
          type="button"
          onClick={handleCancel}
        >
          Volver
        </button>
      </header>

      <nav
        className={
          styles.phaseNavigation
        }
        aria-label="Fases del episodio"
      >
        {PHASES.map(
          phase => {
            const isPresent =
              phaseIsPresent(
                draft,
                phase.id,
              );

            return (
              <button
                key={phase.id}
                type="button"
                className={
                  activePhase ===
                  phase.id
                    ? styles.activePhase
                    : ''
                }
                aria-current={
                  activePhase ===
                  phase.id
                    ? 'step'
                    : undefined
                }
                onClick={() => {
                  setActivePhase(
                    phase.id,
                  );

                  setFeedback('');
                  setIsSaved(false);
                }}
              >
                <span
                  aria-hidden="true"
                >
                  {phase.icon}
                </span>

                <b>
                  {
                    phase.shortLabel
                  }
                </b>

                <small>
                  {isPresent
                    ? 'Registrada'
                    : 'Sin registrar'}
                </small>
              </button>
            );
          },
        )}
      </nav>

      <RetrospectiveTriggerPanel
        episode={draft}
        onChange={
          updatedEpisode => {
            setDraft(
              updatedEpisode,
            );

            setFeedback('');
            setIsSaved(false);
          }
        }
      />

      <RetrospectiveTreatmentPanel
        episode={draft}
        onChange={
          updatedEpisode => {
            setDraft(
              updatedEpisode,
            );

            setFeedback('');
            setIsSaved(false);
          }
        }
      />

      <RetrospectivePhaseEditor
        phase={activePhase}
        episode={draft}
        onChange={
          updatedEpisode => {
            setDraft(
              updatedEpisode,
            );

            setFeedback('');
            setIsSaved(false);
          }
        }
      />

      {feedback && (
        <p
          className={
            isSaved
              ? styles.success
              : styles.error
          }
          role={
            isSaved
              ? 'status'
              : 'alert'
          }
        >
          {feedback}
        </p>
      )}

      <footer
        className={
          styles.actions
        }
      >
        <button
          type="button"
          onClick={handleCancel}
        >
          Cancelar
        </button>

        <button
          type="button"
          className={
            styles.saveButton
          }
          disabled={!hasChanges}
          onClick={handleSave}
        >
          Guardar cambios
        </button>
      </footer>
    </section>
  );
}