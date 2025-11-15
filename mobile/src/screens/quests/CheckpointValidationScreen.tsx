import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera, Image as ImageIcon, CheckCircle, X } from 'lucide-react-native';

type CheckpointValidationScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: {
    params: {
      questId: string;
      checkpointId: string;
      onValidated?: () => void;
    };
  };
};

export default function CheckpointValidationScreen({
  navigation,
  route,
}: CheckpointValidationScreenProps) {
  const { questId, checkpointId, onValidated } = route.params;
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTakePhoto = () => {
    Alert.alert('Add Photo', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: () => {
          launchCamera(
            {
              mediaType: 'photo',
              quality: 0.8,
              saveToPhotos: true,
              cameraType: 'back',
            },
            handleImageResponse
          );
        },
      },
      {
        text: 'Choose from Library',
        onPress: () => {
          launchImageLibrary(
            {
              mediaType: 'photo',
              quality: 0.8,
            },
            handleImageResponse
          );
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
      return;
    }

    if (response.errorCode) {
      Alert.alert('Error', response.errorMessage || 'Failed to pick image');
      return;
    }

    if (response.assets && response.assets.length > 0) {
      const asset = response.assets[0];
      setPhoto(asset.uri || null);
    }
  };

  const handleSubmit = async () => {
    if (!photo) {
      Alert.alert('Photo Required', 'Please take a photo to validate this checkpoint');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement checkpoint validation API
      // const formData = new FormData();
      // formData.append('photo', {
      //   uri: photo,
      //   type: 'image/jpeg',
      //   name: `checkpoint-${checkpointId}.jpg`,
      // });
      // await questAPI.validateCheckpoint(questId, checkpointId, formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert(
        'Checkpoint Validated! ✅',
        'Your checkpoint has been successfully validated. Continue to the next one!',
        [
          {
            text: 'Continue',
            onPress: () => {
              if (onValidated) {
                onValidated();
              }
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Validation error:', error);
      Alert.alert('Validation Failed', 'Failed to validate checkpoint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Validation?',
      'Skipping will not award full points for this checkpoint. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: () => {
            if (onValidated) {
              onValidated();
            }
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <X color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Validate Checkpoint</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📸 Take a Photo</Text>
          <Text style={styles.instructionsText}>
            Take a photo at this checkpoint to validate your visit. Make sure the landmark or
            location is clearly visible in your photo.
          </Text>
        </View>

        {/* Photo Display */}
        <View style={styles.photoContainer}>
          {photo ? (
            <>
              <Image source={{ uri: photo }} style={styles.photo} />
              <TouchableOpacity style={styles.retakeButton} onPress={handleTakePhoto}>
                <Camera color="#fff" size={20} />
                <Text style={styles.retakeButtonText}>Retake Photo</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.cameraPlaceholder} onPress={handleTakePhoto}>
              <Camera color="#2563eb" size={48} />
              <Text style={styles.cameraPlaceholderText}>Tap to Take Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips for a great photo:</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Capture the entire landmark</Text>
            <Text style={styles.tipItem}>• Ensure good lighting</Text>
            <Text style={styles.tipItem}>• Hold the camera steady</Text>
            <Text style={styles.tipItem}>• Include yourself if possible</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, (!photo || isSubmitting) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!photo || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <CheckCircle color="#fff" size={20} />
                <Text style={styles.submitButtonText}>Validate Checkpoint</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={isSubmitting}
          >
            <Text style={styles.skipButtonText}>Skip for Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: '#2563eb',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: 20,
  },
  instructionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  photoContainer: {
    aspectRatio: 3 / 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    margin: 20,
    borderRadius: 12,
  },
  cameraPlaceholderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  retakeButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  tipsList: {
    gap: 4,
  },
  tipItem: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
});
