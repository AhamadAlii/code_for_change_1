
// Constants for IndexedDB
const DB_NAME = 'HospitalHarborDB';
const DB_VERSION = 1;
const HOSPITALS_STORE = 'hospitals';
const SEARCH_STORE = 'searches';

// Open IndexedDB connection
export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("IndexedDB error:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create hospitals store
      if (!db.objectStoreNames.contains(HOSPITALS_STORE)) {
        const hospitalStore = db.createObjectStore(HOSPITALS_STORE, { keyPath: 'id' });
        hospitalStore.createIndex('pincode', 'pincode', { unique: false });
      }
      
      // Create searches store
      if (!db.objectStoreNames.contains(SEARCH_STORE)) {
        const searchStore = db.createObjectStore(SEARCH_STORE, { keyPath: 'pincode' });
        searchStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

// Save hospitals to IndexedDB
export const saveHospitals = async (pincode: string, hospitals: any[]): Promise<void> => {
  try {
    const db = await openDB();
    const tx = db.transaction([HOSPITALS_STORE, SEARCH_STORE], 'readwrite');
    
    // Add/update hospitals with the pincode
    const hospitalStore = tx.objectStore(HOSPITALS_STORE);
    
    // Add the pincode to each hospital record
    for (const hospital of hospitals) {
      await new Promise<void>((resolve, reject) => {
        const request = hospitalStore.put({
          ...hospital,
          pincode
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
    
    // Record search with timestamp
    const searchStore = tx.objectStore(SEARCH_STORE);
    await new Promise<void>((resolve, reject) => {
      const request = searchStore.put({
        pincode,
        timestamp: Date.now(),
        count: hospitals.length
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    
    console.log(`Saved ${hospitals.length} hospitals for pincode ${pincode}`);
  } catch (error) {
    console.error('Error saving hospitals to IndexedDB:', error);
    throw error;
  }
};

export const saveBloodBanks = async (pincode: string, bloodBanks: any[]): Promise<void> => {
  try {
    const db = await openDB();
    const tx = db.transaction([BLOOD_BANKS_STORE, SEARCH_STORE], 'readwrite');
    
    // Add/update blood banks with the pincode
    const bloodBankStore = tx.objectStore(BLOOD_BANKS_STORE);
    
    // Add the pincode to each blood bank record
    for (const bloodBank of bloodBanks) {
      await new Promise<void>((resolve, reject) => {
        const request = bloodBankStore.put({
          ...bloodBank,
          pincode
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
    
    // Record search with timestamp
    const searchStore = tx.objectStore(SEARCH_STORE);
    await new Promise<void>((resolve, reject) => {
      const request = searchStore.put({
        pincode,
        timestamp: Date.now(),
        count: bloodBanks.length,
        type: 'bloodBank'
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    
    console.log(`Saved ${bloodBanks.length} blood banks for pincode ${pincode}`);
  } catch (error) {
    console.error('Error saving blood banks to IndexedDB:', error);
    throw error;
  }
};

// Get hospitals by pincode from IndexedDB
export const getHospitalsByPincode = async (pincode: string): Promise<any[]> => {
  try {
    const db = await openDB();
    const tx = db.transaction(HOSPITALS_STORE, 'readonly');
    const store = tx.objectStore(HOSPITALS_STORE);
    const index = store.index('pincode');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(pincode);
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error getting hospitals from IndexedDB:', error);
    return [];
  }
};

// Get blood banks by pincode from IndexedDB
export const getBloodBanksByPincode = async (pincode: string): Promise<any[]> => {
  try {
    const db = await openDB();
    const tx = db.transaction(BLOOD_BANKS_STORE, 'readonly');
    const store = tx.objectStore(BLOOD_BANKS_STORE);
    const index = store.index('pincode');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(pincode);
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error getting blood banks from IndexedDB:', error);
    return [];
  }
};

// Get recent searches
export const getRecentSearches = async (limit = 5): Promise<any[]> => {
  try {
    const db = await openDB();
    const tx = db.transaction(SEARCH_STORE, 'readonly');
    const store = tx.objectStore(SEARCH_STORE);
    
    // Get all searches
    const allSearches = await new Promise<any[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
    
    // Sort by timestamp (newest first) and limit
    return allSearches
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting recent searches from IndexedDB:', error);
    return [];
  }
};

// Clear all data from IndexedDB
export const clearDatabase = async (): Promise<void> => {
  try {
    const db = await openDB();
    const tx = db.transaction([HOSPITALS_STORE, SEARCH_STORE], 'readwrite');
    
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const request = tx.objectStore(HOSPITALS_STORE).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = tx.objectStore(SEARCH_STORE).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
    ]);
    
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
};

// Check if the browser is online
export const isOnline = (): boolean => {
  return navigator.onLine;
};
