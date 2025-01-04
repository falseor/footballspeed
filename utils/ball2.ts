// import * as tf from '@tensorflow/tfjs';
// import '@tensorflow/tfjs-react-native';
// import * as cocossd from '@tensorflow-models/coco-ssd';
// import { decode } from 'base64-js';

// // 初始化 TensorFlow 模型
// let model: cocossd.ObjectDetection | null = null;

// const initModel = async () => {
//   if (!model) {
//     console.log('正在加载模型...');
//     model = await cocossd.load();
//     console.log('模型加载完成');
//   }
//   return model;
// };

// // 检测球的位置
// const detectBall = async (imageUri: string) => {
//   try {
//     if (!model) {
//       await initModel();
//     }

//     // 加载图像
//     const response = await fetch(imageUri);
//     const imageData = await response.blob();
//     const imageTensor = await tf.browser.fromPixels(await createImageBitmap(imageData));

//     // 进行对象检测
//     const predictions = await model!.detect(imageTensor);

//     // 释放张量
//     imageTensor.dispose();

//     // 查找球的预测结果
//     const ball = predictions.find(pred => 
//       pred.class === 'sports ball' && pred.score > 0.5
//     );

//     if (ball) {
//       return {
//         x: ball.bbox[0] + ball.bbox[2]/2, // 中心点x坐标
//         y: ball.bbox[1] + ball.bbox[3]/2, // 中心点y坐标
//         confidence: ball.score
//       };
//     }
//     return null;

//   } catch (error) {
//     console.error('球检测失败:', error);
//     return null;
//   }
// };

// // 计算两点之间的距离（像素）
// const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
//   return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
// };

// // 将像素距离转换为实际距离（米）
// const pixelsToMeters = (pixels: number, frameWidth: number) => {
//   // 假设球场宽度为 7.32 米（标准足球球门宽度）
//   const conversionFactor = 7.32 / frameWidth;
//   return pixels * conversionFactor;
// };

// // 计算球速
// export const calculateBallSpeed = async (frames: string[]): Promise<number | null> => {
//   try {
//     console.log('开始处理视频帧...');
//     const ballPositions = [];
    
//     // 检测每一帧中的球
//     for (const frame of frames) {
//       const ballPosition = await detectBall(frame);
//       if (ballPosition) {
//         ballPositions.push(ballPosition);
//       }
//     }

//     console.log(`检测到球的帧数: ${ballPositions.length}`);

//     if (ballPositions.length < 2) {
//       console.log('没有检测到足够的球的位置');
//       return null;
//     }

//     // 计算相邻帧之间的速度
//     let speeds = [];
//     for (let i = 1; i < ballPositions.length; i++) {
//       const distance = calculateDistance(
//         ballPositions[i-1].x,
//         ballPositions[i-1].y,
//         ballPositions[i].x,
//         ballPositions[i].y
//       );

//       // 假设帧率为 30fps，即每帧间隔 1/30 秒
//       const timeInterval = 1/30; // 秒
//       const distanceInMeters = pixelsToMeters(distance, 1280); // 假设视频宽度为1280像素
//       const speedMPS = distanceInMeters / timeInterval;
//       const speedKMH = speedMPS * 3.6; // 转换为千米/小时

//       speeds.push(speedKMH);
//     }

//     // 计算平均速度
//     const averageSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
//     console.log(`计算得到的球速: ${averageSpeed.toFixed(2)} km/h`);

//     return averageSpeed;

//   } catch (error) {
//     console.error('球速计算失败:', error);
//     return null;
//   }
// }; 