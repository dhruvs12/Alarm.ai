// screens/AlarmScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { addDoc, collection } from 'firebase/firestore';
import { openai } from '../services/openai';

export default function AlarmScreen({ navigation }) {
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [goals, setGoals] = useState(['']);
  const [isGoalInputComplete, setIsGoalInputComplete] = useState(false);

  // Alarm activation logic
  useEffect(() => {
    if (isAlarmActive && !isGoalInputComplete) {
      // Play alarm sound
      playAlarmSound();
    }
  }, [isAlarmActive, isGoalInputComplete]);

  const handleGoalSubmission = async () => {
    try {
      // Filter out empty goals
      const validGoals = goals.filter(goal => goal.trim() !== '');
      
      // Use OpenAI to analyze goals and suggest optimal reminder times
      const analysis = await openai.createCompletion({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: `Analyze these goals and suggest optimal reminder times: ${validGoals.join(', ')}`
        }]
      });

      // Store goals and suggested times in Firebase
      const goalsRef = collection(db, 'goals');
      await addDoc(goalsRef, {
        goals: validGoals,
        userId: auth.currentUser.uid,
        createdAt: new Date(),
        suggestedTimes: analysis.data.choices[0].message.content,
        completed: false
      });

      // Schedule notifications based on AI suggestions
      scheduleGoalNotifications(validGoals, analysis.data.choices[0].message.content);
      
      setIsGoalInputComplete(true);
      setIsAlarmActive(false);
    } catch (error) {
      console.error('Error submitting goals:', error);
    }
  };

  return (
    <View style={styles.container}>
      {isAlarmActive && !isGoalInputComplete ? (
        <View style={styles.alarmContainer}>
          <Text style={styles.alarmText}>Time to set your daily goals!</Text>
          {goals.map((goal, index) => (
            <TextInput
              key={index}
              style={styles.input}
              value={goal}
              onChangeText={(text) => {
                const newGoals = [...goals];
                newGoals[index] = text;
                setGoals(newGoals);
              }}
              placeholder="Enter your goal..."
            />
          ))}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setGoals([...goals, ''])}
          >
            <Text>Add Another Goal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleGoalSubmission}
          >
            <Text>Submit Goals</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.dashboardContainer}>
          <Text>Your goals for today have been set!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  alarmContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alarmText: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  addButton: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginTop: 10,
  },
  submitButton: {
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    marginTop: 20,
  },
  dashboardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});