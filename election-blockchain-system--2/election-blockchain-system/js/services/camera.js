// Election Commission of Pakistan - Camera Service with Face Detection

export class CameraService {
    constructor() {
        this.videoStream = null;
        this.faceDetected = false;
        this.faceDetectionInterval = null;
    }

    async startCamera() {
    if (this.videoStream) {
        return { success: true, stream: this.videoStream, message: 'Camera already active' };
    }

    // First check if mediaDevices is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return { 
            success: false, 
            error: 'Your browser does not support camera access. Please use Chrome, Firefox, or Edge.' 
        };
    }

    try {
        // Try to get camera permission with specific constraints
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 640, max: 1280 },
                height: { ideal: 480, max: 720 }
            },
            audio: false
        });
        
        this.videoStream = stream;
        return { 
            success: true, 
            stream: stream, 
            message: 'Camera started successfully' 
        };
    } catch (error) {
        console.error('Camera error:', error.name, error.message);
        
        let errorMessage = '';
        
        switch(error.name) {
            case 'NotAllowedError':
            case 'PermissionDeniedError':
                errorMessage = 'Camera access was denied. Please click "Retry Camera Access" and allow camera permission in the browser popup.';
                break;
            case 'NotFoundError':
            case 'DevicesNotFoundError':
                errorMessage = 'No camera found on your device. Please connect a webcam.';
                break;
            case 'NotReadableError':
            case 'TrackStartError':
                errorMessage = 'Your camera is being used by another application. Please close other apps using the camera.';
                break;
            case 'OverconstrainedError':
                errorMessage = 'Camera does not meet requirements. Trying with basic settings. Try clicking "Retry Camera Access".';
                break;
            default:
                errorMessage = 'Could not access camera. Please check your camera connection and permissions.';
        }
        
        return { 
            success: false, 
            error: errorMessage,
            errorType: error.name
        };
    }
}
 

    capturePhoto(videoElement, canvasElement) {
        if (!videoElement || !canvasElement) {
            return null;
        }

        const context = canvasElement.getContext('2d');
        canvasElement.width = 400;
        canvasElement.height = 300;
        
        // Flip horizontally for mirror effect
        context.translate(canvasElement.width, 0);
        context.scale(-1, 1);
        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        
        // Reset transform
        context.setTransform(1, 0, 0, 1, 0, 0);
        
        const photoData = canvasElement.toDataURL('image/png');
        
        // Simulate face detection analysis
        const faceAnalysis = this.analyzeFace(canvasElement);
        
        return {
            photoData: photoData,
            faceAnalysis: faceAnalysis
        };
    }

    analyzeFace(canvasElement) {
        const context = canvasElement.getContext('2d');
        const imageData = context.getImageData(0, 0, canvasElement.width, canvasElement.height);
        
        // Simulate face detection metrics
        const brightness = this.calculateBrightness(imageData);
        const hasFace = this.detectFacePresence(imageData);
        const quality = this.assessImageQuality(brightness, hasFace);
        
        return {
            faceDetected: hasFace,
            confidence: hasFace ? (70 + Math.random() * 25).toFixed(1) : (10 + Math.random() * 20).toFixed(1),
            brightness: brightness.toFixed(1),
            quality: quality,
            qualityLabel: this.getQualityLabel(quality),
            timestamp: new Date().toISOString(),
            faceCount: hasFace ? 1 : 0,
            livenessScore: hasFace ? (80 + Math.random() * 20).toFixed(1) : '0.0'
        };
    }

    calculateBrightness(imageData) {
        let totalBrightness = 0;
        const data = imageData.data;
        const pixelCount = data.length / 4;
        
        // Sample every 10th pixel for performance
        for (let i = 0; i < data.length; i += 40) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            totalBrightness += (r + g + b) / 3;
        }
        
        return totalBrightness / (pixelCount / 10);
    }

    detectFacePresence(imageData) {
        // Simulated face detection
        // In production, this would use a real face detection API
        const brightness = this.calculateBrightness(imageData);
        
        // Basic heuristic: if image is too dark or too bright, probably no clear face
        if (brightness < 30 || brightness > 240) {
            return Math.random() > 0.5; // Random for edge cases
        }
        
        // Simulate 90% face detection success rate
        return Math.random() > 0.1;
    }

    assessImageQuality(brightness, hasFace) {
        let score = 0;
        
        // Brightness score (ideal: 80-180)
        if (brightness >= 60 && brightness <= 200) score += 40;
        else if (brightness >= 40 && brightness <= 220) score += 25;
        else score += 10;
        
        // Face presence score
        if (hasFace) score += 40;
        else score += 5;
        
        // Random quality factor (simulating focus, angle, etc.)
        score += Math.random() * 20;
        
        return Math.min(score, 100).toFixed(1);
    }

    getQualityLabel(score) {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Poor';
    }

    startFaceDetection(videoElement, onFaceDetected, onFaceLost) {
        if (!videoElement) return;
        
        this.faceDetectionInterval = setInterval(() => {
            // Simulate face detection in video stream
            const facePresent = Math.random() > 0.15; // 85% detection rate
            
            if (facePresent && !this.faceDetected) {
                this.faceDetected = true;
                if (onFaceDetected) onFaceDetected();
            } else if (!facePresent && this.faceDetected) {
                this.faceDetected = false;
                if (onFaceLost) onFaceLost();
            }
        }, 1000);
    }

    stopFaceDetection() {
        if (this.faceDetectionInterval) {
            clearInterval(this.faceDetectionInterval);
            this.faceDetectionInterval = null;
        }
        this.faceDetected = false;
    }

    stopCamera() {
        this.stopFaceDetection();
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => {
                track.stop();
            });
            this.videoStream = null;
        }
    }

    isCameraActive() {
        return this.videoStream !== null && this.videoStream.active;
    }

    displayVideo(videoElement) {
        if (videoElement && this.videoStream) {
            videoElement.srcObject = this.videoStream;
            return true;
        }
        return false;
    }

    resetCamera() {
        this.stopCamera();
        this.videoStream = null;
    }

    // Generate biometric hash (simulated)
    generateBiometricHash(photoData) {
        // Simulate biometric feature extraction
        const features = {
            faceShape: ['oval', 'round', 'square', 'heart'][Math.floor(Math.random() * 4)],
            eyeDistance: (5.5 + Math.random() * 2).toFixed(1),
            noseLength: (4.0 + Math.random() * 1.5).toFixed(1),
            lipWidth: (4.5 + Math.random() * 1).toFixed(1),
            skinTone: ['fair', 'medium', 'wheatish', 'dark'][Math.floor(Math.random() * 4)]
        };
        
        // Generate hash from features
        const hashInput = JSON.stringify(features) + Date.now();
        let hash = '';
        for (let i = 0; i < hashInput.length; i++) {
            hash += hashInput.charCodeAt(i).toString(16);
        }
        
        return {
            biometricHash: hash.substring(0, 64),
            features: features,
            algorithm: 'FacialFeatureExtraction-v1.0'
        };
    }
}