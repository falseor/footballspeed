import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Button, ActivityIndicator } from 'react-native';
import { Camera, CameraType, CameraCapturedPicture } from 'expo-camera';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { calculateBallSpeed } from '../utils/ballDetection';

const FootballStars = [
  { 
    name: '梅西', 
    image: require('../../assets/images/messi.jpg'), 
    speed: 122.5 
  },
  { 
    name: 'C罗', 
    image: require('../../assets/images/ronaldo.jpg'), 
    speed: 121.0 
  },
  // 可以添加更多球星
];

export default function App() {
  // const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [ballSpeed, setBallSpeed] = useState<number | null>(null);
  const [matchedStar, setMatchedStar] = useState<typeof FootballStars[0] | null>(null);
  const cameraRef = useRef<Camera>(null);
  const recordingTimeout = useRef<NodeJS.Timeout>();

  // useEffect(() => {
  //   (async () => {
  //     const { status } = await Camera.requestCameraPermissionsAsync();
  //      setHasPermission(status === 'granted');
  //   })();
  // }, []);

  const startRecording = async () => {
    if (cameraRef.current) {
      setRecording(true);
      const video = await cameraRef.current.recordAsync();

      // 5秒后自动停止录制
      recordingTimeout.current = setTimeout(() => {
        stopRecording();
      }, 5000);
      return video;
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current && recording) {
      clearTimeout(recordingTimeout.current);
      setRecording(false);
      await cameraRef.current.stopRecording();
      const video = await startRecording(); // 使用 startRecording 返回的视频对象
      if (video) {
        await processVideo(video.uri);
      }
    }
  };

  const processVideo = async (videoUri: string) => {
    try {
      setProcessing(true);
      
      // 生成视频帧
      const frames = [];
      for (let i = 0; i < 5; i++) {
        const { uri } = await VideoThumbnails.getThumbnailAsync(
          videoUri,
          {
            time: i * 1000, // 每秒一帧
          }
        );
        frames.push(uri);
      }

      // 计算球速
      const speed = await calculateBallSpeed(frames);
      
      if (speed) {
        setBallSpeed(speed);
        
        // 找到最接近的球星
        const star = FootballStars.reduce((prev, curr) => {
          return Math.abs(curr.speed - speed) < Math.abs(prev.speed - speed) ? curr : prev;
        });
        
        setMatchedStar(star);
      }
    } catch (error) {
      console.error('视频处理失败:', error);
    } finally {
      setProcessing(false);
    }
  };

  // if (hasPermission === null) {
  //   return <View />;
  // }
  // if (hasPermission === false) {
  //   return <Text>没有相机访问权限</Text>;
  // }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>看看你的球速像谁？</Text>
      
      <View style={styles.starsContainer}>
        {FootballStars.map((star) => (
          <View key={star.name} style={styles.starCard}>
            <Image source={star.image} style={styles.starImage} />
            <Text>{star.name}</Text>
            <Text>{star.speed} km/h</Text>
          </View>
        ))}
      </View>

      {!recording && !processing && !ballSpeed && (
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={CameraType.back}
        />
      )}

      {processing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>正在分析你的射门...</Text>
        </View>
      )}

      {ballSpeed && matchedStar && (
        <View style={styles.resultContainer}>
          <Text style={styles.speedText}>你的球速: {ballSpeed.toFixed(1)} km/h</Text>
          <Text style={styles.matchText}>最接近 {matchedStar.name} 的球速！</Text>
          <Button 
            title="重新测试" 
            onPress={() => {
              setBallSpeed(null);
              setMatchedStar(null);
            }}
          />
        </View>
      )}

      {!processing && !ballSpeed && (
        <Button
          title={recording ? "停止录制" : "开始录制"}
          onPress={recording ? stopRecording : startRecording}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starCard: {
    alignItems: 'center',
    margin: 10,
  },
  starImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  camera: {
    width: 300,
    height: 400,
    marginVertical: 20,
  },
  processingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 400,
  },
  resultContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  speedText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  matchText: {
    fontSize: 18,
    marginBottom: 20,
  },
});