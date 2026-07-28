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
  primary: 'Zona principal',
  additional: 'Zona adicional',
  origin: 'Punto de inicio',
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
    .toLocaleLowerCase('es-AR');
}


export function PainLocationSelector({
  value,
  onChange,
  disabled = false,
  title = '¿Dónde sentís el dolor?',
}: PainLocationSelectorProps) {
  const currentValue:
    AnatomicalPainMap = value ?? {
    additional: [],
  };

  const [search, setSearch] =
    useState('');

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
  ] = useState<BodySide>('unknown');

  const [
    pendingRole,
    setPendingRole,
  ] = useState<
    SelectableLocationRole
  >('primary');


  const visibleRegions = useMemo(
    () => {
      const normalizedSearch =
        normalizeText(search.trim());

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
    },
    [
      search,
      selectedCategory,
    ],
  );


  const availableSides =
    pendingRegion
      ? getAvailableSidesForRegion(
          pendingRegion,
        )
      : [];


  const selectedLocations =
    useMemo<SelectedLocationItem[]>(
      () => {
        const items:
          SelectedLocationItem[] = [];

        if (currentValue.primary) {
          items.push({
            key: `primary-${createPointKey(
              currentValue.primary,
            )}`,
            point:
              currentValue.primary,
            role: 'primary',
          });
        }

        if (currentValue.origin) {
          items.push({
            key: `origin-${createPointKey(
              currentValue.origin,
            )}`,
            point:
              currentValue.origin,
            role: 'origin',
          });
        }

        currentValue.additional.forEach(
          (
            point,
            index,
          ) => {
            items.push({
              key: `additional-${index}-${createPointKey(
                point,
              )}`,
              point,
              role: 'additional',
              index,
            });
          },
        );

        return items;
      },
      [
        currentValue.primary,
        currentValue.origin,
        currentValue.additional,
      ],
    );


  const handleRegionSelection = (
    region: PainAnatomicalRegion,
  ) => {
    const sides =
      getAvailableSidesForRegion(
        region,
      );

    setPendingRegion(region);

    if (
      !sides.includes(
        pendingSide,
      )
    ) {
      setPendingSide(
        sides.includes('unknown')
          ? 'unknown'
          : sides[0],
      );
    }
  };


  const handleAddLocation = () => {
    if (
      !pendingRegion ||
      disabled
    ) {
      return;
    }

    const point =
      createPainLocationPoint(
        pendingRegion,
        pendingSide,
        pendingRole,
      );

    if (
      pendingRole === 'primary'
    ) {
      onChange({
        ...currentValue,
        primary: point,
      });

      return;
    }

    if (
      pendingRole === 'origin'
    ) {
      onChange({
        ...currentValue,
        origin: point,
      });

      return;
    }

    const pointKey =
      createPointKey(point);

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


  const handleRemoveLocation = (
    item: SelectedLocationItem,
  ) => {
    if (disabled) {
      return;
    }

    if (
      item.role === 'primary'
    ) {
      onChange({
        ...currentValue,
        primary: undefined,
      });

      return;
    }

    if (
      item.role === 'origin'
    ) {
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
          (
            _,
            index,
          ) =>
            index !== item.index,
        ),
    });
  };


  const handleClearAll = () => {
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
            Podés registrar una zona
            principal, otras zonas
            afectadas y el punto donde
            comenzó.
          </p>
        </div>

        {selectedLocations.length >
          0 && (
          <button
            type="button"
            onClick={
              handleClearAll
            }
            disabled={disabled}
            className="pain-location-selector__clear"
          >
            Limpiar
          </button>
        )}
      </header>


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
          value={search}
          onChange={event =>
            setSearch(
              event.target.value,
            )
          }
          placeholder="Ej.: sien, ojo, cuello…"
          disabled={disabled}
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
          disabled={disabled}
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
              key={category}
              type="button"
              onClick={() =>
                setSelectedCategory(
                  category,
                )
              }
              disabled={disabled}
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
            definition => {
              const isSelected =
                pendingRegion ===
                definition.value;

              return (
                <button
                  key={
                    definition.value
                  }
                  type="button"
                  onClick={() =>
                    handleRegionSelection(
                      definition.value,
                    )
                  }
                  disabled={
                    disabled
                  }
                  aria-pressed={
                    isSelected
                  }
                  className="pain-location-selector__region"
                >
                  {
                    definition.label
                  }
                </button>
              );
            },
          )
        )}
      </div>


      {pendingRegion && (
        <div className="pain-location-selector__configuration">
          <div className="pain-location-selector__configuration-group">
            <span className="pain-location-selector__label">
              Lado
            </span>

            <div className="pain-location-selector__options">
              {availableSides.map(
                side => (
                  <button
                    key={side}
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


          <div className="pain-location-selector__configuration-group">
            <span className="pain-location-selector__label">
              ¿Qué representa esta
              zona?
            </span>

            <div className="pain-location-selector__options">
              {(
                Object.keys(
                  locationRoleLabels,
                ) as SelectableLocationRole[]
              ).map(
                role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() =>
                      setPendingRole(
                        role,
                      )
                    }
                    disabled={
                      disabled
                    }
                    aria-pressed={
                      pendingRole ===
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
          </div>


          <button
            type="button"
            onClick={
              handleAddLocation
            }
            disabled={disabled}
            className="pain-location-selector__add"
          >
            Agregar localización
          </button>
        </div>
      )}


      {selectedLocations.length >
        0 && (
        <div className="pain-location-selector__selected">
          <h4 className="pain-location-selector__selected-title">
            Localizaciones
            registradas
          </h4>

          <ul className="pain-location-selector__selected-list">
            {selectedLocations.map(
              item => (
                <li
                  key={item.key}
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
                      handleRemoveLocation(
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
        </div>
      )}
    </section>
  );
}