import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';


const STATS_KEY = 'word_stats';
const SAVE_DEBOUNCE_TIME = 500; 


export type DailyStats = {
  date: string; 
  masteredCount: number;
};


type StatsObserver = () => void;

export class StatsService {
  private dailyStats: DailyStats[] = [];
  private isLoaded: boolean = false;
  private saveTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private observers: Set<StatsObserver> = new Set();

  
  async init(): Promise<void> {
    if (this.isLoaded) return;

    try {
      const statsJson = await AsyncStorage.getItem(STATS_KEY);
      
      if (statsJson) {
        this.dailyStats = JSON.parse(statsJson);
      }

      
      this.ensureTodayExists();
      this.isLoaded = true;
    } catch (error) {
      console.error('Error initializing stats service:', error);
      this.ensureTodayExists();
      this.isLoaded = true;
    }
  }
  
  recordWordMastered(): void {
    if (!this.isLoaded) {
      this.init().then(() => this.recordWordMastered());
      return;
    }

    
    this.ensureTodayExists();
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayStats = this.dailyStats.find(day => day.date === today);
    
    if (todayStats) {
      todayStats.masteredCount++;
      
      
      this.notifyObservers();
      
      
      this.saveStats();
    }
  }

  
  recordWordUnmastered(): void {
    if (!this.isLoaded) {
      this.init().then(() => this.recordWordUnmastered());
      return;
    }

    
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayStats = this.dailyStats.find(day => day.date === today);
    
    if (todayStats && todayStats.masteredCount > 0) {
      todayStats.masteredCount--;
      
      
      this.notifyObservers();
      
      
      this.saveStats();
    }
  }

  
  getTodayStats(): DailyStats {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayStats = this.dailyStats.find(day => day.date === today);
    
    return todayStats || { date: today, masteredCount: 0 };
  }

  
  getWeekStats(): DailyStats[] {
    const result: DailyStats[] = [];
    const today = new Date();
    
    
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      const dayStats = this.dailyStats.find(day => day.date === date);
      
      result.push(dayStats || { date, masteredCount: 0 });
    }
    
    return result;
  }
  
  subscribe(observer: StatsObserver): () => void {
    this.observers.add(observer);
    
    
    return () => {
      this.observers.delete(observer);
    };
  }

  
  private notifyObservers(): void {
    this.observers.forEach(observer => observer());
  }

  
  private saveStats(): void {
    if (this.saveTimeoutId) {
      clearTimeout(this.saveTimeoutId);
    }

    this.saveTimeoutId = setTimeout(() => {
      this.saveStatsImmediately();
    }, SAVE_DEBOUNCE_TIME);
  }

  
  private async saveStatsImmediately(): Promise<void> {
    try {
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(this.dailyStats));
      
      this.notifyObservers();
    } catch (error) {
      console.error('Error saving stats:', error);
    }
  }

  
  private ensureTodayExists(): void {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayExists = this.dailyStats.some(day => day.date === today);
    
    if (!todayExists) {
      this.dailyStats.push({
        date: today,
        masteredCount: 0
      });
    }
  }
}


const statsServiceInstance = new StatsService();


export const statsService = statsServiceInstance;
