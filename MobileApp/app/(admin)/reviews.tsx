import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Star, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react-native';
import { API_URL } from '../../constants/utils/constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

function StarDisplay({ value }: { value: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={14}
          fill={value >= s ? "#f4c542" : "none"}
          color={value >= s ? "#f4c542" : "#ddd"}
          strokeWidth={1.5}
        />
      ))}
      <Text style={styles.starValue}>{value.toFixed(1)}</Text>
    </View>
  );
}

export default function Reviews() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/reviews/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      setData(Array.isArray(d) ? d : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#1a431e" />
      <Text style={styles.loadingText}>Loading reviews...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Course Reviews</Text>
        <Text style={styles.subtitle}>Student feedback on courses and instructors</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.courseCode}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MessageSquare size={48} color="#ddd" />
            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.emptySubtitle}>Student reviews will appear here once submitted.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.courseCard}>
            <TouchableOpacity 
              style={styles.courseHeader}
              onPress={() => setExpanded(expanded === item.courseCode ? null : item.courseCode)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.courseName}>{item.courseName}</Text>
                <Text style={styles.courseCode}>{item.courseCode}{item.instructorName ? ` · ${item.instructorName}` : ''}</Text>
              </View>
              <View style={styles.chevron}>
                {expanded === item.courseCode ? <ChevronUp size={20} color="#888" /> : <ChevronDown size={20} color="#888" />}
              </View>
            </TouchableOpacity>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>COURSE</Text>
                <StarDisplay value={item.avgCourseRating} />
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>INSTRUCTOR</Text>
                <StarDisplay value={item.avgInstructorRating} />
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.totalReviews} reviews</Text>
              </View>
            </View>

            {expanded === item.courseCode && (
              <View style={styles.expandedContent}>
                {item.reviews.map((r: any, idx: number) => (
                  <View key={idx} style={styles.reviewItem}>
                    <View style={styles.reviewTop}>
                      <Text style={styles.studentName}>{r.studentName}</Text>
                      <Text style={styles.reviewDate}>{new Date(r.date).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.reviewRatings}>
                      <View style={styles.miniRating}>
                        <Text style={styles.miniLabel}>Course: </Text>
                        <StarDisplay value={r.courseRating} />
                      </View>
                      <View style={styles.miniRating}>
                        <Text style={styles.miniLabel}>Inst: </Text>
                        <StarDisplay value={r.instructorRating} />
                      </View>
                    </View>
                    <Text style={styles.comment}>{r.comment || "No comment provided."}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faf8',
    padding: 16,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#888',
  },
  courseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  courseHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  courseCode: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  chevron: {
    marginLeft: 10,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f9f9f9',
    paddingTop: 12,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#aaa',
    marginBottom: 4,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starValue: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  badge: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#1a431e',
    fontSize: 11,
    fontWeight: '700',
  },
  expandedContent: {
    backgroundColor: '#fafcfa',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  reviewItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reviewDate: {
    fontSize: 11,
    color: '#aaa',
  },
  reviewRatings: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 12,
  },
  miniRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniLabel: {
    fontSize: 11,
    color: '#888',
  },
  comment: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#bbb',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 8,
  },
});
