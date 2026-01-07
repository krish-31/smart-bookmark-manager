/**
 * Hash Table (Hash Map) Implementation
 * Used for fast O(1) bookmark lookups by URL
 * 
 * Key: URL (string)
 * Value: Bookmark object {title, category, visitCount, timestamp}
 */

class HashTable {
    constructor(initialSize = 50) {
        this.size = initialSize;
        this.table = new Array(initialSize);
        this.count = 0; // Number of key-value pairs
    }

    /**
     * Hash function using simple modulo method
     * Converts string key to hash index
     * Time Complexity: O(k) where k = key length
     */
    hash(key) {
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            hash = (hash << 5) - hash + key.charCodeAt(i);
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash) % this.size;
    }

    /**
     * Insert or update a key-value pair
     * Time Complexity: O(1) average, O(n) worst case (collision)
     */
    put(key, value) {
        if (this.count >= this.size * 0.75) {
            this.resize();
        }

        const index = this.hash(key);

        // Handle collision with linear probing
        let i = 0;
        while (i < this.size) {
            const currentIndex = (index + i) % this.size;
            
            if (!this.table[currentIndex]) {
                this.table[currentIndex] = { key, value };
                this.count++;
                return;
            } else if (this.table[currentIndex].key === key) {
                // Update existing key
                this.table[currentIndex].value = value;
                return;
            }
            i++;
        }
    }

    /**
     * Retrieve value by key
     * Time Complexity: O(1) average, O(n) worst case
     */
    get(key) {
        const index = this.hash(key);
        let i = 0;

        while (i < this.size) {
            const currentIndex = (index + i) % this.size;
            
            if (!this.table[currentIndex]) {
                return null; // Key not found
            } else if (this.table[currentIndex].key === key) {
                return this.table[currentIndex].value;
            }
            i++;
        }
        return null;
    }

    /**
     * Delete a key-value pair
     * Time Complexity: O(1) average
     */
    delete(key) {
        const index = this.hash(key);
        let i = 0;

        while (i < this.size) {
            const currentIndex = (index + i) % this.size;
            
            if (!this.table[currentIndex]) {
                return false;
            } else if (this.table[currentIndex].key === key) {
                this.table[currentIndex] = null;
                this.count--;
                return true;
            }
            i++;
        }
        return false;
    }

    /**
     * Check if key exists
     * Time Complexity: O(1) average
     */
    contains(key) {
        return this.get(key) !== null;
    }

    /**
     * Get all keys in the hash table
     * Time Complexity: O(n)
     */
    keys() {
        return this.table
            .filter(entry => entry !== null && entry !== undefined)
            .map(entry => entry.key);
    }

    /**
     * Get all values in the hash table
     * Time Complexity: O(n)
     */
    values() {
        return this.table
            .filter(entry => entry !== null && entry !== undefined)
            .map(entry => entry.value);
    }

    /**
     * Get all entries [key, value] pairs
     * Time Complexity: O(n)
     */
    entries() {
        return this.table
            .filter(entry => entry !== null && entry !== undefined)
            .map(entry => [entry.key, entry.value]);
    }

    /**
     * Resize the hash table when load factor exceeds threshold
     * Time Complexity: O(n)
     */
    resize() {
        const oldTable = this.table;
        this.size = Math.max(this.size * 2, 100);
        this.table = new Array(this.size);
        this.count = 0;

        // Rehash all entries
        for (let entry of oldTable) {
            if (entry !== null && entry !== undefined) {
                this.put(entry.key, entry.value);
            }
        }
    }

    /**
     * Get table size (number of stored entries, not array length)
     */
    getCount() {
        return this.count;
    }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HashTable;
}
