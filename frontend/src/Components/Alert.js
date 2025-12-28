import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Modal,
} from "react-native";

export default function Alert({ visible, message, onClose }) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.alertBox,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.alertText}>{message}</Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  alertBox: {
    width: "85%",
    backgroundColor: "#fff",
    paddingVertical: 26,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  alertText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 12,
  },

  buttonText: {
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
});

// import Alert from "../../Components/Alert";

// const [alertVisible, setAlertVisible] = useState(false);
// const [alertMessage, setAlertMessage] = useState("");

/* <Alert
  visible={alertVisible}
  message={alertMessage}
  onClose={() => setAlertVisible(false)}
/>*/

// setAlertMessage("Something went wrong");
// setAlertVisible(true);
