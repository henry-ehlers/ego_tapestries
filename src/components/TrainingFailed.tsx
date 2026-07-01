import { Text } from '@mantine/core';
import { useEffect } from 'react';
import { useStorageEngine } from '../storage/storageEngineHooks';

export function TrainingFailed() {
  const { storageEngine } = useStorageEngine();

  useEffect(() => {
    if (storageEngine) {
      storageEngine.rejectCurrentParticipant('Failed training')
        .catch(() => {
          console.error('Failed to reject participant who failed training');
        });
    }
  }, [storageEngine]);

  return (
    <Text>
      Thank you for participating. Unfortunately you didn&apos;t answer the training correctly, which means you are not eligible to participate in the study. Please return to Prolific and state that you could not complete the study.
    </Text>
  );
}
