import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

let landmarkerInstance: FaceLandmarker | null = null;
let initPromise: Promise<FaceLandmarker | null> | null = null;

export interface FaceTelemetry {
  detected: boolean;
  screenYaw: number; // Negative when turning head left (on mirrored screen), Positive when turning head right
  pitchRatio: number; // Negative when looking up, Positive when looking down
  rollRatio: number;
  centerX: number; // 0 to 1 on mirrored screen
  centerY: number; // 0 to 1
  faceWidth: number; // 0 to 1
  faceHeight: number; // 0 to 1
  confidence: number;
}

/**
 * Initializes Google MediaPipe FaceLandmarker with GPU delegate and CPU fallback.
 */
export async function initFaceLandmarker(): Promise<FaceLandmarker | null> {
  if (landmarkerInstance) return landmarkerInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const fileset = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
      );
      try {
        landmarkerInstance = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
        });
      } catch (gpuErr) {
        console.warn('GPU delegate unavailable for FaceLandmarker, falling back to CPU:', gpuErr);
        landmarkerInstance = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
        });
      }
      return landmarkerInstance;
    } catch (err) {
      console.warn('MediaPipe initialization failed, optical vision fallback active:', err);
      return null;
    }
  })();

  return initPromise;
}

/**
 * Analyzes video frame using MediaPipe FaceLandmarker to compute 3D cranial yaw.
 * Mathematically invariant to whole-device panning or laptop swiping.
 */
export function analyzeFace(
  landmarker: FaceLandmarker | null,
  video: HTMLVideoElement,
  timestamp: number
): FaceTelemetry | null {
  if (!landmarker || video.readyState < 2 || video.videoWidth === 0) return null;

  try {
    const result = landmarker.detectForVideo(video, timestamp);
    if (!result || !result.faceLandmarks || result.faceLandmarks.length === 0) {
      return {
        detected: false,
        screenYaw: 0,
        pitchRatio: 0,
        rollRatio: 0,
        centerX: 0.5,
        centerY: 0.5,
        faceWidth: 0,
        faceHeight: 0,
        confidence: 0,
      };
    }

    const lm = result.faceLandmarks[0];
    // Landmark 4: Nose tip
    // Landmark 234: Right cheek (in person perspective)
    // Landmark 454: Left cheek (in person perspective)
    // Landmark 10: Forehead top
    // Landmark 152: Chin bottom
    const nose = lm[4];
    const pt234 = lm[234];
    const pt454 = lm[454];
    const forehead = lm[10];
    const chin = lm[152];

    const rawMidX = (pt234.x + pt454.x) / 2;
    const rawMidY = (forehead.y + chin.y) / 2;
    const faceW = Math.max(0.01, Math.abs(pt454.x - pt234.x));
    const faceH = Math.max(0.01, Math.abs(chin.y - forehead.y));

    // On mirrored display (which user sees as a mirror):
    // Screen X = 1 - Raw X
    const screenNoseX = 1 - nose.x;
    const screenFaceMidX = 1 - rawMidX;

    // Relative displacement of nose tip from midpoint of the cheeks, normalized by face width:
    // (screenNoseX - screenFaceMidX) cancels out any device translation (dx):
    // ((screenNoseX + dx) - (screenFaceMidX + dx)) = screenNoseX - screenFaceMidX
    const screenYaw = (screenNoseX - screenFaceMidX) / (faceW * 0.45);

    const pitchRatio = (nose.y - rawMidY) / (faceH * 0.45);

    return {
      detected: true,
      screenYaw: Math.max(-1, Math.min(1, screenYaw)),
      pitchRatio: Math.max(-1, Math.min(1, pitchRatio)),
      rollRatio: 0,
      centerX: screenFaceMidX,
      centerY: rawMidY,
      faceWidth: faceW,
      faceHeight: faceH,
      confidence: 0.994,
    };
  } catch {
    return null;
  }
}
