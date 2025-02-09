import Vision
import CoreML
import AVFoundation
import UIKit

class BallSpeedTracker {
    // MARK: - Properties
    private let model: VNCoreMLModel
    private let fieldWidthMeters: Float
    private var frameRate: Double = 60.0
    private var prevPosition: CGPoint?
    private var prevFrameNum: Int = 0
    private var maxSpeed: Float = 0.0
    
    // MARK: - Initialization
    init(modelPath: String, fieldWidthMeters: Float = 105.0) throws {
        self.fieldWidthMeters = fieldWidthMeters
        
        // 加载CoreML模型
        guard let modelURL = Bundle.main.url(forResource: modelPath, withExtension: "mlmodel") else {
            throw NSError(domain: "BallTracker", code: -1, 
                         userInfo: [NSLocalizedDescriptionKey: "Model not found"])
        }
        
        let compiledUrl = try MLModel.compileModel(at: modelURL)
        let model = try MLModel(contentsOf: compiledUrl)
        self.model = try VNCoreMLModel(for: model)
    }
    
    // MARK: - Ball Detection
    private func detectBall(in image: CVPixelBuffer, 
                          completion: @escaping (CGRect?) -> Void) {
        let request = VNCoreMLRequest(model: model) { request, error in
            guard let results = request.results as? [VNRecognizedObjectObservation] else {
                completion(nil)
                return
            }
            
            // 过滤足球检测结果
            let ballDetections = results.filter { observation in
                observation.labels.contains { label in
                    label.identifier == "sports ball" && label.confidence >= 0.3
                }
            }
            
            // 获取置信度最高的检测结果
            guard let bestDetection = ballDetections.max(by: { $0.confidence < $1.confidence }) else {
                completion(nil)
                return
            }
            
            completion(bestDetection.boundingBox)
        }
        
        let handler = VNImageRequestHandler(cvPixelBuffer: image)
        try? handler.perform([request])
    }
    
    // MARK: - Speed Calculation
    private func calculateSpeed(from pos1: CGPoint, 
                              to pos2: CGPoint, 
                              frameDiff: Int) -> Float {
        // 计算像素距离
        let dx = pos2.x - pos1.x
        let dy = pos2.y - pos1.y
        let distancePixels = sqrt(dx*dx + dy*dy)
        
        // 转换为实际距离（米）
        let frameWidthPixels: Float = 1280
        let metersPerPixel = fieldWidthMeters / frameWidthPixels
        let distanceMeters = Float(distancePixels) * metersPerPixel
        
        // 计算速度
        let timeSeconds = Float(frameDiff) / Float(frameRate)
        let speedMps = distanceMeters / timeSeconds
        let speedKph = speedMps * 3.6
        
        return speedKph
    }
    
    // MARK: - Video Processing
    func processVideo(url: URL, completion: @escaping (Float) -> Void) {
        let asset = AVAsset(url: url)
        guard let track = asset.tracks(withMediaType: .video).first else {
            completion(0.0)
            return
        }
        
        // 获取视频信息
        frameRate = track.nominalFrameRate
        let frameInterval: Int = 20 // 每20帧分析一次
        
        // 创建视频读取器
        let reader = try? AVAssetReader(asset: asset)
        let outputSettings: [String: Any] = [
            kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA
        ]
        
        let output = AVAssetReaderTrackOutput(track: track, 
                                            outputSettings: outputSettings)
        reader?.add(output)
        reader?.startReading()
        
        var frameCount = 0
        var maxSpeed: Float = 0.0
        
        // 处理视频帧
        while let sampleBuffer = output.copyNextSampleBuffer() {
            frameCount += 1
            
            // 每20帧进行一次分析
            guard frameCount % frameInterval == 0,
                  let imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
                continue
            }
            
            // 检测球
            detectBall(in: imageBuffer) { [weak self] boundingBox in
                guard let self = self,
                      let bbox = boundingBox else { return }
                
                // 计算中心点
                let center = CGPoint(
                    x: bbox.midX,
                    y: bbox.midY
                )
                
                // 计算速度
                if let prevPos = self.prevPosition {
                    let speed = self.calculateSpeed(
                        from: prevPos,
                        to: center,
                        frameDiff: frameCount - self.prevFrameNum
                    )
                    
                    maxSpeed = max(maxSpeed, speed)
                }
                
                self.prevPosition = center
                self.prevFrameNum = frameCount
            }
        }
        
        completion(maxSpeed)
    }
}

// MARK: - Usage Example
extension BallSpeedTracker {
    static func example() {
        do {
            let tracker = try BallSpeedTracker(modelPath: "YOLOv8")
            
            if let videoURL = Bundle.main.url(forResource: "soccer", 
                                            withExtension: "mp4") {
                tracker.processVideo(url: videoURL) { maxSpeed in
                    print("Maximum ball speed: \(maxSpeed) km/h")
                }
            }
        } catch {
            print("Error: \(error)")
        }
    }
}