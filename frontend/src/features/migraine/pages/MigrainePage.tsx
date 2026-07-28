import {
  useState,
} from 'react';

import { PremonitorySelector } from '../components/PremonitorySelector';
import { AuraSelector } from '../components/AuraSelector';
import { CrisisMode } from '../components/crisis-mode/CrisisMode';
import { PostdromeSelector } from '../components/PostdromeSelector';
import { TriggerSelector } from '../components/TriggerSelector';
import { TreatmentSelector } from '../components/TreatmentSelector';
import { PhaseDateSelector } from '../components/common/PhaseDateSelector';
import { MigraineDevTools } from '../components/dev/MigraineDevTools';

import {
  useMigraineStore,
} from '../store/migraine.store';

import styles from '../migraine.module.css';

type MigraineMode =
  | 'normal'
  | 'crisis';

const statusLabels = {
  premonitory: 'Señales previas',
  aura: 'Aura',
  crisis: 'Crisis',
  postdrome: 'Recuperación',
  completed: 'Completado',
};

export function MigrainePage() {
  const [mode, setMode] =
    useState<MigraineMode>('normal');

  const [
    showCrisisDate,
    setShowCrisisDate,
  ] = useState(false);

  const episode = useMigraineStore(
    state => state.activeEpisode,
  );

  const startEpisode = useMigraineStore(
    state => state.startEpisode,
  );

  const updateTimeline = useMigraineStore(
    state => state.updateTimeline,
  );

  const updateCrisis = useMigraineStore(
    state => state.updateCrisis,
  );

  const finishCrisis = useMigraineStore(
    state => state.finishCrisis,
  );

  const completeEpisode = useMigraineStore(
    state => state.completeEpisode,
  );

  const handleNewEpisode = () => {
    startEpisode();
  };

  const handleStartCrisis = () => {
    setShowCrisisDate(true);
  };

  const handleCancelCrisisStart = () => {
    setShowCrisisDate(false);
  };

  const handleCrisisDate = (
    date: string,
  ) => {
    if (!episode) {
      return;
    }

    /*
      Construimos la fecha como local para evitar
      que YYYY-MM-DD sea interpretado como UTC
      y cambie de día en Argentina.
    */

    const [
      year,
      month,
      day,
    ] = date.split('-');

    const selectedDateObject =
      new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
      );

    const now = new Date();

    selectedDateObject.setHours(
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      0,
    );

    const selectedDate =
      selectedDateObject.toISOString();

    updateTimeline({
      episodeStart:
        episode.timeline?.episodeStart ??
        selectedDate,

      crisisStart: selectedDate,

      premonitoryEnd: selectedDate,
    });

    updateCrisis({
      ...episode.crisis,
      active: true,
      startTime: selectedDate,
    });

    setShowCrisisDate(false);
    setMode('crisis');
  };

  const handleFinishCrisis = () => {
    finishCrisis();
    setMode('normal');
  };

  const handleCompleteEpisode = () => {
    completeEpisode();
    setMode('normal');
  };

  const episodeStatus =
    episode?.status
      ? statusLabels[
          episode.status as keyof typeof statusLabels
        ] ?? 'Episodio activo'
      : null;

  if (
    episode &&
    mode === 'crisis'
  ) {
    return (
      <section
        className={styles.crisisPage}
        aria-label="Modo crisis"
      >
        <CrisisMode
          onExit={handleFinishCrisis}
        />
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <header
        className={styles.pageHeader}
      >
        <div>
          <p
            className={
              styles.pageEyebrow
            }
          >
            Registro de salud
          </p>

          <h1>
            Seguimiento de migraña
          </h1>

          <p
            className={
              styles.pageDescription
            }
          >
            Registrá el episodio desde
            las primeras señales hasta
            la recuperación completa.
          </p>
        </div>

        {episode && (
          <div
            className={
              styles.episodeStatus
            }
            aria-label={`Estado actual: ${episodeStatus}`}
          >
            <span
              className={
                styles.statusIndicator
              }
              aria-hidden="true"
            />

            <div>
              <small>
                Episodio activo
              </small>

              <strong>
                {episodeStatus}
              </strong>
            </div>
          </div>
        )}
      </header>

      {!episode && (
        <div
          className={
            styles.emptyEpisodeCard
          }
        >
          <span
            className={
              styles.emptyEpisodeIcon
            }
            aria-hidden="true"
          >
            ◉
          </span>

          <div
            className={
              styles.emptyEpisodeContent
            }
          >
            <p
              className={
                styles.cardEyebrow
              }
            >
              Sin episodio activo
            </p>

            <h2>
              ¿Notaste una señal o
              comenzó una migraña?
            </h2>

            <p>
              Iniciá un registro para
              acompañar cada fase y
              guardar los síntomas,
              desencadenantes y
              tratamientos.
            </p>
          </div>

          <button
            className={
              styles.primaryAction
            }
            type="button"
            onClick={handleNewEpisode}
          >
            <span
              aria-hidden="true"
            >
              +
            </span>

            Registrar nueva migraña
          </button>
        </div>
      )}

      {episode &&
        mode === 'normal' && (
          <div
            className={
              styles.episodeWorkspace
            }
          >
            {!episode.crisis.active &&
              episode.status !==
                'postdrome' && (
                <section
                  className={
                    styles.crisisEntryCard
                  }
                  aria-labelledby="crisis-entry-title"
                >
                  <div
                    className={
                      styles.crisisEntryIcon
                    }
                    aria-hidden="true"
                  >
                    !
                  </div>

                  <div
                    className={
                      styles.crisisEntryContent
                    }
                  >
                    <p
                      className={
                        styles.cardEyebrow
                      }
                    >
                      Acceso rápido
                    </p>

                    <h2
                      id="crisis-entry-title"
                    >
                      ¿Comenzó el dolor?
                    </h2>

                    <p>
                      Activá el modo
                      crisis para usar
                      una interfaz más
                      simple, oscura y
                      directa.
                    </p>
                  </div>

                  <button
                    className={
                      styles.crisisButton
                    }
                    type="button"
                    onClick={
                      handleStartCrisis
                    }
                  >
                    Estoy entrando en
                    crisis
                  </button>
                </section>
              )}

            {showCrisisDate && (
              <section
                className={
                  styles.phaseDateCard
                }
                aria-label="Inicio de la crisis"
              >
                <div
                  className={
                    styles.phaseDateHeader
                  }
                >
                  <div>
                    <p
                      className={
                        styles.cardEyebrow
                      }
                    >
                      Inicio de la crisis
                    </p>

                    <h2>
                      Confirmá cuándo
                      comenzó el dolor
                    </h2>
                  </div>

                  <button
                    className={
                      styles.secondaryButton
                    }
                    type="button"
                    onClick={
                      handleCancelCrisisStart
                    }
                  >
                    Cancelar
                  </button>
                </div>

                <PhaseDateSelector
                  title="¿Cuándo empezó el dolor?"
                  value={
                    episode.crisis
                      .startTime
                  }
                  onChange={
                    handleCrisisDate
                  }
                />
              </section>
            )}

            <div
              className={
                styles.phaseStack
              }
            >
              <section
                className={
                  styles.phaseSection
                }
              >
                <div
                  className={
                    styles.phaseHeader
                  }
                >
                  <span
                    className={
                      styles.phaseNumber
                    }
                  >
                    1
                  </span>

                  <div>
                    <p
                      className={
                        styles.cardEyebrow
                      }
                    >
                      Antes del dolor
                    </p>

                    <h2>
                      Señales
                      premonitorias
                    </h2>
                  </div>
                </div>

                <PremonitorySelector />
              </section>

              <section
                className={
                  styles.phaseSection
                }
              >
                <div
                  className={
                    styles.phaseHeader
                  }
                >
                  <span
                    className={
                      styles.phaseNumber
                    }
                  >
                    2
                  </span>

                  <div>
                    <p
                      className={
                        styles.cardEyebrow
                      }
                    >
                      Síntomas
                      neurológicos
                    </p>

                    <h2>Aura</h2>
                  </div>
                </div>

                <AuraSelector />
              </section>
            </div>

            {episode.status ===
              'postdrome' && (
              <section
                className={
                  styles.recoverySection
                }
                aria-labelledby="recovery-title"
              >
                <div
                  className={
                    styles.recoveryHeader
                  }
                >
                  <span
                    className={
                      styles.recoveryIcon
                    }
                    aria-hidden="true"
                  >
                    ✓
                  </span>

                  <div>
                    <p
                      className={
                        styles.cardEyebrow
                      }
                    >
                      Después del dolor
                    </p>

                    <h2
                      id="recovery-title"
                    >
                      Recuperación
                    </h2>

                    <p>
                      Completá los últimos
                      datos del episodio
                      antes de cerrarlo.
                    </p>
                  </div>
                </div>

                <div
                  className={
                    styles.recoveryContent
                  }
                >
                  <PostdromeSelector />

                  <TriggerSelector />

                  <TreatmentSelector />
                </div>

                <div
                  className={
                    styles.completeEpisodeArea
                  }
                >
                  <div>
                    <h3>
                      ¿Ya te sentís
                      completamente
                      recuperada?
                    </h3>

                    <p>
                      Al finalizar, el
                      episodio se guardará
                      en tu historial.
                    </p>
                  </div>

                  <button
                    className={
                      styles.completeButton
                    }
                    type="button"
                    onClick={
                      handleCompleteEpisode
                    }
                  >
                    Finalizar episodio
                  </button>
                </div>
              </section>
            )}

            <MigraineDevTools />
          </div>
        )}
    </section>
  );
}