import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Star, X } from 'lucide-react-native';
import { API_URL } from '../constants/utils/constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  course: {
    courseCode: string;
    courseName: string;
    instructor?: string;
  };
}

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <View style={styles.starContainer}>
      <Text style={styles.starLabel}>{label}</Text>
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onChange(star)}
            style={styles.starBtn}
          >
            <Star
              size={32}
              fill={value >= star ? "#f4c542" : "none"}
              color={value >= star ? "#f4c542" : "#ccc"}
              strokeWidth={1.5}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function ReviewModal({ visible, onClose, course }: ReviewModalProps) {
  const [courseRating, setCourseRating] = useState(0);
  const [instructorRating, setInstructorRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (courseRating === 0 || instructorRating === 0) {
      Alert.alert("Missing Ratings", "Please provide both course and instructor ratings.");
      return;
    }

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          courseCode: course.courseCode,
          courseName: course.courseName,
          instructorName: course.instructor || "",
          courseRating,
          instructorRating,
          comment: comment.trim(),
        }),
      });

      if (res.ok) {
        Alert.alert("Success", "Thank you! Your review has been submitted.");
        onClose();
        
        setCourseRating(0);
        setInstructorRating(0);
        setComment("");
      } else {
        const data = await res.json();
        Alert.alert("Error", data.message || "Failed to submit review.");
      }
    } catch (e) {
      Alert.alert("Connection Error", "Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Rate This Course</Text>
              <Text style={styles.headerSubtitle}>{course.courseName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color="#aaa" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 20 }}>
            <StarRating 
              label="Course Quality" 
              value={courseRating} 
              onChange={setCourseRating} 
            />
            
            <StarRating 
              label={`Instructor${course.instructor ? ` (${course.instructor})` : ""}`} 
              value={instructorRating} 
              onChange={setInstructorRating} 
            />

            <View style={styles.commentSection}>
              <Text style={styles.commentLabel}>Comment (optional)</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                value={comment}
                onChangeText={setComment}
                placeholder="Share your experience with this course..."
                maxLength={500}
              />
              <Text style={styles.charCount}>{comment.length}/500</Text>
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, submitting && styles.disabledBtn]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8faf8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: 20,
  },
  starContainer: {
    marginBottom: 20,
  },
  starLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 10,
  },
  starRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starBtn: {
    padding: 2,
  },
  commentSection: {
    marginBottom: 20,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#333',
  },
  charCount: {
    fontSize: 11,
    color: '#bbb',
    textAlign: 'right',
    marginTop: 4,
  },
  submitBtn: {
    backgroundColor: '#1a2e1a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledBtn: {
    backgroundColor: '#aaa',
  },
});
