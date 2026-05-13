import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

interface DashboardCardProps {
  iconName: any; 
  label: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  color?: string;
}

export default function DashboardCard({ iconName, label, value, subtitle, change, color }: DashboardCardProps) {
  
  const isPositive = change?.startsWith("+");
  const badgeColor = isPositive ? "#2d6a2d" : "#cc4444";
  const badgeBg = isPositive ? "#f0f7f0" : "#fff0f0";

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <View style={styles.iconNameCircle}>
          <Ionicons name={iconName} size={22} color="#1a5e4d" />
        </View>
        
        {change && (
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>{change}</Text>
          </View>
        )}
      </View>

      <Text style={styles.labelText}>{label}</Text>
      <Text style={styles.valueText}>{value}</Text>
      {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  iconNameCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f7f0",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  labelText: { fontSize: 13, color: "#666", marginBottom: 4 },
  valueText: { fontSize: 28, fontWeight: "700", color: "#1a1a1a", marginBottom: 4 },
  subtitleText: { fontSize: 12, color: "#999" },
});