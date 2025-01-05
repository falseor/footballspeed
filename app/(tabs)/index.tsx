import { useRouter } from 'expo-router';
import { NativeModules } from 'react-native';
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

const getHelloMessage = async () => {
  return await NativeModules.MyCustomModule.getHelloMessage();
};

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>看看你的球速像谁？ 
       {getHelloMessage()}
        </Text>

      <View style={styles.starsContainer}>
        {FootballStars.map((star) => (
          <View key={star.name} style={styles.starCard}>
            <Image source={star.image} style={styles.starImage} />
            <Text>{star.name}</Text>
            <Text>{star.speed} km/h</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/camera')}>
        <Text style={styles.buttonText}>开始录制</Text>
      </TouchableOpacity>
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
  buttonText:{
    color: '#fff',
    fontSize: 18,
    fontWeight:'bold',
  },
  button:{
    marginTop:60,
    backgroundColor:'#1e90ff',
    padding:10,
    borderRadius:10,
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