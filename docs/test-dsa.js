#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Bookmark Manager DSA Implementations
 */

// Simple module wrapper for Node.js
function loadDSA() {
    // Hash Table
    class HashTable {
        constructor(initialSize = 50) {
            this.size = initialSize;
            this.table = new Array(initialSize);
            this.count = 0;
        }

        hash(key) {
            let hash = 0;
            for (let i = 0; i < key.length; i++) {
                hash = (hash << 5) - hash + key.charCodeAt(i);
                hash = hash & hash;
            }
            return Math.abs(hash) % this.size;
        }

        put(key, value) {
            if (this.count >= this.size * 0.75) {
                this.resize();
            }

            const index = this.hash(key);
            let i = 0;
            while (i < this.size) {
                const currentIndex = (index + i) % this.size;
                
                if (!this.table[currentIndex]) {
                    this.table[currentIndex] = { key, value };
                    this.count++;
                    return;
                } else if (this.table[currentIndex].key === key) {
                    this.table[currentIndex].value = value;
                    return;
                }
                i++;
            }
        }

        get(key) {
            const index = this.hash(key);
            let i = 0;

            while (i < this.size) {
                const currentIndex = (index + i) % this.size;
                
                if (!this.table[currentIndex]) {
                    return null;
                } else if (this.table[currentIndex].key === key) {
                    return this.table[currentIndex].value;
                }
                i++;
            }
            return null;
        }

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

        contains(key) {
            return this.get(key) !== null;
        }

        values() {
            return this.table
                .filter(entry => entry !== null && entry !== undefined)
                .map(entry => entry.value);
        }

        getCount() {
            return this.count;
        }

        resize() {
            const oldTable = this.table;
            this.size = Math.max(this.size * 2, 100);
            this.table = new Array(this.size);
            this.count = 0;

            for (let entry of oldTable) {
                if (entry !== null && entry !== undefined) {
                    this.put(entry.key, entry.value);
                }
            }
        }
    }

    // Trie
    class TrieNode {
        constructor() {
            this.children = {};
            this.isEndOfWord = false;
            this.bookmarkURL = null;
        }
    }

    class Trie {
        constructor() {
            this.root = new TrieNode();
            this.wordCount = 0;
        }

        insert(word, bookmarkURL) {
            let node = this.root;

            for (let char of word.toLowerCase()) {
                if (!node.children[char]) {
                    node.children[char] = new TrieNode();
                }
                node = node.children[char];
            }

            if (!node.isEndOfWord) {
                this.wordCount++;
            }
            node.isEndOfWord = true;
            node.bookmarkURL = bookmarkURL;
        }

        searchByPrefix(prefix) {
            let node = this.root;
            prefix = prefix.toLowerCase();

            for (let char of prefix) {
                if (!node.children[char]) {
                    return [];
                }
                node = node.children[char];
            }

            const results = [];
            this.dfsCollect(node, prefix, results);
            return results;
        }

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

        delete(word) {
            word = word.toLowerCase();
            return this.deleteHelper(this.root, word, 0);
        }

        deleteHelper(node, word, index) {
            if (index === word.length) {
                if (!node.isEndOfWord) {
                    return false;
                }
                node.isEndOfWord = false;
                this.wordCount--;
                return Object.keys(node.children).length === 0;
            }

            const char = word[index];
            if (!node.children[char]) {
                return false;
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
    }

    // Linked List
    class LinkedListNode {
        constructor(bookmarkData) {
            this.data = bookmarkData;
            this.next = null;
        }
    }

    class LinkedList {
        constructor(maxSize = 20) {
            this.head = null;
            this.tail = null;
            this.size = 0;
            this.maxSize = maxSize;
        }

        insertAtBeginning(bookmarkData) {
            const newNode = new LinkedListNode(bookmarkData);

            if (this.head === null) {
                this.head = newNode;
                this.tail = newNode;
            } else {
                newNode.next = this.head;
                this.head = newNode;
            }

            this.size++;

            if (this.size > this.maxSize) {
                this.removeFromEnd();
            }
        }

        moveToFront(bookmarkURL) {
            let current = this.head;
            let prev = null;

            while (current !== null) {
                if (current.data.url === bookmarkURL) {
                    if (prev !== null) {
                        prev.next = current.next;
                    } else {
                        this.head = current.next;
                    }

                    if (current === this.tail) {
                        this.tail = prev;
                    }

                    this.size--;
                    this.insertAtBeginning(current.data);
                    return true;
                }
                prev = current;
                current = current.next;
            }
            return false;
        }

        removeFromEnd() {
            if (this.head === null) return null;

            if (this.head === this.tail) {
                const data = this.head.data;
                this.head = null;
                this.tail = null;
                this.size--;
                return data;
            }

            let current = this.head;
            while (current.next !== this.tail) {
                current = current.next;
            }

            const data = this.tail.data;
            current.next = null;
            this.tail = current;
            this.size--;
            return data;
        }

        getAll() {
            const result = [];
            let current = this.head;

            while (current !== null) {
                result.push(current.data);
                current = current.next;
            }

            return result;
        }

        contains(bookmarkURL) {
            let current = this.head;

            while (current !== null) {
                if (current.data.url === bookmarkURL) {
                    return true;
                }
                current = current.next;
            }

            return false;
        }

        delete(bookmarkURL) {
            if (this.head === null) return false;

            if (this.head.data.url === bookmarkURL) {
                this.head = this.head.next;
                if (this.size === 1) {
                    this.tail = null;
                }
                this.size--;
                return true;
            }

            let current = this.head;
            let prev = null;

            while (current !== null) {
                if (current.data.url === bookmarkURL) {
                    prev.next = current.next;
                    if (current === this.tail) {
                        this.tail = prev;
                    }
                    this.size--;
                    return true;
                }
                prev = current;
                current = current.next;
            }

            return false;
        }

        getSize() {
            return this.size;
        }
    }

    // Min Heap
    class MinHeap {
        constructor() {
            this.heap = [];
        }

        getParentIndex(index) {
            return Math.floor((index - 1) / 2);
        }

        getLeftChildIndex(index) {
            return 2 * index + 1;
        }

        getRightChildIndex(index) {
            return 2 * index + 2;
        }

        swap(index1, index2) {
            [this.heap[index1], this.heap[index2]] = [this.heap[index2], this.heap[index1]];
        }

        insert(bookmarkData) {
            this.heap.push(bookmarkData);
            this.heapifyUp(this.heap.length - 1);
        }

        heapifyUp(index) {
            while (index > 0) {
                const parentIndex = this.getParentIndex(index);

                if (this.heap[parentIndex].visitCount > this.heap[index].visitCount) {
                    this.swap(parentIndex, index);
                    index = parentIndex;
                } else {
                    break;
                }
            }
        }

        extractMin() {
            if (this.heap.length === 0) return null;
            if (this.heap.length === 1) return this.heap.pop();

            const min = this.heap[0];
            this.heap[0] = this.heap.pop();
            this.heapifyDown(0);
            return min;
        }

        heapifyDown(index) {
            while (true) {
                let minIndex = index;
                const leftChildIndex = this.getLeftChildIndex(index);
                const rightChildIndex = this.getRightChildIndex(index);

                if (
                    leftChildIndex < this.heap.length &&
                    this.heap[leftChildIndex].visitCount < this.heap[minIndex].visitCount
                ) {
                    minIndex = leftChildIndex;
                }

                if (
                    rightChildIndex < this.heap.length &&
                    this.heap[rightChildIndex].visitCount < this.heap[minIndex].visitCount
                ) {
                    minIndex = rightChildIndex;
                }

                if (minIndex !== index) {
                    this.swap(index, minIndex);
                    index = minIndex;
                } else {
                    break;
                }
            }
        }

        peek() {
            return this.heap.length > 0 ? this.heap[0] : null;
        }

        updateBookmark(bookmarkURL, newVisitCount) {
            let index = -1;

            for (let i = 0; i < this.heap.length; i++) {
                if (this.heap[i].url === bookmarkURL) {
                    index = i;
                    break;
                }
            }

            if (index === -1) return false;

            const oldCount = this.heap[index].visitCount;
            this.heap[index].visitCount = newVisitCount;

            if (newVisitCount < oldCount) {
                this.heapifyUp(index);
            } else if (newVisitCount > oldCount) {
                this.heapifyDown(index);
            }

            return true;
        }

        getLeastVisited(count = 5) {
            const sorted = [];
            const tempHeap = [...this.heap];

            while (this.heap.length > 0) {
                sorted.push(this.extractMin());
            }

            this.heap = tempHeap;
            return sorted.slice(0, count);
        }

        contains(bookmarkURL) {
            return this.heap.some(bookmark => bookmark.url === bookmarkURL);
        }

        delete(bookmarkURL) {
            const index = this.heap.findIndex(item => item.url === bookmarkURL);
            if (index === -1) return false;

            this.heap[index] = this.heap.pop();

            if (index < this.heap.length) {
                this.heapifyUp(index);
                this.heapifyDown(index);
            }

            return true;
        }

        getSize() {
            return this.heap.length;
        }
    }

    return { HashTable, Trie, LinkedList, MinHeap };
}

// Tests
const { HashTable, Trie, LinkedList, MinHeap } = loadDSA();
let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        testsPassed++;
    } catch (e) {
        console.log(`❌ ${name}: ${e.message}`);
        testsFailed++;
    }
}

