import {
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import styles from './WelcomePage.module.css';

const ONBOARDING_STORAGE_KEY =
  'synara-onboarding-completed';

interface WelcomeStep {
  eyebrow: string;
  title: string;
  description: string;
  detail?: string;
}

const STEPS: WelcomeStep[] = [
  {
    eyebrow: 'SYNARA',
    title: 'Todo está conectado.',
    description:
      'Una forma más clara de registrar tu migraña y entender cómo evoluciona cada episodio.',
    detail:
      'No hace falta completar todo de una vez. Registrá lo que estés atravesando en cada momento.',
  },
  {
    eyebrow: 'Tu recorrido',
    title:
      'Registrá más que el dolor.',
    description:
      'Señales previas, aura, crisis y recuperación pueden formar parte del mismo episodio.',
    detail:
      'Cada experiencia es distinta. SYNARA te permite registrar solo las fases que realmente ocurrieron.',
  },
  {
    eyebrow: 'Tu información',
    title:
      'Un registro personal, en tu dispositivo.',
    description:
      'Esta primera versión guarda tus episodios localmente para que puedas volver a consultarlos cuando lo necesites.',
    detail:
      'Si borrás los datos del navegador o cambiás de dispositivo, esta información puede perderse.',
  },
];

export function WelcomePage() {
  const navigate =
    useNavigate();

  const [
    currentStep,
    setCurrentStep,
  ] = useState(0);

  const step =
    STEPS[currentStep];

  const isLastStep =
    currentStep ===
    STEPS.length - 1;

  const handleContinue = () => {
    if (!isLastStep) {
      setCurrentStep(
        current =>
          current + 1,
      );

      return;
    }

    localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      'true',
    );

    navigate('/', {
      replace: true,
    });
  };

  const handleBack = () => {
    setCurrentStep(
      current =>
        Math.max(
          0,
          current - 1,
        ),
    );
  };

  return (
    <main
      className={styles.page}
      aria-labelledby="welcome-title"
    >
      <section
        className={styles.shell}
      >
        <header
          className={styles.brand}
        >
          <div
            className={
              styles.brandMark
            }
            aria-hidden="true"
          >
            S
          </div>

          <div>
            <strong>
              SYNARA
            </strong>

            <span>
              Todo está conectado
            </span>
          </div>
        </header>

        <section
          className={styles.content}
          key={currentStep}
        >
          <p
            className={styles.eyebrow}
          >
            {step.eyebrow}
          </p>

          <h1 id="welcome-title">
            {step.title}
          </h1>

          <p
            className={
              styles.description
            }
          >
            {step.description}
          </p>

          {currentStep === 1 && (
            <div
              className={
                styles.phaseFlow
              }
              aria-label="Fases que puede registrar SYNARA"
            >
              <span
                data-tone="premonitory"
              >
                Señales
              </span>

              <i
                aria-hidden="true"
              />

              <span data-tone="aura">
                Aura
              </span>

              <i
                aria-hidden="true"
              />

              <span data-tone="crisis">
                Crisis
              </span>

              <i
                aria-hidden="true"
              />

              <span
                data-tone="recovery"
              >
                Recuperación
              </span>
            </div>
          )}

          <p
            className={styles.detail}
          >
            {step.detail}
          </p>
        </section>

        <footer
          className={styles.footer}
        >
          <div
            className={
              styles.progress
            }
            aria-label={`Paso ${
              currentStep + 1
            } de ${STEPS.length}`}
          >
            {STEPS.map(
              (_, index) => (
                <span
                  key={index}
                  aria-hidden="true"
                  data-active={
                    index ===
                    currentStep
                      ? 'true'
                      : undefined
                  }
                />
              ),
            )}
          </div>

          <div
            className={
              styles.actions
            }
          >
            {currentStep > 0 && (
              <button
                type="button"
                className={
                  styles.backButton
                }
                onClick={
                  handleBack
                }
              >
                Atrás
              </button>
            )}

            <button
              type="button"
              className={
                styles.continueButton
              }
              onClick={
                handleContinue
              }
            >
              {isLastStep
                ? 'Entrar a SYNARA'
                : currentStep === 0
                  ? 'Comenzar'
                  : 'Continuar'}
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}