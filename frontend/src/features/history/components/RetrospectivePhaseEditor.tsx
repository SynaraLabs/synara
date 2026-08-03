import type {
  AnatomicalPainMap,
  ClinicalPhase,
  MigraineEpisode,
  PainIntensity,
} from '../../migraine/types/migraine.types';

import {
  PainLocationSelector,
} from '../../migraine/components/common/PainLocationSelector';

import {
  getRetrospectivePhaseSymptoms,
  getRetrospectivePhaseTime,
  setRetrospectivePhaseNotes,
  setRetrospectivePhaseSymptoms,
  setRetrospectivePhaseTime,
} from '../utils/retrospectiveEpisode';

import {
  RetrospectiveMedicationEditor,
} from './RetrospectiveMedicationEditor';

import {
  RetrospectiveNonPharmacologicalEditor,
} from './RetrospectiveNonPharmacologicalEditor';

import {
  RetrospectiveSymptomSelector,
} from './RetrospectiveSymptomSelector';

import styles from './RetrospectivePhaseEditor.module.css';

interface Props {
  phase: ClinicalPhase;

  episode: MigraineEpisode;

  onChange: (
    episode: MigraineEpisode,
  ) => void;
}

const PHASE_CONTENT:
  Record<
    ClinicalPhase,
    {
      eyebrow: string;
      title: string;
      description: string;
      icon: string;
    }
  > = {
  premonitory: {
    eyebrow:
      'Antes del dolor',
    title:
      'Señales premonitorias',
    description:
      'Corregí o agregá señales que recordaste después.',
    icon: '◌',
  },

  aura: {
    eyebrow:
      'Síntomas neurológicos',
    title:
      'Aura',
    description:
      'Registrá síntomas visuales, sensitivos, del lenguaje, motores o vestibulares.',
    icon: '◉',
  },

  crisis: {
    eyebrow:
      'Dolor',
    title:
      'Crisis',
    description:
      'Agregá una crisis posterior o corregí la información del dolor.',
    icon: '◆',
  },

  postdrome: {
    eyebrow:
      'Recuperación',
    title:
      'Postdromo',
    description:
      'Completá síntomas o cambios que recordaste después de recuperarte.',
    icon: '◇',
  },
};

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

const toLocalDateTimeValue = (
  value?: string,
): string => {
  if (!value) {
    return '';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '';
  }

  const localDate =
    new Date(
      date.getTime() -
        date.getTimezoneOffset() *
          60_000,
    );

  return localDate
    .toISOString()
    .slice(0, 16);
};

