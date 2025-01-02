import React from 'react';
import { StyleSheet, Text, View, Image, Button } from 'react-native';
import { Camera } from 'expo-camera';

const FootballStars = [
  { name: '梅西', image: require('../../assets/images/messi.jpg'), speed: 122.5 }, // 单位：km/h，需要替换成实际图片路径
  { name: 'C罗', image: require('../../assets/images/ronaldo.jpg'), speed: 121 },
  // ... 其他球星
];
const [hasPermission, setHasPermission] = React.useState<boolean | null>(null);
const [recording, setRecording] = React.useState(false);
const cameraRef = React.useRef<Camera>(null);


React.useEffect(() => {
  (async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  })();
}, []);

const startRecording = async () => {
  if (cameraRef.current) {
    setRecording(true);
    const video = await cameraRef.current.recordAsync();
    console.log('视频保存在:', video.uri);
  }
};

const stopRecording = () => {
  if (cameraRef.current && recording) {
    cameraRef.current.stopRecording();
    setRecording(false);
  }
};


export default function App() {
  return (
    <View style={styles.container}>
      <Text>看看你的球速像谁？</Text>
      <View style={styles.starsContainer}>
        {FootballStars.map((star) => (
          <Image key={star.name} source={star.image} style={styles.starImage} />
        ))}
      </View>
      <Button  
         title={recording ? "停止录制" : "开始录制"} 
        onPress={recording ? stopRecording : startRecording} 
     />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starsContainer: {
    flexDirection: 'row', // 横向排列
    flexWrap: 'wrap', // 必要时换行
    justifyContent: 'center',
  },
  starImage: {
    width: 100,
    height: 100,
    margin: 5,
  },
  camera: {
    width: 300,
    height: 400,
    marginVertical: 10,
  }
});
