import { TextInput, View } from "react-native";

export default function Input({ placeholder, secure, onChangeText }) {
  return (
    <View className="bg-gray-200 p-3 rounded-xl mb-3">
      <TextInput
        placeholder={placeholder}
        secureTextEntry={secure}
        onChangeText={onChangeText}
        className="text-black"
      />
    </View>
  );
}