const toIsoDateTime = (
  value: string,
): string => {
  if (!value) {
    return '';
  }

  const date =
    new Date(value);

  return Number.isNaN(
    date.getTime(),
  )
    ? ''
    : date.toISOString();
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

const activatePhase = (
  episode: MigraineEpisode,
  phase: ClinicalPhase,
): MigraineEpisode => {
  if (
    phase === 'premonitory'
  ) {
    return {
      ...episode,

      premonitory: {
        ...episode.premonitory,

        present: true,
        status: 'uncertain',
      },
    };
  }

  if (phase === 'aura') {
    return {
      ...episode,

      aura: {
        ...episode.aura,

        present: true,
        status: 'uncertain',
      },
    };
  }

  if (phase === 'crisis') {
    return {
      ...episode,

      crisis: {
        ...episode.crisis,

        active: false,
        status: 'uncertain',
      },
    };
  }

  return {
    ...episode,

    postdrome: {
      ...episode.postdrome,

      present: true,
      status: 'uncertain',
    },
  };
};

const getPhaseNotes = (
  episode: MigraineEpisode,
  phase: ClinicalPhase,
): string => {
  if (
    phase === 'premonitory'
  ) {
    return (
      episode.premonitory
        .notes ?? ''
    );
  }

  if (phase === 'aura') {
    return (
      episode.aura.notes ??
      ''
    );
  }

  if (phase === 'crisis') {
    return (
      episode.crisis.notes ??
      ''
    );
  }

  return (
    episode.postdrome.notes ??
    ''
  );
};

export function RetrospectivePhaseEditor({
  phase,
  episode,
  onChange,
}: Props) {
  const content =
    PHASE_CONTENT[phase];

  const isPresent =
    phaseIsPresent(
      episode,
      phase,
    );

  if (!isPresent) {
    return (
      <section
        className={
          styles.missing
        }
      >
        <span
          className={
            styles.missingIcon
          }
          aria-hidden="true"
        >
          {content.icon}
        </span>

        <div>
          <p>
            {content.eyebrow}
          </p>

          <h3>
            {content.title}
          </h3>

          <span>
            Esta fase no fue
            registrada originalmente.
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            onChange(
              activatePhase(
                episode,
                phase,
              ),
            )
          }
        >
          {phase === 'crisis'
            ? 'Agregar crisis'
            : `Agregar ${content.title.toLocaleLowerCase(
                'es-AR',
              )}`}
        </button>
      </section>
    );
  }

  const phaseTime =
    getRetrospectivePhaseTime(
      episode,
      phase,
    );

  const startValue =
    phase === 'postdrome'
      ? (
          episode.timeline
            ?.crisisEnd ??
          episode.crisis
            .endTime ??
          episode.crisis.time
            ?.end?.value ??
          phaseTime.start?.value
        )
      : phaseTime.start?.value;

  const endValue =
    phaseTime.end?.value;

  const selections =
    getRetrospectivePhaseSymptoms(
      episode,
      phase,
    );

  const notes =
    getPhaseNotes(
      episode,
      phase,
    );

  const handleDateChange = (
    boundary:
      'start' | 'end',
    value: string,
  ) => {
    const isoValue =
      toIsoDateTime(value);

    onChange(
      setRetrospectivePhaseTime(
        episode,
        phase,
        boundary,
        isoValue,
      ),
    );
  };

  const handlePainChange = (
    intensity:
      PainIntensity,
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

  return (
    <section
      className={
        styles.editor
      }
    >
      <header
        className={
          styles.header
        }
      >
        <span
          className={
            styles.icon
          }
          aria-hidden="true"
        >
          {content.icon}
        </span>

        <div>
          <p>
            {content.eyebrow}
          </p>

          <h3>
            {content.title}
          </h3>

          <span>
            {content.description}
          </span>
        </div>

        <strong>
          Edición retrospectiva
        </strong>
      </header>

      <div
        className={
          styles.dateGrid
        }
      >
        <label>
          <span>
            Inicio
          </span>

          <input
            type="datetime-local"
            value={toLocalDateTimeValue(
              startValue,
            )}
            disabled={
              phase === 'postdrome'
            }
            onChange={event =>
              handleDateChange(
                'start',
                event.target.value,
              )
            }
          />

          {phase === 'postdrome' && (
            <small>
              Coincide con el final de
              la crisis.
            </small>
          )}
        </label>

        <label>
          <span>
            Final
          </span>

          <input
            type="datetime-local"
            value={toLocalDateTimeValue(
              endValue,
            )}
            onChange={event =>
              handleDateChange(
                'end',
                event.target.value,
              )
            }
          />
        </label>
      </div>

      {phase === 'crisis' && (
        <>
          <section
            className={
              styles.pain
            }
            aria-labelledby="retrospective-pain-title"
          >
            <div>
              <h4
                id="retrospective-pain-title"
              >
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
          </section>

          <PainLocationSelector
            value={
              anatomicalLocation
            }
            onChange={
              handleLocationChange
            }
            title="¿Dónde sentiste el dolor?"
          />

          <RetrospectiveMedicationEditor
            episode={episode}
            onChange={onChange}
          />

          <RetrospectiveNonPharmacologicalEditor
            episode={episode}
            onChange={onChange}
          />
        </>
      )}

      <RetrospectiveSymptomSelector
        phase={phase}
        value={selections}
        onChange={
          updatedSelections =>
            onChange(
              setRetrospectivePhaseSymptoms(
                episode,
                phase,
                updatedSelections,
              ),
            )
        }
      />

      <label
        className={
          styles.notes
        }
      >
        <span>
          Notas de esta fase
        </span>

        <textarea
          value={notes}
          rows={4}
          placeholder="Agregá algo que recordaste después..."
          onChange={event =>
            onChange(
              setRetrospectivePhaseNotes(
                episode,
                phase,
                event.target.value,
              ),
            )
          }
        />
      </label>
    </section>
  );
}