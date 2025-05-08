import { createAudioPlayer } from "expo-audio";
import { useCallback, useEffect } from "react";

type SoundKey = keyof typeof soundMap;
const soundMap: { [key: string]: any } = {
  tick: createAudioPlayer(require("@/assets/fx/tick.wav")),
  "complete-exercise": createAudioPlayer(require("@/assets/fx/complete-exercise.mp3")),
  "complete-task": createAudioPlayer(require("@/assets/fx/complete-task.mp3")),
  "complete-face-analysis": createAudioPlayer(require("@/assets/fx/complete-face-analysis.mp3")),
  "badge-awarded": createAudioPlayer(require("@/assets/fx/badge-awarded.mp3")),
};

export function useSound() {
  useEffect(() => {
    // Cleanup: Unload sounds when the hook is unmounted
    return () => {
      Object.values(soundMap).forEach((player) => {
        if (player) {
          try {
            player?.remove?.(); // Release resources
          } catch (error) {
            console.error("Error removing player:", error);
          }
        }
      });
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  const play = useCallback(
    async (key: SoundKey) => {
      const player = soundMap[key];
      if (player) {
        try {
          // To replicate replayAsync: seek to start then play
          await player.seekTo(0); // Seek to the beginning (returns a Promise)
          player.play(); // Start playing (void return type)
        } catch (error) {
          console.error(`Error playing sound ${key}:`, error);
        }
      } else {
        console.warn(`Sound player for key "${key}" not loaded or failed to load.`);
      }
    },
    [] // Dependencies: only re-create if isReady or sounds change
  );

  return { play };
}
