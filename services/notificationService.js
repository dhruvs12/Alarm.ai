// services/notificationService.js
import { openai } from './openai';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { addDoc, collection } from 'firebase/firestore';

export class NotificationService {
  static async scheduleGoalNotifications(goals, userId) {
    try {
      // Get AI suggestions for notification timing
      const suggestedTimes = await this.getAISuggestedTimes(goals);
      
      // Schedule local notifications
      goals.forEach((goal, index) => {
        const notificationTime = new Date(suggestedTimes[index]);
        
        // Schedule iOS notification
        PushNotificationIOS.scheduleLocalNotification({
          alertTitle: 'Goal Reminder',
          alertBody: `Time to work on your goal: ${goal}`,
          fireDate: notificationTime.toISOString(),
          userInfo: { goalId: index },
        });
        
        // Store notification schedule in Firebase
        this.storeNotificationSchedule(goal, notificationTime, userId);
      });
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }

  static async getAISuggestedTimes(goals) {
    const response = await openai.createCompletion({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: `Given these goals: ${goals.join(', ')}, suggest optimal reminder times throughout the day. 
                 Consider typical productive hours and space them appropriately. Return times in ISO format.`
      }]
    });

    return JSON.parse(response.data.choices[0].message.content);
  }

  static async storeNotificationSchedule(goal, time, userId) {
    const scheduleRef = collection(db, 'notificationSchedules');
    await addDoc(scheduleRef, {
      goal,
      scheduledTime: time,
      userId,
      created: new Date(),
      status: 'scheduled'
    });
  }

  static async markGoalComplete(goalId, userId) {
    // Update goal status in Firebase
    const goalRef = doc(db, 'goals', goalId);
    await updateDoc(goalRef, {
      completed: true,
      completedAt: new Date()
    });

    // Cancel remaining notifications for this goal
    PushNotificationIOS.cancelLocalNotifications({ goalId });
  }
}