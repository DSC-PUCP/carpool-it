import { type ClassValue, clsx } from 'clsx';
import jsQR from 'jsqr';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getFallbackAvatar = (fullName: string | undefined) => {
  if (!fullName) return;
  const splited = fullName.split(' ');
  return `${splited[0].charAt(0)}${splited[2].charAt(0)}`;
};

export class Result<T> {
  private readonly success: boolean;
  private readonly value?: T;
  private readonly error?: Error;

  private constructor(success: boolean, value?: T, error?: Error) {
    this.success = success;
    this.value = value;
    this.error = error;
  }

  static success<T>(value?: T): Result<T> {
    return new Result<T>(true, value);
  }

  static error<T>(error: Error): Result<T> {
    return new Result<T>(false, undefined, error);
  }

  isSuccess(): boolean {
    return this.success;
  }

  isFailure(): boolean {
    return !this.isSuccess();
  }

  getValue(): T | undefined {
    return this.value;
  }

  getError(): Error | undefined {
    return this.error;
  }
}

export async function processQRScreenshot(file: File) {
  const MAX_SIZE = 600;
  const PADDING = 12;
  const QUALITY = 0.001;

  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo no es una imagen válida');
  }

  const bitmap = await createImageBitmap(file);

  const baseCanvas = document.createElement('canvas');
  const baseCtx = baseCanvas.getContext('2d') as CanvasRenderingContext2D;

  baseCanvas.width = bitmap.width;
  baseCanvas.height = bitmap.height;
  baseCtx.drawImage(bitmap, 0, 0);

  const imageData = baseCtx.getImageData(
    0,
    0,
    baseCanvas.width,
    baseCanvas.height
  );

  const qr = jsQR(imageData.data, baseCanvas.width, baseCanvas.height);

  if (!qr) {
    throw new Error('No se detectó un QR en la imagen');
  }

  const points = [
    qr.location.topLeftCorner,
    qr.location.topRightCorner,
    qr.location.bottomLeftCorner,
    qr.location.bottomRightCorner,
  ];

  const minX = Math.max(Math.min(...points.map((p) => p.x)) - PADDING, 0);
  const minY = Math.max(Math.min(...points.map((p) => p.y)) - PADDING, 0);
  const maxX = Math.min(
    Math.max(...points.map((p) => p.x)) + PADDING,
    baseCanvas.width
  );
  const maxY = Math.min(
    Math.max(...points.map((p) => p.y)) + PADDING,
    baseCanvas.height
  );

  const cropWidth = maxX - minX;
  const cropHeight = maxY - minY;

  const cropCanvas = document.createElement('canvas');
  const cropCtx = cropCanvas.getContext('2d') as CanvasRenderingContext2D;

  cropCanvas.width = cropWidth;
  cropCanvas.height = cropHeight;

  cropCtx.drawImage(
    baseCanvas,
    minX,
    minY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  let finalCanvas = cropCanvas;

  if (cropWidth > MAX_SIZE || cropHeight > MAX_SIZE) {
    const scale = Math.min(MAX_SIZE / cropWidth, MAX_SIZE / cropHeight);

    const resizeCanvas = document.createElement('canvas');
    const resizeCtx = resizeCanvas.getContext('2d') as CanvasRenderingContext2D;

    resizeCanvas.width = Math.round(cropWidth * scale);
    resizeCanvas.height = Math.round(cropHeight * scale);

    resizeCtx.drawImage(
      cropCanvas,
      0,
      0,
      resizeCanvas.width,
      resizeCanvas.height
    );

    finalCanvas = resizeCanvas;
  }

  const finalCtx = finalCanvas.getContext('2d') as CanvasRenderingContext2D;
  const finalImageData = finalCtx.getImageData(
    0,
    0,
    finalCanvas.width,
    finalCanvas.height
  );

  const qrValidado = jsQR(
    finalImageData.data,
    finalCanvas.width,
    finalCanvas.height
  );

  if (!qrValidado) {
    throw new Error('El QR dejó de ser legible tras el procesamiento');
  }

  const blob = (await new Promise((resolve) => {
    finalCanvas.toBlob(
      (data) => {
        if (!data) {
          throw new Error('Error al procesar la imagen');
        }
        resolve(data);
      },
      'image/webp',
      QUALITY
    );
  })) as Blob;

  return {
    blob,
    contenidoQR: qrValidado.data,
  };
}
