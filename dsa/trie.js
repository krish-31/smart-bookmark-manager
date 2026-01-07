/**
 * Trie (Prefix Tree) Implementation
 * Used for autocomplete search on bookmark titles
 * 
 * Supports efficient prefix matching: O(m) where m = query length
 */

class TrieNode {
    constructor() {
        this.children = {}; // Map of character -> TrieNode
        this.isEndOfWord = false;
        this.bookmarkURL = null; // Store reference to bookmark when at end of word
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
        this.wordCount = 0;
    }

    /**
     * Insert a word (bookmark title) into the trie
     * Time Complexity: O(m) where m = word length
     */
    insert(word, bookmarkURL) {
        let node = this.root;

        // Traverse/create path for each character
        for (let char of word.toLowerCase()) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }

        // Mark end of word and store bookmark reference
        if (!node.isEndOfWord) {
            this.wordCount++;
        }
        node.isEndOfWord = true;
        node.bookmarkURL = bookmarkURL;
    }

    /**
     * Find all words with given prefix
     * Time Complexity: O(m + n) where m = prefix length, n = results count
     */
    searchByPrefix(prefix) {
        let node = this.root;
        prefix = prefix.toLowerCase();

        // Navigate to end of prefix
        for (let char of prefix) {
            if (!node.children[char]) {
                return []; // Prefix not found
            }
            node = node.children[char];
        }

        // Collect all words from this node onward
        const results = [];
        this.dfsCollect(node, prefix, results);
        return results;
    }

    /**
     * DFS helper to collect all words from a node
     * Time Complexity: O(n) where n = number of words from node
     */
    dfsCollect(node, currentWord, results) {
        if (node.isEndOfWord) {
            results.push({
                word: currentWord,
                bookmarkURL: node.bookmarkURL
            });
        }

        for (let char in node.children) {
            this.dfsCollect(node.children[char], currentWord + char, results);
        }
    }

    /**
     * Search for exact word match
     * Time Complexity: O(m) where m = word length
     */
    search(word) {
        let node = this.root;
        word = word.toLowerCase();

        for (let char of word) {
            if (!node.children[char]) {
                return false;
            }
            node = node.children[char];
        }

        return node.isEndOfWord;
    }

    /**
     * Delete a word from trie
     * Time Complexity: O(m) where m = word length
     */
    delete(word) {
        word = word.toLowerCase();
        return this.deleteHelper(this.root, word, 0);
    }

    /**
     * Recursive helper for delete
     */
    deleteHelper(node, word, index) {
        if (index === word.length) {
            if (!node.isEndOfWord) {
                return false; // Word not found
            }
            node.isEndOfWord = false;
            this.wordCount--;
            return Object.keys(node.children).length === 0;
        }

        const char = word[index];
        if (!node.children[char]) {
            return false; // Character path doesn't exist
        }

        const shouldDeleteChild = this.deleteHelper(
            node.children[char],
            word,
            index + 1
        );

        if (shouldDeleteChild) {
            delete node.children[char];
            return Object.keys(node.children).length === 0 && !node.isEndOfWord;
        }

        return false;
    }

    /**
     * Get all words in trie
     * Time Complexity: O(n) where n = total characters in all words
     */
    getAllWords() {
        const results = [];
        this.dfsCollect(this.root, '', results);
        return results;
    }

    /**
     * Get count of words in trie
     */
    getWordCount() {
        return this.wordCount;
    }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Trie;
}
