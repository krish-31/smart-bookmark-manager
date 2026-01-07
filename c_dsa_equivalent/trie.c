/**
 * Trie (Prefix Tree) Implementation in C
 * Efficiently stores strings and enables prefix search
 * 
 * Compile: gcc -o trie trie.c
 * Run: ./trie
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define ALPHABET_SIZE 26

/**
 * Trie Node structure
 */
typedef struct TrieNode {
    struct TrieNode *children[ALPHABET_SIZE];
    int is_end_of_word;
    char word[256];
} TrieNode;

/**
 * Trie structure
 */
typedef struct {
    TrieNode *root;
    int word_count;
} Trie;

/**
 * Convert character to index (a/A = 0, b/B = 1, ... z/Z = 25)
 */
int char_to_index(char c) {
    return tolower(c) - 'a';
}

/**
 * Create new trie node
 * Time Complexity: O(1)
 */
TrieNode *trie_node_create() {
    TrieNode *node = (TrieNode *)malloc(sizeof(TrieNode));
    
    for (int i = 0; i < ALPHABET_SIZE; i++) {
        node->children[i] = NULL;
    }
    
    node->is_end_of_word = 0;
    node->word[0] = '\0';
    
    return node;
}

/**
 * Create new trie
 * Time Complexity: O(1)
 */
Trie *trie_create() {
    Trie *trie = (Trie *)malloc(sizeof(Trie));
    trie->root = trie_node_create();
    trie->word_count = 0;
    return trie;
}

/**
 * Insert word into trie
 * Time Complexity: O(m) where m = word length
 */
void trie_insert(Trie *trie, const char *word) {
    if (!word || strlen(word) == 0) return;
    
    TrieNode *current = trie->root;
    
    // Traverse and create nodes for each character
    for (int i = 0; word[i] != '\0'; i++) {
        int index = char_to_index(word[i]);
        
        if (index < 0 || index >= ALPHABET_SIZE) {
            printf("Invalid character: %c\n", word[i]);
            return;
        }
        
        // Create node if doesn't exist
        if (current->children[index] == NULL) {
            current->children[index] = trie_node_create();
        }
        
        current = current->children[index];
    }
    
    // Mark end of word if not already marked
    if (!current->is_end_of_word) {
        current->is_end_of_word = 1;
        trie->word_count++;
        strcpy(current->word, word);
    }
}

/**
 * Search for exact word match
 * Time Complexity: O(m) where m = word length
 */
int trie_search(Trie *trie, const char *word) {
    if (!word || strlen(word) == 0) return 0;
    
    TrieNode *current = trie->root;
    
    for (int i = 0; word[i] != '\0'; i++) {
        int index = char_to_index(word[i]);
        
        if (index < 0 || index >= ALPHABET_SIZE || current->children[index] == NULL) {
            return 0;  // Character not found
        }
        
        current = current->children[index];
    }
    
    // Check if it's end of a word
    return current->is_end_of_word;
}

/**
 * Collect all words with given prefix (using DFS)
 * Time Complexity: O(n) where n = total characters in results
 */
void trie_prefix_dfs(TrieNode *node, char *prefix, int prefix_len, 
                      char results[][256], int *result_count) {
    if (*result_count >= 100) return;  // Limit results
    
    if (node->is_end_of_word) {
        strcpy(results[*result_count], prefix);
        (*result_count)++;
    }
    
    for (int i = 0; i < ALPHABET_SIZE; i++) {
        if (node->children[i] != NULL) {
            prefix[prefix_len] = 'a' + i;
            prefix[prefix_len + 1] = '\0';
            
            trie_prefix_dfs(node->children[i], prefix, prefix_len + 1, results, result_count);
        }
    }
}

/**
 * Find all words with given prefix
 * Time Complexity: O(m + n) where m = prefix length, n = results count
 */
int trie_search_prefix(Trie *trie, const char *prefix, 
                       char results[][256]) {
    if (!prefix || strlen(prefix) == 0) return 0;
    
    TrieNode *current = trie->root;
    int prefix_len = strlen(prefix);
    
    // Navigate to end of prefix
    for (int i = 0; i < prefix_len; i++) {
        int index = char_to_index(prefix[i]);
        
        if (index < 0 || index >= ALPHABET_SIZE || current->children[index] == NULL) {
            return 0;  // Prefix not found
        }
        
        current = current->children[index];
    }
    
    // Collect all words from this node
    char buffer[256];
    strcpy(buffer, prefix);
    
    int result_count = 0;
    trie_prefix_dfs(current, buffer, prefix_len, results, &result_count);
    
    return result_count;
}

