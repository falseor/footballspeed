import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { calculateBallSpeed } from '../utils/ballDetection';

const FootballStars = [
  {
    name: '梅西',
    image: require('../../assets/images/messi.jpg'),
    speed: 122.5,
  },
  {
    name: 'C罗',
    image: require('../../assets/images/ronaldo.jpg'),
    speed: 121.0,
  },
  // 可以添加更多球星
];

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [ballSpeed, setBallSpeed] = useState<number | null>(null);
  const [matchedStar, setMatchedStar] = useState<
    (typeof FootballStars)[0] | null
  >(null);
  const cameraRef = useRef(null);
  const recordingTimeout = useRef<NodeJS.Timeout>();

  const startRecording = async () => {
    if (cameraRef.current) {
      setRecording(true);
      const video = await cameraRef.current.recordAsync();
      console.log('视频录制完成:', video.uri);
    //   Alert.alert('视频录制完成', video.uri);
      processVideo(video.uri);
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
    }
  };

  const processVideo = async (videoUri: string) => {
    console.log('videoUri', videoUri);
    try {
      setProcessing(true);

      // 生成视频帧
      const frames : string[] = [];
      for (let i = 0; i < 5; i++) {
        const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
          time: i * 100, // 每秒一帧
        });
        frames.push(uri);
      }

      // 计算球速
      const speed = await calculateBallSpeed(frames);

      if (speed) {
        setBallSpeed(speed);

        // 找到最接近的球星
        const star = FootballStars.reduce((prev, curr) => {
          return Math.abs(curr.speed - speed) < Math.abs(prev.speed - speed)
            ? curr
            : prev;
        });

        setMatchedStar(star);
      }
    } catch (error) {
      console.error('视频处理失败:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>我们需要您的许可才能使用相机</Text>
        <Button onPress={requestPermission} title="授予权限" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {!processing && !ballSpeed && (
        <CameraView
          mode="video"
          ref={cameraRef}
          style={styles.camera}
          facing="back"
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
          <Text style={styles.speedText}>
            你的球速: {ballSpeed.toFixed(1)} km/h
          </Text>
          <Text style={styles.matchText}>
            最接近 {matchedStar.name} 的球速！
          </Text>
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
          title={recording ? '停止录制' : '开始录制'}
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
  bubuttonText:{
    color: '#fff',
    fontSize: 18,
    fontWeight:'bold',
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
    flex: 1,
    width: '100%',
    height: '100%',
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