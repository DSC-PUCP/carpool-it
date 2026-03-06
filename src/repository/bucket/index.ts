import getSupabaseClient from '@/lib/supabase';
import { Result } from '@/lib/utils';

const PAYMENT_BUCKET = 'payment';
const QR_FOLDER = 'qr';
const METAMASK_FILE = 'metamask-wallet.txt';

const isNotFoundStorageError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;

  const storageError = error as {
    statusCode?: string;
    error?: string;
    message?: string;
  };

  if (storageError.statusCode === '404') return true;
  if (storageError.error === 'not_found') return true;

  return storageError.message?.toLowerCase().includes('not found') ?? false;
};

export const bucketRepository = {
  uploadPaymentQr: async (params: { userId: string; file: File }) => {
    const supabase = getSupabaseClient();
    const extension = params.file.name.split('.').pop() || 'png';
    const filePath = `${QR_FOLDER}/${params.userId}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(PAYMENT_BUCKET)
      .upload(filePath, params.file, {
        upsert: true,
      });

    if (uploadError) return Result.error(uploadError);

    const { data } = supabase.storage
      .from(PAYMENT_BUCKET)
      .getPublicUrl(filePath);

    if (!data.publicUrl) {
      return Result.error(
        new Error('No se pudo obtener la URL pública del QR')
      );
    }

    return Result.success(data.publicUrl);
  },

  uploadMetamaskWallet: async (params: {
    userId: string;
    walletAddress: string;
  }) => {
    const supabase = getSupabaseClient();
    const filePath = `${params.userId}/${METAMASK_FILE}`;

    const { error } = await supabase.storage
      .from(PAYMENT_BUCKET)
      .upload(
        filePath,
        new Blob([params.walletAddress], { type: 'text/plain' }),
        {
          upsert: true,
        }
      );

    if (error) return Result.error(error);
    return Result.success();
  },

  getMetamaskWallet: async (userId: string) => {
    const supabase = getSupabaseClient();
    const filePath = `${userId}/${METAMASK_FILE}`;

    const { data, error } = await supabase.storage
      .from(PAYMENT_BUCKET)
      .download(filePath);

    if (error) {
      if (isNotFoundStorageError(error)) return Result.success(null);
      return Result.error(error);
    }

    if (!data) return Result.success(null);

    const walletAddress = (await data.text()).trim();
    return Result.success(walletAddress || null);
  },
};