console.log('\n🧪 TESTING DSA IMPLEMENTATIONS\n');

// Hash Table Tests
console.log('📦 Hash Table Tests:');
test('Insert and retrieve', () => {
    const ht = new HashTable(10);
    ht.put('https://github.com', { title: 'GitHub' });
    const result = ht.get('https://github.com');
    if (!result || result.title !== 'GitHub') throw new Error('Failed to retrieve');
});

test('Update existing key', () => {
    const ht = new HashTable(10);
    ht.put('url1', { data: 'first' });
    ht.put('url1', { data: 'updated' });
    const result = ht.get('url1');
    if (result.data !== 'updated') throw new Error('Update failed');
});

test('Delete key', () => {
    const ht = new HashTable(10);
    ht.put('url1', { data: 'test' });
    ht.delete('url1');
    const result = ht.get('url1');
    if (result !== null) throw new Error('Delete failed');
});

test('Collision handling', () => {
    const ht = new HashTable(5);
    ht.put('key1', { value: 1 });
    ht.put('key2', { value: 2 });
    ht.put('key3', { value: 3 });
    if (ht.get('key1').value !== 1) throw new Error('Collision handling failed');
    if (ht.get('key2').value !== 2) throw new Error('Collision handling failed');
});

// Trie Tests
console.log('\n🌳 Trie Tests:');
test('Insert and exact search', () => {
    const trie = new Trie();
    trie.insert('GitHub', 'https://github.com');
    if (!trie.search('github')) throw new Error('Search failed');
});

