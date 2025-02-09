import Foundation

@objc(BallSpeedTrackerModule)
class BallSpeedTrackerModule: NSObject {
  
  @objc
  func processVideo(_ videoPath: String,
                   resolver: @escaping RCTPromiseResolveBlock,
                   rejecter: @escaping RCTPromiseRejectBlock) {
    
    do {
      let tracker = try BallSpeedTracker(modelPath: "YOLOv8")
      let videoURL = URL(fileURLWithPath: videoPath)
      
      tracker.processVideo(url: videoURL) { maxSpeed in
        resolver(["speed": maxSpeed])
      }
    } catch {
      rejecter("ERROR", error.localizedDescription, error)
    }
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
} 