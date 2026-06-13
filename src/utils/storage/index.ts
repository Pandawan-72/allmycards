import AsyncStorage from "@react-native-async-storage/async-storage";

class Storage {
  async getItem<T>(key: string, fallback: T): Promise<T> {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val === null) return fallback;
      return JSON.parse(val) as T;
    } catch {
      return fallback;
    }
  }

  async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
}

export const storage = new Storage();
