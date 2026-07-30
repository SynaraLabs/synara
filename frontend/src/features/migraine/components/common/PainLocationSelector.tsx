import {
  useMemo,
  useState,
} from 'react';

import {
  bodySideLabels,
  createPainLocationPoint,
  formatPainLocationPoint,
  getAvailableSidesForRegion,
  painRegionCatalog,
  painRegionCategoryLabels,
} from '../../data/painLocationCatalog';

import type {
  AnatomicalPainMap,
  BodySide,
  PainAnatomicalRegion,
  PainLocationPoint,
  PainRegionCategory,
} from '../../types/migraine.types';

import { PainBodyMap } from './PainBodyMap';


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


const CATEGORY_ORDER:
  PainRegionCategory[] = [
  'head',
  'eye',
  'face',
  'ear',
  'jaw',
  'neck',
  'upperBody',
  'diffuse',
  'other',
];


const locationRoleLabels:
  Record<
    SelectableLocationRole,
    string
  > = {
  primary:
    'Zona principal',

  additional:
    'Zona adicional',

  origin:
    'Punto de inicio',
};


function createPointKey(
  point: PainLocationPoint,
): string {
  return [
    point.region,
    point.side ?? 'unknown',
  ].join(':');
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
    .toLocaleLowerCase(
      'es-AR',
    );
}


function isSameLocation(
  point: PainLocationPoint,
  region: PainAnatomicalRegion,
  side: BodySide,
): boolean {
  return (
    point.region === region &&
    (
      point.side ??
      'unknown'
    ) === side
  );
}


