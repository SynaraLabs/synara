import {
  useMigraineStore,
} from '../../migraine/store/migraine.store';

import {
  getBasicMigrainePatterns,
} from '../utils/migrainePatternCalculations';

import {
  PatternRankingList,
} from './PatternRankingList';

import {
  PhasePatternsSummary,
} from './PhasePatternsSummary';

import {
  TreatmentEffectivenessSummary,
} from './TreatmentEffectivenessSummary';

export function MigrainePatternsSummary() {
  const history =
    useMigraineStore(
      state => state.history,
    );

  const patterns =
    getBasicMigrainePatterns(
      history,
    );

  return (
    <>
      <PhasePatternsSummary
        patterns={
          patterns.phasePatterns
        }
        totalCrises={
          patterns.crisisCount
        }
      />

      <PatternRankingList
        id="trigger-patterns-title"
        eyebrow="Patrones personales"
        title="Desencadenantes frecuentes"
        hint="Basado en crisis registradas"
        icon="◇"
        patterns={
          patterns.topTriggers
        }
        totalEpisodes={
          patterns.crisisCount
        }
        emptyTitle="Todavía no hay un patrón de desencadenantes"
        emptyDescription="Registrá posibles desencadenantes en tus crisis para compararlos a lo largo del tiempo."
        footer="Estos resultados muestran coincidencias en tus registros y no confirman una relación causal."
      />

      <PatternRankingList
        id="symptom-patterns-title"
        eyebrow="Evolución clínica"
        title="Síntomas más frecuentes"
        hint="Incluye toda la evolución de cada crisis"
        icon="○"
        patterns={
          patterns
            .topCrisisSymptoms
        }
        totalEpisodes={
          patterns.crisisCount
        }
        emptyTitle="Todavía no hay un patrón de síntomas"
        emptyDescription="Registrá síntomas durante tus crisis para identificar cuáles se repiten con mayor frecuencia."
      />

      <PatternRankingList
        id="pain-location-patterns-title"
        eyebrow="Distribución del dolor"
        title="Localizaciones más frecuentes"
        hint="Incluye cambios durante cada crisis"
        icon="⌖"
        patterns={
          patterns
            .topPainLocations
        }
        totalEpisodes={
          patterns.crisisCount
        }
        emptyTitle="Todavía no hay un patrón de localización"
        emptyDescription="Registrá las zonas donde aparece el dolor para comparar su distribución entre distintas crisis."
      />

      <PatternRankingList
        id="treatment-patterns-title"
        eyebrow="Respuesta al tratamiento"
        title="Tratamientos más utilizados"
        hint="Basado en crisis registradas"
        icon="+"
        patterns={
          patterns
            .treatmentPatterns
            .topTreatments
        }
        totalEpisodes={
          patterns.crisisCount
        }
        emptyTitle="Todavía no hay un patrón de tratamientos"
        emptyDescription="Registrá los tratamientos utilizados para comparar su uso y respuesta a lo largo del tiempo."
      />

      <TreatmentEffectivenessSummary
        patterns={
          patterns
            .treatmentPatterns
        }
      />
    </>
  );
}