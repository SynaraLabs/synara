import {
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
  | 'primary'
  | 'additional'
  | 'origin';

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

const locationRoleLabels:
  Record<
    SelectableLocationRole,
    string
  > = {
  primary: 'Zona principal',
  additional: 'Zona adicional',
  origin: 'Punto de inicio',
};

const roleInstructions:
  Record<
    SelectableLocationRole,
    string
  > = {
  primary:
    'La zona donde el dolor es más importante.',
  additional:
    'Otra zona donde también sentís dolor.',
  origin:
    'El lugar donde comenzó el dolor.',
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

  const currentValue:
    AnatomicalPainMap = {
    ...value,
    additional:
      value?.additional ?? [],
    radiation:
      value?.radiation ?? [],
  };

  const [
    activeRole,
    setActiveRole,
  ] = useState<
    SelectableLocationRole
  >(
    value?.primary
      ? 'additional'
      : 'primary',
  );

  const [search, setSearch] =
    useState('');

  const [
    pendingRegion,
    setPendingRegion,
  ] = useState<
    PainAnatomicalRegion | undefined
  >();

  const [
    pendingSide,
    setPendingSide,
  ] = useState<BodySide>(
    'unknown',
  );

  const selectedLocations =
    useMemo<
      SelectedLocationItem[]
    >(() => {
      const items:
        SelectedLocationItem[] = [];

      if (currentValue.primary) {
        items.push({
          key:
            `primary-${pointKey(
              currentValue.primary,
            )}`,
          point:
            currentValue.primary,
          role: 'primary',
        });
      }

      if (currentValue.origin) {
        items.push({
          key:
            `origin-${pointKey(
              currentValue.origin,
            )}`,
          point:
            currentValue.origin,
          role: 'origin',
        });
      }

      currentValue.additional.forEach(
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
      currentValue.primary,
      currentValue.origin,
      currentValue.additional,
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

      const regions =
        normalizedSearch
          ? painRegionCatalog.filter(
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
            )
          : painRegionCatalog.filter(
              definition =>
                definition.frequent,
            );

      return regions;
    }, [search]);

  const availableSides =
    pendingRegion
      ? getAvailableSidesForRegion(
          pendingRegion,
        )
      : [];

  const findSelected = (
    region: PainAnatomicalRegion,
    side: BodySide,
  ) => {
    return selectedLocations.find(
      item =>
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

    if (item.role === 'primary') {
      onChange({
        ...currentValue,
        primary: undefined,
      });

      setActiveRole('primary');
      return;
    }

    if (item.role === 'origin') {
      onChange({
        ...currentValue,
        origin: undefined,
      });

      return;
    }

    onChange({
      ...currentValue,
      additional:
        currentValue.additional.filter(
          (_, index) =>
            index !== item.index,
        ),
    });
  };

  const addLocation = (
    region: PainAnatomicalRegion,
    side: BodySide,
  ) => {
    if (disabled) {
      return;
    }

    const selected =
      findSelected(region, side);

    if (selected) {
      removeLocation(selected);
      return;
    }

    const role:
      SelectableLocationRole =
      currentValue.primary
        ? activeRole
        : 'primary';

    const point =
      createPainLocationPoint(
        region,
        side,
        role,
      );

    if (role === 'primary') {
      onChange({
        ...currentValue,
        primary: point,
      });

      setActiveRole('additional');
      return;
    }

    if (role === 'origin') {
      onChange({
        ...currentValue,
        origin: point,
      });

      setActiveRole('additional');
      return;
    }

    onChange({
      ...currentValue,
      additional: [
        ...currentValue.additional,
        point,
      ],
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

  const addPendingLocation =
    () => {
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

    onChange({
      ...currentValue,
      primary: undefined,
      origin: undefined,
      additional: [],
      radiation: [],
      changesSide: false,
    });

    setPendingRegion(undefined);
    setPendingSide('unknown');
    setActiveRole('primary');
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
            Elegí qué querés marcar y
            tocá directamente una zona
            del mapa.
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
            ¿Qué querés marcar?
          </h4>

          <p>
            {
              roleInstructions[
                activeRole
              ]
            }
          </p>
        </div>

        <div
          className={styles.roleOptions}
          role="group"
          aria-label="Tipo de localización"
        >
          {(
            Object.keys(
              locationRoleLabels,
            ) as
              SelectableLocationRole[]
          ).map(role => (
            <button
              key={role}
              type="button"
              disabled={disabled}
              aria-pressed={
                activeRole === role
              }
              data-role={role}
              onClick={() =>
                setActiveRole(role)
              }
            >
              {
                locationRoleLabels[
                  role
                ]
              }
            </button>
          ))}
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
                key={
                  definition.value
                }
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
            <h4>
              Elegí el lado
            </h4>

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

    </section>
  );
}