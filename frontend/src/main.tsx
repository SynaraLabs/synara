import React from 'react';
import ReactDOM from 'react-dom/client';

import {
  RouterProvider,
} from 'react-router-dom';

import {
  registerSW,
} from 'virtual:pwa-register';

import { router } from './router';

import './styles/globals.css';

const updateServiceWorker =
  registerSW({
    immediate: true,

    onRegisteredSW(
      _swUrl,
      registration,
    ) {
      if (!registration) {
        return;
      }

      const checkForUpdate = () => {
        if (
          document.visibilityState !==
            'visible' ||
          !navigator.onLine ||
          registration.installing
        ) {
          return;
        }

        void registration.update();
      };

      document.addEventListener(
        'visibilitychange',
        checkForUpdate,
      );

      window.addEventListener(
        'online',
        checkForUpdate,
      );

      checkForUpdate();
    },

    onRegisterError(error) {
      console.error(
        'No se pudo registrar la actualización de SYNARA.',
        error,
      );
    },
  });

void updateServiceWorker;

ReactDOM
  .createRoot(
    document.getElementById('root')!,
  )
  .render(
    <React.StrictMode>
      <RouterProvider
        router={router}
      />
    </React.StrictMode>,
  );