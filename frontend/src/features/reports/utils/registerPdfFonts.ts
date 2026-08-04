import type {
  jsPDF,
} from 'jspdf';

import notoSansRegularUrl from '../../../assets/fonts/NotoSans-Regular.ttf?url';

import notoSansBoldUrl from '../../../assets/fonts/NotoSans-Bold.ttf?url';

const arrayBufferToBase64 = (
  buffer: ArrayBuffer,
): string => {
  const bytes =
    new Uint8Array(buffer);

  const chunkSize =
    32_768;

  let binary = '';

  for (
    let index = 0;
    index < bytes.length;
    index += chunkSize
  ) {
    const chunk =
      bytes.subarray(
        index,
        Math.min(
          index + chunkSize,
          bytes.length,
        ),
      );

    binary +=
      String.fromCharCode(
        ...chunk,
      );
  }

  return btoa(binary);
};

const loadFont = async (
  url: string,
): Promise<string> => {
  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      'No se pudo cargar la fuente del informe.',
    );
  }

  const buffer =
    await response.arrayBuffer();

  return arrayBufferToBase64(
    buffer,
  );
};

export const registerPdfFonts =
  async (
    document: jsPDF,
  ): Promise<void> => {
    const [
      regularFont,
      boldFont,
    ] = await Promise.all([
      loadFont(
        notoSansRegularUrl,
      ),

      loadFont(
        notoSansBoldUrl,
      ),
    ]);

    document.addFileToVFS(
      'NotoSans-Regular.ttf',
      regularFont,
    );

    document.addFont(
      'NotoSans-Regular.ttf',
      'NotoSans',
      'normal',
    );

    document.addFileToVFS(
      'NotoSans-Bold.ttf',
      boldFont,
    );

    document.addFont(
      'NotoSans-Bold.ttf',
      'NotoSans',
      'bold',
    );

    document.setFont(
      'NotoSans',
      'normal',
    );
  };