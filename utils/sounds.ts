import { AudioPlayer, createAudioPlayer } from "expo-audio"; // Changed from expo-av
import { useCallback, useEffect, useState } from "react";

type SoundKey = keyof typeof soundMap;
const soundMap: { [key: string]: any } = {
  tick: require("@/assets/fx/tick.wav"),
  "complete-exercise": require("@/assets/fx/complete-exercise.mp3"),
  "complete-task": require("@/assets/fx/complete-task.mp3"),
  "complete-face-analysis": require("@/assets/fx/complete-face-analysis.mp3"),
  "badge-awarded": require("@/assets/fx/badge-awarded.mp3"),
};
// Define an initial state for the soundsRef for type correctness
const initialSoundsState: Record<SoundKey, AudioPlayer | null> = {
  tick: null,
  "complete-exercise": null,
  "complete-task": null,
  "complete-face-analysis": null,
  "badge-awarded": null,
};

export function useSound() {
  const [sounds, setSounds] = useState<Record<SoundKey, AudioPlayer | null>>(initialSoundsState);
  useEffect(() => {
    const loadedPlayers: Record<SoundKey, AudioPlayer | null> = { ...initialSoundsState };
    // Load sounds: Create AudioPlayer instances
    for (const key in soundMap) {
      const asset = soundMap[key as SoundKey];
      try {
        loadedPlayers[key as SoundKey] = createAudioPlayer(asset);
      } catch (error) {
        console.error(`Error loading sound ${key}:`, error);
        loadedPlayers[key as SoundKey] = null; // Ensure it's null if loading failed
      }
    }
    setSounds(loadedPlayers); // Update state with loaded players

    // Cleanup: Unload sounds when the hook is unmounted
    return () => {
      Object.values(sounds).forEach((player) => {
        if (player) {
          try {
            player.remove(); // Release resources
          } catch (error) {
            console.error("Error removing player:", error);
          }
        }
      });
      // Optionally reset the ref to initial state if desired for specific remounting scenarios
      // soundsRef.current = { ...initialSoundsState };
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  const play = useCallback(
    async (key: SoundKey) => {
      const player = sounds[key];
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
    [sounds]
  );

  return { play };
}
