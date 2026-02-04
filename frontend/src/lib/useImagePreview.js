import React, { useCallback, useMemo, useState } from "react";
import { Modal, View, Image, StyleSheet, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function useImagePreview() {
  const [isVisible, setIsVisible] = useState(false);
  const [imageSource, setImageSource] = useState(null);

  const openImage = useCallback((source) => {
    if (!source) return;
    setImageSource(source);
    setIsVisible(true);
  }, []);

  const closeImage = useCallback(() => {
    setIsVisible(false);
  }, []);

  const ImagePreviewModal = useMemo(() => {
    return function ImagePreviewModalInner() {
      return (
        <Modal
          visible={isVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeImage}
        >
          <View style={styles.backdrop}>
            <Pressable style={styles.closeBtn} onPress={closeImage}>
              <MaterialIcons name="close" size={28} color="#fff" />
            </Pressable>
            {imageSource ? (
              <Image
                source={imageSource}
                style={styles.fullImage}
                resizeMode="contain"
              />
            ) : null}
          </View>
        </Modal>
      );
    };
  }, [isVisible, imageSource, closeImage]);

  return { openImage, closeImage, ImagePreviewModal };
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  closeBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 2,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 6,
  },
});
