import {
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';

import {
  bodySideLabels,
  createPainLocationPoint,
  getAvailableSidesForRegion,
  painRegionCatalog,
} from '../../data/painLocationCatalog';

import type {
  AnatomicalPainMap,
  BodySide,
  PainAnatomicalRegion,
  PainLocationPoint,
} from '../../types/migraine.types';

import {
  PainBodyMap,
} from './PainBodyMap';

import styles from './PainLocationSelector.module.css';

type SelectableLocationRole =
  | 'origin'
  | 'primary'
  | 'additional';

interface PainLocationSelectorProps {
  value?: AnatomicalPainMap;

  onChange: (
    value: AnatomicalPainMap,
  ) => void;

  disabled?: boolean;
  title?: string;
}

interface SelectedLocationItem {
  key: string;
  point: PainLocationPoint;
  role: SelectableLocationRole;
  index?: number;
}

const LOCATION_ROLE_ORDER:
  SelectableLocationRole[] = [
  'origin',
  'primary',
  'additional',
];

const locationRoleLabels:
  Record<
    SelectableLocationRole,
    string
  > = {
  origin: 'Lugar de inicio',
  primary: 'Zona principal',
  additional: 'Zonas adicionales',
};

const roleInstructions:
  Record<
    SelectableLocationRole,
    string
  > = {
  origin:
    'Primero marcá dónde comenzó el dolor.',
  primary:
    'Ahora marcá dónde sentís el dolor con mayor intensidad.',
  additional:
    'Por último, agregá otras zonas donde también sentís dolor.',
};

const createNormalizedMap = (
  value?: AnatomicalPainMap,
): AnatomicalPainMap => ({
  ...value,
  additional:
    value?.additional.map(
      point => ({ ...point }),
    ) ?? [],
  radiation:
    value?.radiation?.map(
      path => ({
        ...path,
        from: { ...path.from },
        to: { ...path.to },
      }),
    ) ?? [],
  primary: value?.primary
    ? { ...value.primary }
    : undefined,
  origin: value?.origin
    ? { ...value.origin }
    : undefined,
});

const getInitialRole = (
  value: AnatomicalPainMap,
): SelectableLocationRole => {
  if (!value.origin) {
    return 'origin';
  }

  if (!value.primary) {
    return 'primary';
  }

  return 'additional';
};

function pointKey(
  point: PainLocationPoint,
): string {
  return `${point.region}:${point.side ?? 'unknown'}`;
}

function normalizeText(
  value: string,
): string {
  return value
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .toLocaleLowerCase('es-AR');
}

function isSamePoint(
  point: PainLocationPoint,
  region: PainAnatomicalRegion,
  side: BodySide,
): boolean {
  return (
    point.region === region &&
    (point.side ?? 'unknown') ===
      side
  );
}

export function PainLocationSelector({
  value,
  onChange,
  disabled = false,
  title = '¿Dónde sentís el dolor?',
}: PainLocationSelectorProps) {
  const searchId = useId();

  const valueSignature =
    JSON.stringify(
      createNormalizedMap(value),
    );

  const [draft, setDraft] =
    useState<AnatomicalPainMap>(
      () =>
        createNormalizedMap(value),
    );

  const [activeRole, setActiveRole] =
    useState<SelectableLocationRole>(
      () =>
        getInitialRole(
          createNormalizedMap(value),
        ),
    );

  const [search, setSearch] =
    useState('');

  const [pendingRegion, setPendingRegion] =
    useState<
      PainAnatomicalRegion | undefined
    >();

  const [pendingSide, setPendingSide] =
    useState<BodySide>('unknown');

  useEffect(() => {
    const nextValue =
      createNormalizedMap(value);

    setDraft(nextValue);
    setActiveRole(
      getInitialRole(nextValue),
    );
  }, [valueSignature]);

  const selectedLocations =
    useMemo<
      SelectedLocationItem[]
    >(() => {
      const items:
        SelectedLocationItem[] = [];

      if (draft.origin) {
        items.push({
          key:
            `origin-${pointKey(
              draft.origin,
            )}`,
          point: draft.origin,
          role: 'origin',
        });
      }

      if (draft.primary) {
        items.push({
          key:
            `primary-${pointKey(
              draft.primary,
            )}`,
          point: draft.primary,
          role: 'primary',
        });
      }

      draft.additional.forEach(
        (point, index) => {
          items.push({
            key:
              `additional-${index}-${pointKey(
                point,
              )}`,
            point,
            role: 'additional',
            index,
          });
        },
      );

      return items;
    }, [
      draft.origin,
      draft.primary,
      draft.additional,
    ]);

  const selectedMapPoints =
    useMemo<
      PainLocationPoint[]
    >(() => {
      return selectedLocations.map(
        item => ({
          ...item.point,
          role: item.role,
        }),
      );
    }, [selectedLocations]);

  const visibleRegions =
    useMemo(() => {
      const normalizedSearch =
        normalizeText(
          search.trim(),
        );

      if (!normalizedSearch) {
        return painRegionCatalog.filter(
          definition =>
            definition.frequent,
        );
      }

      return painRegionCatalog.filter(
        definition => {
          const searchable =
            normalizeText(
              [
                definition.label,
                definition.value,
                ...(
                  definition.searchTerms ??
                  []
                ),
              ].join(' '),
            );

          return searchable.includes(
            normalizedSearch,
          );
        },
      );
    }, [search]);

  const availableSides =
    pendingRegion
      ? getAvailableSidesForRegion(
          pendingRegion,
        )
      : [];

  const effectiveRole:
    SelectableLocationRole =
    !draft.origin
      ? 'origin'
      : !draft.primary
        ? 'primary'
        : activeRole;

  const hasRequiredLocations =
    Boolean(
      draft.origin &&
      draft.primary,
    );

  const hasChanges =
    JSON.stringify(draft) !==
    valueSignature;

  const findSelectedForRole = (
    region: PainAnatomicalRegion,
    side: BodySide,
    role: SelectableLocationRole,
  ) => {
    return selectedLocations.find(
      item =>
        item.role === role &&
        isSamePoint(
          item.point,
          region,
          side,
        ),
    );
  };

  const removeLocation = (
    item: SelectedLocationItem,
  ) => {
    if (disabled) {
      return;
    }

    if (item.role === 'origin') {
      setDraft(current => ({
        ...current,
        origin: undefined,
      }));

      setActiveRole('origin');
      return;
    }

    if (item.role === 'primary') {
      setDraft(current => ({
        ...current,
        primary: undefined,
      }));

      setActiveRole('primary');
      return;
    }

    setDraft(current => ({
      ...current,
      additional:
        current.additional.filter(
          (_, index) =>
            index !== item.index,
        ),
    }));
  };

  const addLocation = (
    region: PainAnatomicalRegion,
    side: BodySide,
  ) => {
    if (disabled) {
      return;
    }

    const selected =
      findSelectedForRole(
        region,
        side,
        effectiveRole,
      );

    if (selected) {
      removeLocation(selected);
      return;
    }

    const point =
      createPainLocationPoint(
        region,
        side,
        effectiveRole,
      );

    if (effectiveRole === 'origin') {
      setDraft(current => ({
        ...current,
        origin: point,
        additional:
          current.additional.filter(
            selectedPoint =>
              !isSamePoint(
                selectedPoint,
                region,
                side,
              ),
          ),
      }));

      setActiveRole('primary');
      return;
    }

    if (effectiveRole === 'primary') {
      setDraft(current => ({
        ...current,
        primary: point,
        additional:
          current.additional.filter(
            selectedPoint =>
              !isSamePoint(
                selectedPoint,
                region,
                side,
              ),
          ),
      }));

      setActiveRole('additional');
      return;
    }

    setDraft(current => {
      const matchesRequiredRole =
        (
          current.origin &&
          isSamePoint(
            current.origin,
            region,
            side,
          )
        ) ||
        (
          current.primary &&
          isSamePoint(
            current.primary,
            region,
            side,
          )
        );

      if (matchesRequiredRole) {
        return current;
      }

      const alreadyAdditional =
        current.additional.some(
          selectedPoint =>
            isSamePoint(
              selectedPoint,
              region,
              side,
            ),
        );

      if (alreadyAdditional) {
        return current;
      }

      return {
        ...current,
        additional: [
          ...current.additional,
          point,
        ],
      };
    });
  };

  const selectTextRegion = (
    region: PainAnatomicalRegion,
  ) => {
    const sides =
      getAvailableSidesForRegion(
        region,
      );

    const preferredSide =
      sides.includes('central')
        ? 'central'
        : sides.includes('bilateral')
          ? 'bilateral'
          : sides[0] ?? 'unknown';

    setPendingRegion(region);
    setPendingSide(preferredSide);
  };

  const addPendingLocation = () => {
    if (!pendingRegion) {
      return;
    }

    addLocation(
      pendingRegion,
      pendingSide,
    );

    setPendingRegion(undefined);
  };

  const clearAll = () => {
    if (disabled) {
      return;
    }

    setDraft({
      additional: [],
      radiation: [],
      changesSide: false,
    });

    setPendingRegion(undefined);
    setPendingSide('unknown');
    setActiveRole('origin');
  };

  const saveLocation = () => {
    if (
      disabled ||
      !hasRequiredLocations ||
      !hasChanges
    ) {
      return;
    }

    const normalizedDraft =
      createNormalizedMap(draft);

    normalizedDraft.additional =
      normalizedDraft.additional.filter(
        point => {
          const matchesOrigin =
            normalizedDraft.origin
              ? isSamePoint(
                  normalizedDraft.origin,
                  point.region,
                  point.side ??
                    'unknown',
                )
              : false;

          const matchesPrimary =
            normalizedDraft.primary
              ? isSamePoint(
                  normalizedDraft.primary,
                  point.region,
                  point.side ??
                    'unknown',
                )
              : false;

          return (
            !matchesOrigin &&
            !matchesPrimary
          );
        },
      );

    onChange(normalizedDraft);
  };

  return (
    <section
      className={styles.container}
      aria-labelledby="pain-location-title"
    >
      <header
        className={styles.header}
      >
        <div>
          <h3
            id="pain-location-title"
            className={styles.title}
          >
            {title}
          </h3>

          <p
            className={
              styles.description
            }
          >
            Completá los tres pasos y
            guardá todo como una sola
            actualización.
          </p>
        </div>

        {selectedLocations.length >
          0 && (
          <button
            type="button"
            className={
              styles.clearButton
            }
            disabled={disabled}
            onClick={clearAll}
          >
            Limpiar
          </button>
        )}
      </header>

      <section
        className={styles.rolePicker}
        aria-labelledby="location-role-title"
      >
        <div>
          <h4 id="location-role-title">
            {
              locationRoleLabels[
                effectiveRole
              ]
            }
          </h4>

          <p>
            {
              roleInstructions[
                effectiveRole
              ]
            }
          </p>
        </div>

        <div
          className={styles.roleOptions}
          role="group"
          aria-label="Pasos de localización"
        >
          {LOCATION_ROLE_ORDER.map(
            (role, index) => {
              const roleDisabled =
                disabled ||
                (
                  role === 'primary' &&
                  !draft.origin
                ) ||
                (
                  role === 'additional' &&
                  !draft.primary
                );

              return (
                <button
                  key={role}
                  type="button"
                  disabled={
                    roleDisabled
                  }
                  aria-pressed={
                    effectiveRole ===
                    role
                  }
                  data-role={role}
                  onClick={() =>
                    setActiveRole(role)
                  }
                >
                  {index + 1}.{' '}
                  {
                    locationRoleLabels[
                      role
                    ]
                  }
                </button>
              );
            },
          )}
        </div>
      </section>

      <PainBodyMap
        selectedPoints={
          selectedMapPoints
        }
        pendingRegion={
          pendingRegion
        }
        pendingSide={pendingSide}
        disabled={disabled}
        onSelect={addLocation}
      />

      <details
        className={styles.textSelector}
      >
        <summary>
          No encuentro la zona en el
          mapa
        </summary>

        <div
          className={styles.search}
        >
          <label htmlFor={searchId}>
            Buscar zona anatómica
          </label>

          <input
            id={searchId}
            type="search"
            value={search}
            disabled={disabled}
            placeholder="Ej.: detrás del ojo, oído, cervical…"
            onChange={event =>
              setSearch(
                event.target.value,
              )
            }
          />
        </div>

        <div
          className={styles.regionList}
        >
          {visibleRegions.map(
            definition => (
              <button
                key={definition.value}
                type="button"
                disabled={disabled}
                aria-pressed={
                  pendingRegion ===
                  definition.value
                }
                onClick={() =>
                  selectTextRegion(
                    definition.value,
                  )
                }
              >
                {definition.label}
              </button>
            ),
          )}
        </div>

        {pendingRegion && (
          <section
            className={
              styles.sideConfiguration
            }
          >
            <h4>Elegí el lado</h4>

            <div
              className={
                styles.sideOptions
              }
            >
              {availableSides.map(
                side => (
                  <button
                    key={side}
                    type="button"
                    disabled={disabled}
                    aria-pressed={
                      pendingSide ===
                      side
                    }
                    onClick={() =>
                      setPendingSide(
                        side,
                      )
                    }
                  >
                    {
                      bodySideLabels[
                        side
                      ]
                    }
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              className={
                styles.addButton
              }
              disabled={disabled}
              onClick={
                addPendingLocation
              }
            >
              Agregar zona
            </button>
          </section>
        )}
      </details>

      <section
        className={
          styles.sideConfiguration
        }
        aria-live="polite"
      >
        <div>
          <h4>
            Guardar actualización
          </h4>

          <p>
            {!draft.origin
              ? 'Falta marcar el lugar de inicio.'
              : !draft.primary
                ? 'Falta marcar la zona principal.'
                : hasChanges
                  ? 'Las zonas se guardarán juntas en la evolución.'
                  : 'La ubicación ya está guardada.'}
          </p>
        </div>

        <button
          type="button"
          className={styles.addButton}
          disabled={
            disabled ||
            !hasRequiredLocations ||
            !hasChanges
          }
          onClick={saveLocation}
        >
          Guardar ubicación
        </button>
      </section>
    </section>
  );
}