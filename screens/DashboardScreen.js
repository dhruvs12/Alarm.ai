// screens/DashboardScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ThemeContext } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext';
import { LineChart } from 'react-native-chart-kit';

export default function DashboardScreen() {
  const [goals, setGoals] = useState([]);
  const [completionStats, setCompletionStats] = useState({});
  const { theme, themes } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const goalsRef = collection(db, 'goals');
      const q = query(goalsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const goalsData = [];
      querySnapshot.forEach((doc) => {
        goalsData.push({ id: doc.id, ...doc.data() });
      });
      
      setGoals(goalsData);
      calculateStats(goalsData);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const calculateStats = (goalsData) => {
    const stats = {
      completed: goalsData.filter(g => g.completed).length,
      total: goalsData.length,
      completionRate: 0
    };
    
    stats.completionRate = (stats.completed / stats.total) * 100 || 0;
    setCompletionStats(stats);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: themes[theme].background }]}>
      <View style={styles.statsContainer}>
        <Text style={[styles.title, { color: themes[theme].text }]}>
          Progress Dashboard
        </Text>
        
        <View style={[styles.card, { backgroundColor: themes[theme].surface }]}>
          <Text style={[styles.cardTitle, { color: themes[theme].text }]}>
            Today's Progress
          </Text>
          <Text style={[styles.statsText, { color: themes[theme].primary }]}>
            {completionStats.completed} / {completionStats.total} Goals Completed
          </Text>
          <Text style={[styles.statsText, { color: themes[theme].secondary }]}>
            {completionStats.completionRate.toFixed(1)}% Completion Rate
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: themes[theme].surface }]}>
          <Text style={[styles.cardTitle, { color: themes[theme].text }]}>
            Active Goals
          </Text>
          {goals.map((goal, index) => (
            <View key={index} style={styles.goalItem}>
              <Text style={[styles.goalText, { color: themes[theme].text }]}>
                {goal.text}
              </Text>
              <Text style={[styles.goalStatus, { 
                color: goal.completed ? themes[theme].primary : themes[theme].error 
              }]}>
                {goal.completed ? '✓ Complete' : '○ In Progress'}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statsText: {
    fontSize: 16,
    marginBottom: 5,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  goalText: {
    flex: 1,
    fontSize: 16,
  },
  goalStatus: {
    fontSize: 14,
    marginLeft: 10,
  },
});