test('Prefix search', () => {
    const trie = new Trie();
    trie.insert('GitHub', 'https://github.com');
    trie.insert('GitLab', 'https://gitlab.com');
    trie.insert('Google', 'https://google.com');
    const results = trie.searchByPrefix('Git');
    if (results.length !== 2) throw new Error(`Expected 2 results, got ${results.length}`);
});

test('Delete word', () => {
    const trie = new Trie();
    trie.insert('GitHub', 'https://github.com');
    trie.delete('GitHub');
    if (trie.search('github')) throw new Error('Delete failed');
});

test('Case insensitive search', () => {
    const trie = new Trie();
    trie.insert('GitHub', 'url');
    if (!trie.search('GITHUB')) throw new Error('Case insensitive search failed');
});

// Linked List Tests
console.log('\n⛓️  Linked List Tests:');
test('Insert at beginning', () => {
    const ll = new LinkedList(5);
    ll.insertAtBeginning({ title: 'A', url: 'a' });
    const all = ll.getAll();
    if (all.length !== 1 || all[0].title !== 'A') throw new Error('Insert failed');
});

test('Insert order (LIFO)', () => {
    const ll = new LinkedList(5);
    ll.insertAtBeginning({ title: 'A', url: 'a' });
    ll.insertAtBeginning({ title: 'B', url: 'b' });
    const all = ll.getAll();
    if (all[0].title !== 'B') throw new Error('Order is wrong');
});

