import Foundation
import ExpoModulesCore

@objc(MyCustomModule)
public class MyCustomModule: Module {
    // 模块名称，在JavaScript中会通过这个名称来调用模块
    public func getName() -> String {
        return "MyCustomModule2"
    }
    
    // 定义一个方法供JavaScript调用，这里简单返回一个固定的字符串
    @objc func getHelloMessage() -> String {
        return "Hello from Swift native code!"
    }
    
    // 导出模块的方法，指定可供JavaScript调用的方法列表
    public func getConstants() -> [AnyHashable : Any]! {
        return [:]
    }
    
    // 定义模块的导出方法，这里添加我们刚才定义的 `getHelloMessage` 方法
    public func definition() -> ModuleInterface {
        return ModuleInterface {
            (module) in
            module.name = "MyCustomModule"
            module.method("getHelloMessage", getHelloMessage)
        }
    }
}