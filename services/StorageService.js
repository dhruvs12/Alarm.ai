// services/StorageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
  static async storeGoals(goals) {
    try {
      await AsyncStorage.setItem('goals', JSON.stringify(goals));
    } catch (error) {
      console.error('Error storing goals:', error);
    }
  }

  static async getGoals() {
    try {
      const goals = await AsyncStorage.getItem('goals');
      return goals ? JSON.parse(goals) : [];
    } catch (error) {
      console.error('Error getting goals:', error);
      return [];
    }
  }

  static async storeAlarmSettings(settings) {
    try {
      await AsyncStorage.setItem('alarmSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error storing alarm settings:', error);
    }
  }

  static async getAlarmSettings() {
    try {
      const settings = await AsyncStorage.getItem('alarmSettings');
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error getting alarm settings:', error);
      return null;
    }
  }

  static async clearAllData() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  // Sync local data with Firebase when online
  static async syncWithFirebase(userId) {
    try {
      const localGoals = await this.getGoals();
      const goalsRef = collection(db, 'goals');
      
      // Upload local goals that aren't in Firebase
      for (const goal of localGoals) {
        if (!goal.syncedWithFirebase) {
          await addDoc(goalsRef, {
            ...goal,
            userId,
            syncedWithFirebase: true
          });
        }
      }
      
      // Get goals from Firebase
      const q = query(goalsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const firebaseGoals = [];
      querySnapshot.forEach((doc) => {
        firebaseGoals.push({ id: doc.id, ...doc.data() });
      });
      
      // Merge and store locally
      await this.storeGoals(firebaseGoals);
      
    } catch (error) {
      console.error('Error syncing with Firebase:', error);
    }
  }
}