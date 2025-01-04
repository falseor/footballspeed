import * as tf from '@tensorflow/tfjs';
// import '@tensorflow/tfjs-react-native';
// import * as cocossd from '@tensorflow-models/coco-ssd';
import { manipulateAsync } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

// 计算两点之间的距离（像素）
const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

// 将像素距离转换为实际距离（米）
// 这里需要根据实际情况校准转换比例
const pixelsToMeters = (pixels: number) => {
  return pixels * 0.01; // 这个转换比例需要根据实际情况调整
};

// 检测球的位置
export const detectBall = async (imageUri: string) => {
  try {
    // 加载模型
    // const model = await cocossd.load();
    
    // 处理图像
    const response = await fetch(imageUri);
    const imageBlob = await response.blob();
    // const imageTensor = await tf.browser.fromPixels(imageBlob);
    
    // 进行检测
    // const predictions = await model.detect(imageTensor);
    
    // 查找球的预测结果
    // const ball = predictions.find(pred => pred.class === 'sports ball');
    
    // return ball ? {
    //   x: ball.bbox[0] + ball.bbox[2]/2, // 中心点x坐标
    //   y: ball.bbox[1] + ball.bbox[3]/2  // 中心点y坐标
    // } : null;
  } catch (error) {
    console.error('球检测失败:', error);
    return null;
  }
};

// 计算球速
export const calculateBallSpeed = async (frames: string[]): Promise<number> => {
  // 这里是球速计算的实现
  // 目前返回一个模拟的球速数据
  return Promise.resolve(Math.random() * 30 + 100); // 返回100-130之间的随机速度
}; 