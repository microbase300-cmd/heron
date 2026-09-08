import * as faceapi from '@vladmandic/face-api';

export interface FaceApiAnalysisResult {
  faceDetected: boolean;
  score: number;
  isCentered: boolean;
  yawAngle: number; // In degrees (-35 to +35), Negative = Left, Positive = Right
  normalizedYaw: number; // -1 to +1
  centerX: number; // 0 to 1
  centerY: number; // 0 to 1
  faceWidth: number; // 0 to 1
  faceHeight: number; // 0 to 1
  leftEyeEar: number; // Eye Aspect Ratio
  rightEyeEar: number;
  isBlinking: boolean;
  landmarks: { x: number; y: number }[] | null;
  handWaveDetected: boolean;
  handStrokeCount: number;
}

class FaceApiService {
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;
  private detectorOptions: faceapi.TinyFaceDetectorOptions | null = null;

  // Hand wave tracking state
  private waveState = {
    lastHandX: null as number | null,
    lastDirection: null as 'left' | 'right' | null,
    strokeCount: 0,
    lastStrokeTime: 0,
  };
  private prevFrameLuma: Uint8Array | null = null;
  private motionCanvas: HTMLCanvasElement | null = null;
  private motionCtx: CanvasRenderingContext2D | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      this.motionCanvas = document.createElement('canvas');
      this.motionCanvas.width = 160;
      this.motionCanvas.height = 120;
      this.motionCtx = this.motionCanvas.getContext('2d', { willReadFrequently: true });
    }
  }

  public async loadModels(modelPath = '/models'): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      try {
        // Load lightweight tiny face detector and 68 landmark model
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelPath),
        ]);

        this.detectorOptions = new faceapi.TinyFaceDetectorOptions({
          inputSize: 224,
          scoreThreshold: 0.35,
        });

        this.isLoaded = true;
      } catch (err) {
        console.error('Failed to load Face-API models:', err);
        throw err;
      } finally {
        this.loadPromise = null;
      }
    })();

    return this.loadPromise;
  }

  public isReady(): boolean {
    return this.isLoaded;
  }

  public resetWave() {
    this.waveState = {
      lastHandX: null,
      lastDirection: null,
      strokeCount: 0,
      lastStrokeTime: 0,
    };
  }

  public async detect(
    video: HTMLVideoElement,
    mode: 'center' | 'turn_left' | 'turn_right' | 'wave_hand' | 'any' = 'any'
  ): Promise<FaceApiAnalysisResult> {
    const defaultResult: FaceApiAnalysisResult = {
      faceDetected: false,
      score: 0,
      isCentered: false,
      yawAngle: 0,
      normalizedYaw: 0,
      centerX: 0.5,
      centerY: 0.5,
      faceWidth: 0,
      faceHeight: 0,
      leftEyeEar: 0.3,
      rightEyeEar: 0.3,
      isBlinking: false,
      landmarks: null,
      handWaveDetected: this.waveState.strokeCount >= 2,
      handStrokeCount: this.waveState.strokeCount,
    };

    if (!this.isLoaded || !this.detectorOptions || video.readyState < 2 || video.videoWidth === 0) {
      return defaultResult;
    }

    try {
      // 1. Run Neural Face & 68 Landmark Detection
      const detection = await faceapi
        .detectSingleFace(video, this.detectorOptions)
        .withFaceLandmarks(true);

      const vW = video.videoWidth || 640;
      const vH = video.videoHeight || 480;

      let faceDetected = false;
      let score = 0;
      let isCentered = false;
      let yawAngle = 0;
      let normalizedYaw = 0;
      let centerX = 0.5;
      let centerY = 0.5;
      let faceWidth = 0;
      let faceHeight = 0;
      let leftEyeEar = 0.3;
      let rightEyeEar = 0.3;
      let isBlinking = false;
      let landmarksArray: { x: number; y: number }[] | null = null;

      if (detection && detection.detection.score > 0.35) {
        faceDetected = true;
        score = detection.detection.score;

        const box = detection.detection.box;
        centerX = (box.x + box.width / 2) / vW;
        centerY = (box.y + box.height / 2) / vH;
        faceWidth = box.width / vW;
        faceHeight = box.height / vH;

        // Centering check inside target oval
        const distFromCenter = Math.hypot(centerX - 0.5, (centerY - 0.5) * 1.2);
        isCentered = distFromCenter < 0.16 && faceWidth >= 0.18 && faceWidth <= 0.65;

        // Extract 68 landmark points
        const pts = detection.landmarks.positions;
        landmarksArray = pts.map((p) => ({ x: p.x / vW, y: p.y / vH }));

        // Landmark indices:
        // 30: Nose Tip
        // 36: Left Eye Outer Corner
        // 39: Left Eye Inner Corner
        // 42: Right Eye Inner Corner
        // 45: Right Eye Outer Corner
        const noseTip = pts[30] || pts[33];
        const leftEyeOuter = pts[36];
        const rightEyeOuter = pts[45];

        if (noseTip && leftEyeOuter && rightEyeOuter) {
          const eyeMidpointX = (leftEyeOuter.x + rightEyeOuter.x) / 2;
          const eyeSpan = Math.max(10, Math.hypot(rightEyeOuter.x - leftEyeOuter.x, rightEyeOuter.y - leftEyeOuter.y));

          // Compute cranial yaw displacement (-1 to +1)
          // In mirrored video, user turning head to their left causes nose to move towards left in image
          const rawYaw = (noseTip.x - eyeMidpointX) / (eyeSpan * 0.42);
          normalizedYaw = Math.max(-1, Math.min(1, rawYaw));
          yawAngle = Math.round(normalizedYaw * 32);
        }

        // Eye Aspect Ratio (EAR) for blink detection
        if (pts[36] && pts[37] && pts[38] && pts[39] && pts[40] && pts[41]) {
          const leftH1 = Math.hypot(pts[37].x - pts[41].x, pts[37].y - pts[41].y);
          const leftH2 = Math.hypot(pts[38].x - pts[40].x, pts[38].y - pts[40].y);
          const leftW = Math.hypot(pts[36].x - pts[39].x, pts[36].y - pts[39].y);
          leftEyeEar = (leftH1 + leftH2) / (2 * Math.max(1, leftW));
        }

        if (pts[42] && pts[43] && pts[44] && pts[45] && pts[46] && pts[47]) {
          const rightH1 = Math.hypot(pts[43].x - pts[47].x, pts[43].y - pts[47].y);
          const rightH2 = Math.hypot(pts[44].x - pts[46].x, pts[44].y - pts[46].y);
          const rightW = Math.hypot(pts[42].x - pts[45].x, pts[42].y - pts[45].y);
          rightEyeEar = (rightH1 + rightH2) / (2 * Math.max(1, rightW));
        }

        isBlinking = leftEyeEar < 0.18 && rightEyeEar < 0.18;
      }

      // 2. Hand Wave Motion Tracking
      let handWaveDetected = this.waveState.strokeCount >= 2;
      if ((mode === 'wave_hand' || mode === 'any') && this.motionCtx && this.motionCanvas) {
        const mW = this.motionCanvas.width;
        const mH = this.motionCanvas.height;

        this.motionCtx.drawImage(video, 0, 0, mW, mH);
        const imgData = this.motionCtx.getImageData(0, 0, mW, mH);
        const data = imgData.data;
        const total = mW * mH;
        const curLuma = new Uint8Array(total);

        for (let i = 0; i < total; i++) {
          const idx = i * 4;
          curLuma[i] = (data[idx] * 299 + data[idx + 1] * 587 + data[idx + 2] * 114) / 1000;
        }

        if (this.prevFrameLuma) {
          let motionPixels = 0;
          let sumMotionX = 0;

          for (let y = 15; y < mH - 15; y++) {
            for (let x = 10; x < mW - 10; x++) {
              const idx = y * mW + x;
              const diff = Math.abs(curLuma[idx] - this.prevFrameLuma[idx]);
              if (diff > 16) {
                const nx = x / mW;
                const ny = y / mH;
                const distFromFace = Math.hypot(nx - centerX, ny - centerY);
                if (distFromFace > 0.14) {
                  motionPixels++;
                  sumMotionX += nx;
                }
              }
            }
          }

          const now = Date.now();
          if (motionPixels > 35) {
            const currentHandX = sumMotionX / motionPixels;
            if (this.waveState.lastHandX !== null) {
              const deltaX = currentHandX - this.waveState.lastHandX;
              if (Math.abs(deltaX) > 0.02) {
                const curDir: 'left' | 'right' = deltaX > 0 ? 'right' : 'left';
                if (
                  this.waveState.lastDirection &&
                  curDir !== this.waveState.lastDirection &&
                  now - this.waveState.lastStrokeTime > 160
                ) {
                  this.waveState.strokeCount = Math.min(2, this.waveState.strokeCount + 1);
                  this.waveState.lastStrokeTime = now;
                }
                this.waveState.lastDirection = curDir;
              }
            }
            this.waveState.lastHandX = currentHandX;
          }
        }

        this.prevFrameLuma = curLuma;
        handWaveDetected = this.waveState.strokeCount >= 2;
      }

      return {
        faceDetected,
        score,
        isCentered,
        yawAngle,
        normalizedYaw,
        centerX,
        centerY,
        faceWidth,
        faceHeight,
        leftEyeEar,
        rightEyeEar,
        isBlinking,
        landmarks: landmarksArray,
        handWaveDetected,
        handStrokeCount: this.waveState.strokeCount,
      };
    } catch (detectErr) {
      console.warn('Face-API detection frame error:', detectErr);
      return defaultResult;
    }
  }
}

export const faceApiService = new FaceApiService();
