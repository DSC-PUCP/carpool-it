import getSupabaseClient from '@/lib/supabase';
import { Result } from '@/lib/utils';

const PAYMENT_BUCKET = 'payment';
export const CHAT_BUCKET = 'chat';
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
  uploadChatImage: async (params: { roomId: string; file: File }) => {
    const supabase = getSupabaseClient();
    const filePath = `${params.roomId}/${crypto.randomUUID()}.webp`;

    const { error } = await supabase.storage
      .from(CHAT_BUCKET)
      .upload(filePath, params.file, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: false,
      });

    if (error) return Result.error(error);

    const { data } = supabase.storage.from(CHAT_BUCKET).getPublicUrl(filePath);

    if (!data.publicUrl) {
      return Result.error(new Error('No se pudo obtener la URL de la imagen'));
    }

    return Result.success(data.publicUrl);
  },

  deleteChatRoomFiles: async (roomId: string) => {
    const supabase = getSupabaseClient();
    const { data, error: listError } = await supabase.storage
      .from(CHAT_BUCKET)
      .list(roomId, { limit: 1000 });

    if (listError) return Result.error(listError);
    if (!data?.length) return Result.success();

    const { error: removeError } = await supabase.storage
      .from(CHAT_BUCKET)
      .remove(data.map((file) => `${roomId}/${file.name}`));

    if (removeError) return Result.error(removeError);
    return Result.success();
  },

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
