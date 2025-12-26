import { useShare } from '@/contexts/ShareContext';

export const useVocabularyShare = () => {
    const { shareAsImage, sharingId, itemToShare, shareRef } = useShare();

    return {
        shareAsImage,
        isItemSharing: (id: string) => sharingId === id,
        itemToShare,
        shareRef,
        isSharingGlobal: !!sharingId
    };
};
