import type { Sticker } from '@/services/Sticker';

export interface AddStickerModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: (sticker: Sticker) => void;
}