test('Move to front', () => {
    const ll = new LinkedList(5);
    ll.insertAtBeginning({ title: 'A', url: 'a' });
    ll.insertAtBeginning({ title: 'B', url: 'b' });
    ll.moveToFront('a');
    const all = ll.getAll();
    if (all[0].title !== 'A') throw new Error('Move to front failed');
});

test('Max size limit', () => {
    const ll = new LinkedList(3);
    ll.insertAtBeginning({ title: 'A', url: 'a' });
    ll.insertAtBeginning({ title: 'B', url: 'b' });
    ll.insertAtBeginning({ title: 'C', url: 'c' });
    ll.insertAtBeginning({ title: 'D', url: 'd' });
    if (ll.getSize() !== 3) throw new Error('Max size limit not enforced');
});

test('Delete bookmark', () => {
    const ll = new LinkedList(5);
    ll.insertAtBeginning({ title: 'A', url: 'a' });
    ll.insertAtBeginning({ title: 'B', url: 'b' });
    ll.delete('a');
    const all = ll.getAll();
    if (all.find(x => x.url === 'a')) throw new Error('Delete failed');
});

// Min Heap Tests
console.log('\n📚 Min Heap Tests:');
test('Insert and min property', () => {
    const heap = new MinHeap();
    heap.insert({ title: 'A', url: 'a', visitCount: 5 });
    heap.insert({ title: 'B', url: 'b', visitCount: 2 });
    heap.insert({ title: 'C', url: 'c', visitCount: 8 });
    const min = heap.peek();
    if (min.visitCount !== 2) throw new Error('Min property violated');
});

test('Extract min', () => {
    const heap = new MinHeap();
    heap.insert({ title: 'A', url: 'a', visitCount: 5 });
    heap.insert({ title: 'B', url: 'b', visitCount: 2 });
    const min = heap.extractMin();
    if (min.visitCount !== 2) throw new Error('Extract min failed');
});

test('Update bookmark visit count', () => {
    const heap = new MinHeap();
    heap.insert({ title: 'A', url: 'a', visitCount: 5 });
    heap.insert({ title: 'B', url: 'b', visitCount: 2 });
    heap.updateBookmark('a', 1);
    const min = heap.peek();
    if (min.url !== 'a') throw new Error('Update failed, min should be A');
});

test('Get least visited', () => {
    const heap = new MinHeap();
    heap.insert({ title: 'A', url: 'a', visitCount: 5 });
    heap.insert({ title: 'B', url: 'b', visitCount: 2 });
    heap.insert({ title: 'C', url: 'c', visitCount: 8 });
    const leastVisited = heap.getLeastVisited(2);
    if (leastVisited.length !== 2 || leastVisited[0].visitCount !== 2) {
        throw new Error('Get least visited failed');
    }
});

test('Delete bookmark', () => {
    const heap = new MinHeap();
    heap.insert({ title: 'A', url: 'a', visitCount: 5 });
    heap.insert({ title: 'B', url: 'b', visitCount: 2 });
    heap.delete('b');
    const min = heap.peek();
    if (min.url !== 'a') throw new Error('Delete failed');
});

console.log(`\n📊 SUMMARY`);
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%\n`);

process.exit(testsFailed > 0 ? 1 : 0);
