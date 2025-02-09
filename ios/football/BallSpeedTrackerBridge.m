#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(BallSpeedTrackerModule, NSObject)

RCT_EXTERN_METHOD(processVideo:(NSString *)videoPath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end 