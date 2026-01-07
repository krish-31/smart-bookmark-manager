/**
 * Hash Table Implementation in C
 * Key-Value pair storage using Hash Function and Linear Probing
 * 
 * Compile: gcc -o hash_table hash_table.c
 * Run: ./hash_table
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_SIZE 50
#define KEY_SIZE 256
#define VALUE_SIZE 256

/**
 * Entry structure for hash table
 */
typedef struct {
    char key[KEY_SIZE];
    char value[VALUE_SIZE];
    int occupied;  // 0 = empty, 1 = occupied, 2 = deleted
} HashEntry;

/**
 * Hash Table structure
 */
typedef struct {
    HashEntry *table;
    int size;
    int count;
} HashTable;

/**
 * Simple hash function using string summation
 * Time Complexity: O(k) where k = key length
 */
int hash_function(const char *key, int size) {
    unsigned long hash = 0;
    for (int i = 0; key[i] != '\0'; i++) {
        hash = (hash << 5) - hash + (unsigned char)key[i];
    }
    return hash % size;
}

/**
 * Create new hash table
 * Time Complexity: O(n) where n = table size
 */
HashTable *hash_table_create(int initial_size) {
    HashTable *ht = (HashTable *)malloc(sizeof(HashTable));
    ht->size = initial_size;
    ht->count = 0;
    ht->table = (HashEntry *)calloc(initial_size, sizeof(HashEntry));
    
    // Initialize all entries as empty
    for (int i = 0; i < initial_size; i++) {
        ht->table[i].occupied = 0;
    }
    
    return ht;
}

/**
 * Insert key-value pair using linear probing for collision handling
 * Time Complexity: O(1) average, O(n) worst case
 */
void hash_table_insert(HashTable *ht, const char *key, const char *value) {
    if (!key || !value) return;
    
    int hash_index = hash_function(key, ht->size);
    int i = 0;
    
    // Linear probing: find empty or matching slot
    while (i < ht->size) {
        int current_index = (hash_index + i) % ht->size;
        
        if (ht->table[current_index].occupied == 0) {
            // Empty slot found
            strncpy(ht->table[current_index].key, key, KEY_SIZE - 1);
            strncpy(ht->table[current_index].value, value, VALUE_SIZE - 1);
            ht->table[current_index].occupied = 1;
            ht->count++;
            return;
        } else if (ht->table[current_index].occupied == 1 && 
                   strcmp(ht->table[current_index].key, key) == 0) {
            // Update existing key
            strncpy(ht->table[current_index].value, value, VALUE_SIZE - 1);
            return;
        }
        
        i++;
    }
}

/**
 * Retrieve value by key
 * Time Complexity: O(1) average, O(n) worst case
 */
char *hash_table_get(HashTable *ht, const char *key) {
    if (!key) return NULL;
    
    int hash_index = hash_function(key, ht->size);
    int i = 0;
    
    while (i < ht->size) {
        int current_index = (hash_index + i) % ht->size;
        
        if (ht->table[current_index].occupied == 0) {
            // Empty slot means key not found
            return NULL;
        } else if (ht->table[current_index].occupied == 1 && 
                   strcmp(ht->table[current_index].key, key) == 0) {
            return ht->table[current_index].value;
        }
        
        i++;
    }
    
    return NULL;
}

/**
 * Delete key-value pair
 * Time Complexity: O(1) average
 */
int hash_table_delete(HashTable *ht, const char *key) {
    if (!key) return 0;
    
    int hash_index = hash_function(key, ht->size);
    int i = 0;
    
    while (i < ht->size) {
        int current_index = (hash_index + i) % ht->size;
        
        if (ht->table[current_index].occupied == 0) {
            return 0;  // Key not found
        } else if (ht->table[current_index].occupied == 1 && 
                   strcmp(ht->table[current_index].key, key) == 0) {
            // Mark as deleted but keep slot for probing
            ht->table[current_index].occupied = 2;
            ht->count--;
            return 1;
        }
        
        i++;
    }
    
    return 0;
}

/**
 * Print all key-value pairs
 * Time Complexity: O(n)
 */
void hash_table_print(HashTable *ht) {
    printf("\n=== Hash Table Contents ===\n");
    for (int i = 0; i < ht->size; i++) {
        if (ht->table[i].occupied == 1) {
            printf("[%d] Key: %-20s Value: %s\n", i, ht->table[i].key, ht->table[i].value);
        }
    }
    printf("Total entries: %d / Size: %d\n\n", ht->count, ht->size);
}

/**
 * Free hash table memory
 */
void hash_table_free(HashTable *ht) {
    free(ht->table);
    free(ht);
}

/**
 * Demonstration program
 */
int main() {
    printf("=== Hash Table Implementation in C ===\n");
    printf("Data Structure: Hash Table (Hash Map)\n");
    printf("Hash Function: String summation with modulo\n");
    printf("Collision Handling: Linear Probing\n\n");
    
    HashTable *ht = hash_table_create(10);
    
    // Test insertions
    printf("--- Inserting entries ---\n");
    hash_table_insert(ht, "github.com", "GitHub");
    hash_table_insert(ht, "stackoverflow.com", "Stack Overflow");
    hash_table_insert(ht, "mdn.io", "MDN Web Docs");
    hash_table_insert(ht, "youtube.com", "YouTube");
    printf("Inserted 4 bookmarks\n");
    
    hash_table_print(ht);
    
    // Test searches
    printf("--- Searching entries ---\n");
    char *result = hash_table_get(ht, "github.com");
    if (result) {
        printf("✓ Found: github.com → %s\n", result);
    } else {
        printf("✗ Not found: github.com\n");
    }
    
    result = hash_table_get(ht, "twitter.com");
    if (result) {
        printf("✓ Found: twitter.com → %s\n", result);
    } else {
        printf("✗ Not found: twitter.com\n");
    }
    
    // Test update
    printf("\n--- Updating entry ---\n");
    hash_table_insert(ht, "github.com", "GitHub (Updated)");
    result = hash_table_get(ht, "github.com");
    printf("Updated: github.com → %s\n", result);
    
    hash_table_print(ht);
    
    // Test deletion
    printf("--- Deleting entry ---\n");
    hash_table_delete(ht, "youtube.com");
    printf("Deleted: youtube.com\n");
    
    hash_table_print(ht);
    
    // Cleanup
    hash_table_free(ht);
    printf("Hash table freed.\n");
    
    return 0;
}