export function PainLocationSelector({
  value,
  onChange,
  disabled = false,
  title = '¿Dónde sentís el dolor?',
}: PainLocationSelectorProps) {
  const currentValue:
    AnatomicalPainMap = {
    ...value,

    additional:
      value?.additional ?? [],

    radiation:
      value?.radiation ?? [],
  };


  const [
    search,
    setSearch,
  ] = useState('');

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<
    PainRegionCategory | 'all'
  >('all');

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


  const visibleRegions =
    useMemo(() => {
      const normalizedSearch =
        normalizeText(
          search.trim(),
        );

      return painRegionCatalog.filter(
        definition => {
          if (
            selectedCategory !==
              'all' &&
            definition.category !==
              selectedCategory
          ) {
            return false;
          }

          if (!normalizedSearch) {
            return true;
          }

          const searchableText =
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

          return searchableText.includes(
            normalizedSearch,
          );
        },
      );
    }, [
      search,
      selectedCategory,
    ]);


  const availableSides =
    pendingRegion
      ? getAvailableSidesForRegion(
          pendingRegion,
        )
      : [];


  const selectedLocations =
    useMemo<
      SelectedLocationItem[]
    >(() => {
      const items:
        SelectedLocationItem[] = [];

      if (currentValue.primary) {
        items.push({
          key:
            `primary-${createPointKey(
              currentValue.primary,
            )}`,

          point:
            currentValue.primary,

          role:
            'primary',
        });
      }

      if (currentValue.origin) {
        items.push({
          key:
            `origin-${createPointKey(
              currentValue.origin,
            )}`,

          point:
            currentValue.origin,

          role:
            'origin',
        });
      }

      currentValue.additional.forEach(
        (
          point,
          index,
        ) => {
          items.push({
            key:
              `additional-${index}-${createPointKey(
                point,
              )}`,

            point,

            role:
              'additional',

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
      const points = [
        ...(currentValue.primary
          ? [
              currentValue.primary,
            ]
          : []),

        ...(currentValue.origin
          ? [
              currentValue.origin,
            ]
          : []),

        ...currentValue.additional,
      ];

      return points.filter(
        (
          point,
          index,
          allPoints,
        ) =>
          allPoints.findIndex(
            candidate =>
              createPointKey(
                candidate,
              ) ===
              createPointKey(
                point,
              ),
          ) === index,
      );
    }, [
      currentValue.primary,
      currentValue.origin,
      currentValue.additional,
    ]);


  const findSelectedLocation = (
    region:
      PainAnatomicalRegion,

    side:
      BodySide,
  ):
    | SelectedLocationItem
    | undefined => {
    return selectedLocations.find(
      item =>
        isSameLocation(
          item.point,
          region,
          side,
        ),
    );
  };


  const removeSelectedLocation = (
    item:
      SelectedLocationItem,
  ) => {
    if (disabled) {
      return;
    }

    if (
      item.role ===
      'primary'
    ) {
      onChange({
        ...currentValue,

        primary:
          undefined,
      });

      setActiveRole(
        'primary',
      );

      return;
    }

    if (
      item.role ===
      'origin'
    ) {
      onChange({
        ...currentValue,

        origin:
          undefined,
      });

      return;
    }

    onChange({
      ...currentValue,

      additional:
        currentValue.additional.filter(
          (
            _,
            index,
          ) =>
            index !==
            item.index,
        ),
    });
  };


  const addLocation = (
    region:
      PainAnatomicalRegion,

    side:
      BodySide,

    role:
      SelectableLocationRole,
  ) => {
    if (disabled) {
      return;
    }

    const point =
      createPainLocationPoint(
        region,
        side,
        role,
      );


    if (
      role ===
      'primary'
    ) {
      onChange({
        ...currentValue,

        primary:
          point,
      });

      /*
       * Después de registrar la zona
       * principal, los siguientes
       * toques agregan nuevas zonas.
       */
      setActiveRole(
        'additional',
      );

      return;
    }


    if (
      role ===
      'origin'
    ) {
      onChange({
        ...currentValue,

        origin:
          point,
      });

      /*
       * Después de indicar el origen,
       * volvemos al modo de varias
       * zonas adicionales.
       */
      setActiveRole(
        'additional',
      );

      return;
    }


    const pointKey =
      createPointKey(
        point,
      );

    const additionalWithoutDuplicate =
      currentValue.additional.filter(
        existingPoint =>
          createPointKey(
            existingPoint,
          ) !== pointKey,
      );

    onChange({
      ...currentValue,

      additional: [
        ...additionalWithoutDuplicate,
        point,
      ],
    });
  };


  const handleMapSelection = (
    region:
      PainAnatomicalRegion,

    side:
      BodySide,
  ) => {
    if (disabled) {
      return;
    }

    const selectedLocation =
      findSelectedLocation(
        region,
        side,
      );

    /*
     * Volver a tocar una zona ya
     * marcada la elimina.
     */
    if (selectedLocation) {
      removeSelectedLocation(
        selectedLocation,
      );

      return;
    }

    /*
     * Si todavía no existe una zona
     * principal, la primera selección
     * siempre se registra como tal.
     */
    const effectiveRole =
      !currentValue.primary
        ? 'primary'
        : activeRole;

    addLocation(
      region,
      side,
      effectiveRole,
    );
  };


  const handleTextRegionSelection = (
    region:
      PainAnatomicalRegion,
  ) => {
    const sides =
      getAvailableSidesForRegion(
        region,
      );

    setPendingRegion(
      region,
    );

    if (
      sides.includes(
        pendingSide,
      )
    ) {
      return;
    }

    if (
      sides.includes(
        'unknown',
      )
    ) {
      setPendingSide(
        'unknown',
      );

      return;
    }

    setPendingSide(
      sides[0],
    );
  };


  const handleAddPendingLocation =
    () => {
      if (
        !pendingRegion ||
        disabled
      ) {
        return;
      }

      const selectedLocation =
        findSelectedLocation(
          pendingRegion,
          pendingSide,
        );

      if (selectedLocation) {
        removeSelectedLocation(
          selectedLocation,
        );

        return;
      }

      const effectiveRole =
        !currentValue.primary
          ? 'primary'
          : activeRole;

      addLocation(
        pendingRegion,
        pendingSide,
        effectiveRole,
      );
    };


  const handleClearAll =
    () => {
      if (disabled) {
        return;
      }

      onChange({
        ...currentValue,

        primary:
          undefined,

        origin:
          undefined,

        additional: [],

        radiation: [],

        changesSide:
          false,
      });

      setPendingRegion(
        undefined,
      );

      setPendingSide(
        'unknown',
      );

      setActiveRole(
        'primary',
      );
    };


  return (
    <section
      className="pain-location-selector"
      aria-labelledby="pain-location-title"
    >
      <header className="pain-location-selector__header">
        <div>
          <h3
            id="pain-location-title"
            className="pain-location-selector__title"
          >
            {title}
          </h3>

          <p className="pain-location-selector__description">
            La primera zona será la
            principal. Después podés
            tocar todas las zonas
            adicionales que necesites.
          </p>

          <p className="pain-location-selector__description">
            Para quitar una zona,
            volvé a tocarla.
          </p>
        </div>

        {selectedLocations.length >
          0 && (
          <button
            type="button"
            onClick={
              handleClearAll
            }
            disabled={
              disabled
            }
            className="pain-location-selector__clear"
          >
            Limpiar mapa
          </button>
        )}
      </header>


      <section className="pain-location-selector__configuration">
        <h4>
          ¿Qué representa la próxima
          zona?
        </h4>

        <div className="pain-location-selector__options">
          {(
            Object.keys(
              locationRoleLabels,
            ) as
              SelectableLocationRole[]
          ).map(
            role => (
              <button
                key={
                  role
                }
                type="button"
                onClick={() =>
                  setActiveRole(
                    role,
                  )
                }
                disabled={
                  disabled
                }
                aria-pressed={
                  activeRole ===
                  role
                }
                className="pain-location-selector__option"
              >
                {
                  locationRoleLabels[
                    role
                  ]
                }
              </button>
            ),
          )}
        </div>

        <p className="pain-location-selector__description">
          Modo actual:{' '}

          <b>
            {
              locationRoleLabels[
                activeRole
              ]
            }
          </b>
        </p>
      </section>


      <PainBodyMap
        selectedPoints={
          selectedMapPoints
        }
        disabled={
          disabled
        }
        onSelect={
          handleMapSelection
        }
      />


      <details className="pain-location-selector__text-selector">
        <summary>
          Buscar zona en una lista
        </summary>

        <div className="pain-location-selector__search">
          <label
            htmlFor="pain-location-search"
            className="pain-location-selector__label"
          >
            Buscar una zona
          </label>

          <input
            id="pain-location-search"
            type="search"
            value={
              search
            }
            onChange={event =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Ej.: sien, ojo, cuello…"
            disabled={
              disabled
            }
            className="pain-location-selector__search-input"
          />
        </div>


        <div
          className="pain-location-selector__categories"
          aria-label="Categorías anatómicas"
        >
          <button
            type="button"
            onClick={() =>
              setSelectedCategory(
                'all',
              )
            }
            disabled={
              disabled
            }
            aria-pressed={
              selectedCategory ===
              'all'
            }
            className="pain-location-selector__category"
          >
            Todas
          </button>

          {CATEGORY_ORDER.map(
            category => (
              <button
                key={
                  category
                }
                type="button"
                onClick={() =>
                  setSelectedCategory(
                    category,
                  )
                }
                disabled={
                  disabled
                }
                aria-pressed={
                  selectedCategory ===
                  category
                }
                className="pain-location-selector__category"
              >
                {
                  painRegionCategoryLabels[
                    category
                  ]
                }
              </button>
            ),
          )}
        </div>


        <div className="pain-location-selector__regions">
          {visibleRegions.length ===
          0 ? (
            <p className="pain-location-selector__empty">
              No encontramos una zona
              con ese nombre.
            </p>
          ) : (
            visibleRegions.map(
              definition => (
                <button
                  key={
                    definition.value
                  }
                  type="button"
                  onClick={() =>
                    handleTextRegionSelection(
                      definition.value,
                    )
                  }
                  disabled={
                    disabled
                  }
                  aria-pressed={
                    pendingRegion ===
                    definition.value
                  }
                  className="pain-location-selector__region"
                >
                  {
                    definition.label
                  }
                </button>
              ),
            )
          )}
        </div>


        {pendingRegion && (
          <section className="pain-location-selector__configuration">
            <h4>
              Configurar zona
            </h4>

            <p>
              {
                painRegionCatalog.find(
                  definition =>
                    definition.value ===
                    pendingRegion,
                )?.label
              }
            </p>

            <div className="pain-location-selector__configuration-group">
              <span className="pain-location-selector__label">
                Lado
              </span>

              <div className="pain-location-selector__options">
                {availableSides.map(
                  side => (
                    <button
                      key={
                        side
                      }
                      type="button"
                      onClick={() =>
                        setPendingSide(
                          side,
                        )
                      }
                      disabled={
                        disabled
                      }
                      aria-pressed={
                        pendingSide ===
                        side
                      }
                      className="pain-location-selector__option"
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
            </div>

            <button
              type="button"
              onClick={
                handleAddPendingLocation
              }
              disabled={
                disabled
              }
              className="pain-location-selector__add"
            >
              Agregar esta zona
            </button>
          </section>
        )}
      </details>


      {selectedLocations.length >
        0 && (
        <section className="pain-location-selector__selected">
          <h4 className="pain-location-selector__selected-title">
            Localizaciones registradas
          </h4>

          <ul className="pain-location-selector__selected-list">
            {selectedLocations.map(
              item => (
                <li
                  key={
                    item.key
                  }
                  className="pain-location-selector__selected-item"
                >
                  <div>
                    <span className="pain-location-selector__selected-role">
                      {
                        locationRoleLabels[
                          item.role
                        ]
                      }
                    </span>

                    <span className="pain-location-selector__selected-location">
                      {formatPainLocationPoint(
                        item.point,
                      )}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeSelectedLocation(
                        item,
                      )
                    }
                    disabled={
                      disabled
                    }
                    aria-label={`Eliminar ${formatPainLocationPoint(
                      item.point,
                    )}`}
                    className="pain-location-selector__remove"
                  >
                    Eliminar
                  </button>
                </li>
              ),
            )}
          </ul>
        </section>
      )}
    </section>
  );
}