/**
 * Print all words in trie
 * Time Complexity: O(n) where n = total characters
 */
void trie_print(Trie *trie) {
    printf("\n=== All Words in Trie ===\n");
    printf("Total words: %d\n\n", trie->word_count);
    
    // Simple traversal to collect all words
    char results[100][256];
    char buffer[256];
    int result_count = 0;
    
    trie_prefix_dfs(trie->root, buffer, 0, results, &result_count);
    
    for (int i = 0; i < result_count; i++) {
        printf("  - %s\n", results[i]);
    }
}

/**
 * Delete word from trie (mark as not end of word)
 * Time Complexity: O(m) where m = word length
 */
void trie_delete(Trie *trie, const char *word) {
    if (!word || strlen(word) == 0) return;
    
    TrieNode *current = trie->root;
    
    for (int i = 0; word[i] != '\0'; i++) {
        int index = char_to_index(word[i]);
        
        if (index < 0 || index >= ALPHABET_SIZE || current->children[index] == NULL) {
            return;  // Word not found
        }
        
        current = current->children[index];
    }
    
    if (current->is_end_of_word) {
        current->is_end_of_word = 0;
        trie->word_count--;
    }
}

/**
 * Free trie memory (recursive)
 */
void trie_free_recursive(TrieNode *node) {
    if (!node) return;
    
    for (int i = 0; i < ALPHABET_SIZE; i++) {
        if (node->children[i] != NULL) {
            trie_free_recursive(node->children[i]);
        }
    }
    
    free(node);
}

/**
 * Free entire trie
 */
void trie_free(Trie *trie) {
    trie_free_recursive(trie->root);
    free(trie);
}

/**
 * Demonstration program
 */
int main() {
    printf("=== Trie (Prefix Tree) Implementation in C ===\n");
    printf("Data Structure: Trie for prefix matching and autocomplete\n");
    printf("Operations: Insert O(m), Search O(m), Prefix Search O(m+k)\n\n");
    
    Trie *trie = trie_create();
    
    // Insert sample words
    printf("--- Inserting words ---\n");
    const char *words[] = {"cat", "car", "card", "care", "careful", "apple", "app", "apply"};
    int word_count = sizeof(words) / sizeof(words[0]);
    
    for (int i = 0; i < word_count; i++) {
        trie_insert(trie, words[i]);
        printf("Inserted: %s\n", words[i]);
    }
    
    trie_print(trie);
    
    // Search for exact words
    printf("\n--- Searching for exact words ---\n");
    if (trie_search(trie, "car")) {
        printf("✓ Found: 'car'\n");
    } else {
        printf("✗ Not found: 'car'\n");
    }
    
    if (trie_search(trie, "care")) {
        printf("✓ Found: 'care'\n");
    } else {
        printf("✗ Not found: 'care'\n");
    }
    
    if (trie_search(trie, "ca")) {
        printf("✓ Found: 'ca'\n");
    } else {
        printf("✗ Not found: 'ca'\n");
    }
    
    // Prefix search
    printf("\n--- Prefix search (autocomplete) ---\n");
    char results[100][256];
    
    int count = trie_search_prefix(trie, "car", results);
    printf("Words starting with 'car': %d\n", count);
    for (int i = 0; i < count; i++) {
        printf("  - %s\n", results[i]);
    }
    
    count = trie_search_prefix(trie, "app", results);
    printf("\nWords starting with 'app': %d\n", count);
    for (int i = 0; i < count; i++) {
        printf("  - %s\n", results[i]);
    }
    
    // Delete and verify
    printf("\n--- Deleting 'car' ---\n");
    trie_delete(trie, "car");
    
    if (!trie_search(trie, "car")) {
        printf("✓ 'car' successfully deleted\n");
    }
    
    trie_print(trie);
    
    // Cleanup
    trie_free(trie);
    printf("\nTrie freed.\n");
    
    return 0;
}
