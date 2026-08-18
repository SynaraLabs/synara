import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import styles from './AuraSelector.module.css';
import evolutionStyles from './aura/AuraEvolution.module.css';

import type {
  AuraClinicalSymptom,
  AuraTiming,
  AuraUpdateData,
  BodySide,
} from '../types/migraine.types';

import { useMigraineStore } from '../store/migraine.store';

import {
  buildAuraLegacyFields,
  buildAuraPhaseTime,
  calculateAuraDurationMinutes,
  createAuraClinicalSelections,
  formatAuraDateTime,
  generateAuraRecordId,
  getAuraSymptomLabel,
  getAuraTypes,
  getAuraUpdateSymptoms,
  getCurrentLocalDateTimeValue,
  getEarlierAuraDate,
  getSelectedAuraSymptoms,
  inferAuraRecordMode,
  isValidAuraDate,
  parseLocalDateTime,
} from '../utils/auraClinical';

import {
  PhaseEndSelector,
  type PhaseEndSelection,
} from './common/PhaseEndSelector';

import {
  AuraInitialFlow,
} from './aura/AuraInitialFlow';

import {
  AuraUpdateFlow,
} from './aura/AuraUpdateFlow';


interface AuraSelectorProps {
  onComplete?: () => void;
}


export function AuraSelector({
  onComplete,
}: AuraSelectorProps) {
  const [
    draftSymptoms,
    setDraftSymptoms,
  ] = useState<
    AuraClinicalSymptom[]
  >([]);

  const [
    draftTiming,
    setDraftTiming,
  ] = useState<
    AuraTiming | ''
  >('');

  const [
    draftSide,
    setDraftSide,
  ] = useState<
    BodySide | ''
  >('');

  const [
    draftNotes,
    setDraftNotes,
  ] = useState('');

  const [
    updateDateTime,
    setUpdateDateTime,
  ] = useState(
    getCurrentLocalDateTimeValue,
  );

  const [
    showEndSelector,
    setShowEndSelector,
  ] = useState(false);

  const [
    feedback,
    setFeedback,
  ] = useState('');

  const [
    showEvolution,
    setShowEvolution,
  ] = useState(false);


  const aura = useMigraineStore(
    state => state.episode.aura,
  );

  const timeline = useMigraineStore(
    state => state.episode.timeline,
  );

  const updateAura =
    useMigraineStore(
      state => state.updateAura,
    );

  const updateTimeline =
    useMigraineStore(
      state => state.updateTimeline,
    );


  const updates =
    aura.updates ?? [];

  /*
   * Conserva la misma referencia
   * mientras el aura almacenada no
   * cambie.
   *
   * Sin useMemo, se generaba un array
   * nuevo en cada render y el efecto
   * borraba las selecciones realizadas.
   */
  const currentSymptoms =
    useMemo(
      () =>
        getSelectedAuraSymptoms(
          aura,
        ),
      [aura],
    );

  const auraStart =
    timeline?.auraStart ??
    aura.time?.start?.value;

  const auraEnd =
    timeline?.auraEnd ??
    aura.time?.end?.value;

  const isEnded =
    aura.status === 'ended' ||
    isValidAuraDate(auraEnd);

  const isActive =
    aura.present && !isEnded;

  const isFirstUpdate =
    updates.length === 0 &&
    !aura.present;


  useEffect(() => {
    setDraftSymptoms(
      currentSymptoms,
    );

    setDraftTiming(
      aura.timing ?? '',
    );

    setDraftSide(
      aura.side ?? '',
    );
  }, [
    aura.side,
    aura.timing,
    currentSymptoms,
  ]);


  const visibleUpdates =
    useMemo(() => {
      return [...updates].sort(
        (
          firstUpdate,
          secondUpdate,
        ) => {
          const firstDate =
            firstUpdate.occurredAt
              .value ??
            firstUpdate.createdAt;

          const secondDate =
            secondUpdate.occurredAt
              .value ??
            secondUpdate.createdAt;

          return (
            new Date(
              firstDate,
            ).getTime() -
            new Date(
              secondDate,
            ).getTime()
          );
        },
      );
    }, [updates]);


  const toggleSymptom = (
    symptom:
      AuraClinicalSymptom,
  ) => {
    setFeedback('');

    setDraftSymptoms(
      currentDraft =>
        currentDraft.includes(
          symptom,
        )
          ? currentDraft.filter(
              currentSymptom =>
                currentSymptom !==
                symptom,
            )
          : [
              ...currentDraft,
              symptom,
            ],
    );
  };


  const handleRegisterUpdate =
    () => {
      if (isEnded) {
        return;
      }

      const occurredAtDate =
        parseLocalDateTime(
          updateDateTime,
        );

      if (!occurredAtDate) {
        setFeedback(
          'Ingresá una fecha y hora válidas para el registro.',
        );

        return;
      }

      if (
        occurredAtDate.getTime() >
        Date.now()
      ) {
        setFeedback(
          'El registro del aura no puede estar en el futuro.',
        );

        return;
      }

      const normalizedNotes =
        draftNotes.trim();

      if (
        draftSymptoms.length === 0 &&
        !normalizedNotes
      ) {
        setFeedback(
          'Seleccioná al menos un síntoma o agregá una nota.',
        );

        return;
      }

      const occurredAt =
        occurredAtDate.toISOString();

      const now =
        new Date().toISOString();

      const recordMode =
        inferAuraRecordMode(
          occurredAt,
        );

      const effectiveStart =
        getEarlierAuraDate(
          auraStart,
          occurredAt,
        ) ?? occurredAt;

      const existingStart =
        aura.time?.start;

      const shouldUpdateStart =
        !isValidAuraDate(
          existingStart?.value,
        ) ||
        new Date(
          effectiveStart,
        ).getTime() <
          new Date(
            existingStart.value,
          ).getTime();

      const startPhaseTime =
        shouldUpdateStart
          ? buildAuraPhaseTime(
              effectiveStart,
              'exact',
              inferAuraRecordMode(
                effectiveStart,
              ),
            )
          : existingStart;

      const side =
        draftSide || undefined;

      const timing =
        draftTiming || undefined;

      const legacyFields =
        buildAuraLegacyFields(
          draftSymptoms,
        );

      const clinicalSymptoms =
        createAuraClinicalSelections(
          draftSymptoms,
          side,
          aura.clinicalSymptoms,
          true,
        );

      const types =
        getAuraTypes(
          draftSymptoms,
          aura.types,
        );

      const updateData:
        AuraUpdateData = {
        types,

        ...legacyFields,

        clinicalSymptoms,

        symptomsStillActive:
          draftSymptoms.length > 0,
      };

      updateAura({
        ...aura,

        present: true,

        status: 'active',

        types,

        ...legacyFields,

        clinicalSymptoms,

        timing,

        side,

        occurredWithoutPain:
          timing === 'withoutPain',

        durationMinutes:
          undefined,

        time: {
          ...aura.time,

          start:
            startPhaseTime,

          end: undefined,
        },

        updates: [
          ...updates,

          {
            id:
              generateAuraRecordId(),

            createdAt: now,

            occurredAt:
              buildAuraPhaseTime(
                occurredAt,
                'exact',
                recordMode,
              ),

            data:
              updateData,

            notes:
              normalizedNotes ||
              undefined,
          },
        ],
      });

      updateTimeline({
        auraStart:
          effectiveStart,

        auraEnd:
          undefined,

        episodeStart:
          getEarlierAuraDate(
            timeline?.episodeStart,
            effectiveStart,
          ),
      });

      setUpdateDateTime(
        getCurrentLocalDateTimeValue(),
      );

      setDraftNotes('');

      setFeedback(
        aura.present
          ? 'Actualización del aura registrada.'
          : 'Aura iniciada y primera actualización registrada.',
      );

      onComplete?.();
    };


  const finishAura = (
    selection:
      PhaseEndSelection,
  ) => {
    if (
      !isValidAuraDate(
        auraStart,
      )
    ) {
      setFeedback(
        'Primero registrá el inicio del aura.',
      );

      return;
    }

    const {
      endTime,
      precision,
      recordMode,
    } = selection;

    if (
      !isValidAuraDate(endTime)
    ) {
      return;
    }

    const endTimestamp =
      new Date(
        endTime,
      ).getTime();

    if (
      endTimestamp >
      Date.now()
    ) {
      setFeedback(
        'El final del aura no puede estar en el futuro.',
      );

      return;
    }

    if (
      endTimestamp <
      new Date(
        auraStart,
      ).getTime()
    ) {
      setFeedback(
        'El final del aura no puede ser anterior a su inicio.',
      );

      return;
    }

    const now =
      new Date().toISOString();

    const side =
      draftSide || undefined;

    const timing =
      draftTiming || undefined;

    const legacyFields =
      buildAuraLegacyFields(
        draftSymptoms,
      );

    const clinicalSymptoms =
      createAuraClinicalSelections(
        draftSymptoms,
        side,
        aura.clinicalSymptoms,
        false,
      );

    const types =
      getAuraTypes(
        draftSymptoms,
        aura.types,
      );

    const endPhaseTime =
      buildAuraPhaseTime(
        endTime,
        precision,
        recordMode,
      );

    const updateData:
      AuraUpdateData = {
      types,

      ...legacyFields,

      clinicalSymptoms,

      symptomsStillActive:
        false,
    };

    updateAura({
      ...aura,

      present: true,

      status: 'ended',

      types,

      ...legacyFields,

      clinicalSymptoms,

      timing,

      side,

      occurredWithoutPain:
        timing === 'withoutPain',

      durationMinutes:
        calculateAuraDurationMinutes(
          auraStart,
          endTime,
        ),

      time: {
        ...aura.time,

        start:
          aura.time?.start ??
          buildAuraPhaseTime(
            auraStart,
            'exact',
            inferAuraRecordMode(
              auraStart,
            ),
          ),

        end:
          endPhaseTime,
      },

      updates: [
        ...updates,

        {
          id:
            generateAuraRecordId(),

          createdAt: now,

          occurredAt:
            endPhaseTime,

          data:
            updateData,

          notes:
            draftNotes.trim() ||
            undefined,
        },
      ],
    });

    updateTimeline({
      auraStart,

      auraEnd:
        endTime,
    });

    setDraftNotes('');

    setShowEndSelector(false);

    setFeedback(
      'Final del aura registrado.',
    );

    onComplete?.();
  };


  const handleContinueAura = () => {
    setShowEndSelector(false);

    setFeedback(
      'El aura continúa abierta.',
    );
  };


  return (
    <section
      className={
        styles.symptomSelector
      }
      aria-labelledby="aura-title"
    >
      {isEnded && (
        <header>
          <h3 id="aura-title">
            Aura
          </h3>

          <p>
            El aura puede incluir cambios
            visuales, sensitivos, de
            lenguaje, motores o de
            equilibrio.
          </p>
        </header>
      )}


      {aura.present && (
        <p
          className={
            styles.helperText
          }
        >
          Inicio del aura:{' '}
          {formatAuraDateTime(
            auraStart,
            aura.time?.start
              ?.precision,
          )}

          {isEnded && (
            <>
              {' · '}
              Final:{' '}
              {formatAuraDateTime(
                auraEnd,
                aura.time?.end
                  ?.precision,
              )}
            </>
          )}
        </p>
      )}


      {!isEnded && (
        <>
          {isFirstUpdate ? (
            <AuraInitialFlow
              dateTime={
                updateDateTime
              }
              maxDateTime={
                getCurrentLocalDateTimeValue()
              }
              selectedSymptoms={
                draftSymptoms
              }
              timing={
                draftTiming
              }
              side={draftSide}
              notes={draftNotes}
              onDateTimeChange={value => {
                setUpdateDateTime(value);
                setFeedback('');
              }}
              onToggleSymptom={
                toggleSymptom
              }
              onTimingChange={value => {
                setDraftTiming(value);
                setFeedback('');
              }}
              onSideChange={value => {
                setDraftSide(value);
                setFeedback('');
              }}
              onNotesChange={value => {
                setDraftNotes(value);
                setFeedback('');
              }}
              onSave={
                handleRegisterUpdate
              }
            />
          ) : !showEndSelector ? (
            <AuraUpdateFlow
              currentSymptoms={
                currentSymptoms
              }
              selectedSymptoms={
                draftSymptoms
              }
              dateTime={
                updateDateTime
              }
              maxDateTime={
                getCurrentLocalDateTimeValue()
              }
              timing={
                draftTiming
              }
              side={draftSide}
              notes={draftNotes}
              onToggleSymptom={
                toggleSymptom
              }
              onResetSymptoms={() => {
                setDraftSymptoms(
                  currentSymptoms,
                );
                setFeedback('');
              }}
              onDateTimeChange={value => {
                setUpdateDateTime(value);
                setFeedback('');
              }}
              onTimingChange={value => {
                setDraftTiming(value);
                setFeedback('');
              }}
              onSideChange={value => {
                setDraftSide(value);
                setFeedback('');
              }}
              onNotesChange={value => {
                setDraftNotes(value);
                setFeedback('');
              }}
              onSave={
                handleRegisterUpdate
              }
              onOpenEnd={() => {
                setShowEndSelector(
                  true,
                );
                setFeedback('');
              }}
            />
          ) : null}
        </>
      )}


      {feedback && (
        <p
          className={
            styles.helperText
          }
          aria-live="polite"
        >
          {feedback}
        </p>
      )}


      {visibleUpdates.length > 0 && (
        <section
          className={
            evolutionStyles.evolutionSection
          }
        >
          <button
            type="button"
            className={
              evolutionStyles.evolutionToggle
            }
            aria-expanded={
              showEvolution
            }
            onClick={() =>
              setShowEvolution(
                current =>
                  !current,
              )
            }
          >
            <span>
              {showEvolution
                ? 'Ocultar evolución'
                : 'Ver evolución'}
            </span>

            <span
              aria-hidden="true"
            >
              {showEvolution
                ? '−'
                : '+'}
            </span>
          </button>

          {showEvolution && (
            <div
              className={
                evolutionStyles.evolutionContent
              }
            >
              <h4>
                Evolución del aura
              </h4>

          <ul>
            {visibleUpdates.map(
              update => {
                const updateTime =
                  update.occurredAt
                    .value ??
                  update.createdAt;

                const symptoms =
                  getAuraUpdateSymptoms(
                    update.data,
                  );

                return (
                  <li
                    key={update.id}
                  >
                    <p>
                      <b>
                        {formatAuraDateTime(
                          updateTime,
                          update
                            .occurredAt
                            .precision,
                        )}
                      </b>
                    </p>

                    <p>
                      <b>
                        Síntomas:
                      </b>{' '}

                      {symptoms.length >
                      0
                        ? symptoms
                            .map(
                              getAuraSymptomLabel,
                            )
                            .join(', ')
                        : 'Sin síntomas seleccionados'}
                    </p>

                    {update.notes && (
                      <p>
                        <b>Nota:</b>{' '}
                        {update.notes}
                      </p>
                    )}

                    {update.data
                      .symptomsStillActive ===
                      false && (
                      <p>
                        Final del aura.
                      </p>
                    )}
                  </li>
                );
              },
            )}
          </ul>
            </div>
          )}
        </section>
      )}


      {isActive &&
        showEndSelector && (
          <PhaseEndSelector
            title="¿Cuándo terminó el aura?"
            startTime={auraStart}
            onConfirm={finishAura}
            onContinue={
              handleContinueAura
            }
          />
        )}


      {isEnded && (
        <p
          className={
            styles.helperText
          }
        >
          Aura finalizada. Duración
          registrada:{' '}

          {aura.durationMinutes !==
          undefined
            ? `${aura.durationMinutes} minutos`
            : 'no calculada'}
        </p>
      )}
    </section>
  );
}