import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const publicDirectory = resolve('public');
const sourceIcon = resolve(
  publicDirectory,
  'favicon.svg',
);

const icons = [
  {
    filename: 'pwa-192x192.png',
    size: 192,
  },
  {
    filename: 'pwa-512x512.png',
    size: 512,
  },
  {
    filename: 'apple-touch-icon.png',
    size: 180,
  },
];

async function generateIcons() {
  if (!existsSync(sourceIcon)) {
    throw new Error(
      `No se encontró el archivo: ${sourceIcon}`,
    );
  }

  for (const icon of icons) {
    const outputPath = resolve(
      publicDirectory,
      icon.filename,
    );

    await sharp(sourceIcon)
      .resize(icon.size, icon.size, {
        fit: 'contain',
        background: {
          r: 247,
          g: 248,
          b: 250,
          alpha: 1,
        },
      })
      .png()
      .toFile(outputPath);

    console.log(
      `Creado: public/${icon.filename}`,
    );
  }

  console.log(
    'Íconos PWA generados correctamente.',
  );
}

generateIcons().catch(error => {
  console.error(
    'No se pudieron generar los íconos:',
    error,
  );

  process.exit(1);
});