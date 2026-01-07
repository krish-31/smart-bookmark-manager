#!/usr/bin/env node

/**
 * Comprehensive Bookmark Manager Application Tests
 * Tests the main application logic without needing a browser
 */

// Load DSA implementations
const fs = require('fs');
const path = require('path');

// Create a mock DOM and global environment
global.document = {
    getElementById: function(id) {
        return {
            value: '',
            textContent: '',
            innerHTML: '',
            classList: { remove: () => {}, add: () => {}, contains: () => false },
            addEventListener: () => {},
            appendChild: () => {},
            className: ''
        };
    },
    addEventListener: () => {},
    createElement: (tag) => ({
        textContent: '',
        innerHTML: '',
        style: {}
    })
};

global.window = {
    open: () => {},
    addEventListener: () => {},
    Date: Date,
    location: {}
};

// Load DSA classes
const HashTableCode = fs.readFileSync(path.join(__dirname, 'dsa/hashTable.js'), 'utf-8');
const TrieCode = fs.readFileSync(path.join(__dirname, 'dsa/trie.js'), 'utf-8');
const LinkedListCode = fs.readFileSync(path.join(__dirname, 'dsa/linkedList.js'), 'utf-8');
const MinHeapCode = fs.readFileSync(path.join(__dirname, 'dsa/minHeap.js'), 'utf-8');

// Remove module.exports from code before eval
const cleanCode = (code) => code.replace(/if \(typeof module.*?\{[\s\S]*?\}/m, '');

eval(cleanCode(HashTableCode));
eval(cleanCode(TrieCode));
eval(cleanCode(LinkedListCode));
eval(cleanCode(MinHeapCode));

// Initialize data structures
let bookmarkHashTable = new HashTable(100);
let titleTrie = new Trie();
let recentBookmarks = new LinkedList(20);
let leastUsedHeap = new MinHeap();
let allCategories = new Set(['Uncategorized']);

const MAX_BOOKMARKS = 100;

// Test results tracking
let passed = 0;
let failed = 0;
const tests = [];

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        passed++;
        tests.push({ name, status: 'pass' });
    } catch (e) {
        console.log(`❌ ${name}: ${e.message}`);
        failed++;
        tests.push({ name, status: 'fail', error: e.message });
    }
}

function assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}. ${message}`);
    }
}

function assertTrue(value, message = '') {
    if (!value) {
        throw new Error(`Expected true, got ${value}. ${message}`);
    }
}

function assertFalse(value, message = '') {
    if (value) {
        throw new Error(`Expected false, got ${value}. ${message}`);
    }
}

// Helper function to add bookmark (mimics addBookmarkInternal)
function addBookmark(title, url, category) {
    if (!title || !url || !category) return false;
    if (bookmarkHashTable.contains(url)) return false;
    if (bookmarkHashTable.getCount() >= MAX_BOOKMARKS) return false;

    const bookmark = {
        title: title.trim(),
        url: url.trim(),
        category: category.trim(),
        visitCount: 0,
        createdAt: Date.now(),
        lastVisited: null
    };

    bookmarkHashTable.put(url, bookmark);
    titleTrie.insert(title, url);
    leastUsedHeap.insert(bookmark);
    allCategories.add(category);
    return true;
}

function recordVisit(url) {
    const bookmark = bookmarkHashTable.get(url);
    if (!bookmark) return false;

    bookmark.visitCount++;
    bookmark.lastVisited = Date.now();
    bookmarkHashTable.put(url, bookmark);
    leastUsedHeap.updateBookmark(url, bookmark.visitCount);
    
    if (recentBookmarks.contains(url)) {
        recentBookmarks.moveToFront(url);
    } else {
        recentBookmarks.insertAtBeginning(bookmark);
    }
    return true;
}

function deleteBookmark(url) {
    const bookmark = bookmarkHashTable.get(url);
    if (!bookmark) return false;

    bookmarkHashTable.delete(url);
    titleTrie.delete(bookmark.title);
    recentBookmarks.delete(url);
    leastUsedHeap.delete(url);
    return true;
}

console.log('\n🔖 BOOKMARK MANAGER APPLICATION TESTS\n');

// Feature 1: Adding Bookmarks
console.log('📌 Feature 1: Adding Bookmarks');
test('Add single bookmark', () => {
    const result = addBookmark('GitHub', 'https://github.com', 'Development');
    assertTrue(result);
    assertEqual(bookmarkHashTable.getCount(), 1);
});

test('Add multiple bookmarks', () => {
    bookmarkHashTable = new HashTable(100);
    titleTrie = new Trie();
    leastUsedHeap = new MinHeap();
    
    addBookmark('GitHub', 'https://github.com', 'Dev');
    addBookmark('Stack Overflow', 'https://stackoverflow.com', 'Dev');
    addBookmark('YouTube', 'https://youtube.com', 'Entertainment');
    
    assertEqual(bookmarkHashTable.getCount(), 3);
});

test('Prevent duplicate URL', () => {
    bookmarkHashTable = new HashTable(100);
    addBookmark('GitHub', 'https://github.com', 'Dev');
    const result = addBookmark('GitHub Copy', 'https://github.com', 'Dev');
    assertFalse(result);
});

test('Require all fields', () => {
    const result1 = addBookmark('', 'https://test.com', 'Test');
    const result2 = addBookmark('Test', '', 'Test');
    const result3 = addBookmark('Test', 'https://test.com', '');
    
    assertFalse(result1);
    assertFalse(result2);
    assertFalse(result3);
});

test('Respect bookmark limit', () => {
    bookmarkHashTable = new HashTable(5);
    for (let i = 0; i < MAX_BOOKMARKS + 5; i++) {
        addBookmark(`Bookmark${i}`, `https://test${i}.com`, 'Test');
    }
    assertEqual(bookmarkHashTable.getCount(), MAX_BOOKMARKS);
});

// Feature 2: Searching with Autocomplete (Trie)
console.log('\n🔍 Feature 2: Searching with Autocomplete (Trie)');
test('Trie autocomplete finds bookmarks', () => {
    bookmarkHashTable = new HashTable(100);
    titleTrie = new Trie();
    
    addBookmark('GitHub', 'https://github.com', 'Dev');
    addBookmark('GitLab', 'https://gitlab.com', 'Dev');
    addBookmark('Google', 'https://google.com', 'Search');
    
    const results = titleTrie.searchByPrefix('Git');
    assertEqual(results.length, 2, 'Should find GitHub and GitLab');
});

test('Autocomplete case insensitive', () => {
    bookmarkHashTable = new HashTable(100);
    titleTrie = new Trie();
    
    addBookmark('GitHub', 'https://github.com', 'Dev');
    
    const results1 = titleTrie.searchByPrefix('git');
    const results2 = titleTrie.searchByPrefix('GIT');
    const results3 = titleTrie.searchByPrefix('Git');
    
    assertTrue(results1.length > 0);
    assertTrue(results2.length > 0);
    assertTrue(results3.length > 0);
});

test('No results for non-matching prefix', () => {
    bookmarkHashTable = new HashTable(100);
    titleTrie = new Trie();
    
    addBookmark('GitHub', 'https://github.com', 'Dev');
    
    const results = titleTrie.searchByPrefix('xyz');
    assertEqual(results.length, 0);
});

test('Exact word search works', () => {
    bookmarkHashTable = new HashTable(100);
    titleTrie = new Trie();
    
    addBookmark('GitHub', 'https://github.com', 'Dev');
    
    assertTrue(titleTrie.search('github'));
    assertFalse(titleTrie.search('git'));
});

// Feature 3: Delete Bookmarks
console.log('\n🗑️  Feature 3: Delete Bookmarks');
test('Delete existing bookmark', () => {
    bookmarkHashTable = new HashTable(100);
    titleTrie = new Trie();
    leastUsedHeap = new MinHeap();
    recentBookmarks = new LinkedList(20);
    
    addBookmark('GitHub', 'https://github.com', 'Dev');
    const result = deleteBookmark('https://github.com');
    
    assertTrue(result);
    assertEqual(bookmarkHashTable.getCount(), 0);
});

test('Cannot delete non-existent bookmark', () => {
    bookmarkHashTable = new HashTable(100);
    const result = deleteBookmark('https://nonexistent.com');
    assertFalse(result);
});

test('Delete removes from all structures', () => {
    bookmarkHashTable = new HashTable(100);
    titleTrie = new Trie();
    leastUsedHeap = new MinHeap();
    recentBookmarks = new LinkedList(20);
    
    addBookmark('GitHub', 'https://github.com', 'Dev');
    deleteBookmark('https://github.com');
    
    assertFalse(bookmarkHashTable.contains('https://github.com'));
    assertFalse(titleTrie.search('github'));
    assertFalse(leastUsedHeap.contains('https://github.com'));
});

// Feature 4: Visit Tracking (Linked List)
console.log('\n📊 Feature 4: Visit Tracking (Recently Visited)');
test('Record visit updates count', () => {
    bookmarkHashTable = new HashTable(100);
    titleTrie = new Trie();
    leastUsedHeap = new MinHeap();
    recentBookmarks = new LinkedList(20);
    
    addBookmark('GitHub', 'https://github.com', 'Dev');
    recordVisit('https://github.com');
    
    const bm = bookmarkHashTable.get('https://github.com');
    assertEqual(bm.visitCount, 1);
});

test('Recent bookmarks tracks insertion order', () => {
    bookmarkHashTable = new HashTable(100);
    titleTrie = new Trie();
    leastUsedHeap = new MinHeap();
    recentBookmarks = new LinkedList(20);
    
    addBookmark('A', 'https://a.com', 'Test');
    addBookmark('B', 'https://b.com', 'Test');
    addBookmark('C', 'https://c.com', 'Test');
    
    recordVisit('https://a.com');
    recordVisit('https://b.com');
    recordVisit('https://c.com');
    
    const recent = recentBookmarks.getAll();
    assertEqual(recent[0].title, 'C', 'Most recent should be C');
});

test('Recent bookmarks moves visited to front', () => {
    bookmarkHashTable = new HashTable(100);
    titleTrie = new Trie();
    leastUsedHeap = new MinHeap();
    recentBookmarks = new LinkedList(20);
    
    addBookmark('A', 'https://a.com', 'Test');
    addBookmark('B', 'https://b.com', 'Test');
    
    recordVisit('https://a.com');
    recordVisit('https://b.com');
    recordVisit('https://a.com'); // Visit A again
    
    const recent = recentBookmarks.getAll();
    assertEqual(recent[0].title, 'A', 'A should be at front after second visit');
});

test('Recent bookmarks respects max size', () => {
    bookmarkHashTable = new HashTable(100);
    titleTrie = new Trie();
    leastUsedHeap = new MinHeap();
    recentBookmarks = new LinkedList(3); // Max 3
    
    for (let i = 1; i <= 5; i++) {
        addBookmark(`Bookmark${i}`, `https://test${i}.com`, 'Test');
        recordVisit(`https://test${i}.com`);
    }
    
    assertEqual(recentBookmarks.getSize(), 3);
});

// Feature 5: Least Used Analytics (Min Heap)
console.log('\n📈 Feature 5: Least Used Analytics (Min Heap)');
test('Min heap tracks least visited', () => {
    bookmarkHashTable = new HashTable(100);
    titleTrie = new Trie();
    leastUsedHeap = new MinHeap();
    recentBookmarks = new LinkedList(20);
    
    addBookmark('A', 'https://a.com', 'Test');
    addBookmark('B', 'https://b.com', 'Test');
    addBookmark('C', 'https://c.com', 'Test');
    
    recordVisit('https://a.com');
    recordVisit('https://a.com');
    recordVisit('https://a.com');
    recordVisit('https://b.com');
    // C has 0 visits
    
    const min = leastUsedHeap.peek();
    assertEqual(min.visitCount, 0, 'Should have minimum visit count');
});

test('Get least visited returns correct bookmarks', () => {
    bookmarkHashTable = new HashTable(100);
    titleTrie = new Trie();
    leastUsedHeap = new MinHeap();
    recentBookmarks = new LinkedList(20);
    
    addBookmark('A', 'https://a.com', 'Test');
    addBookmark('B', 'https://b.com', 'Test');
    addBookmark('C', 'https://c.com', 'Test');
    
    recordVisit('https://a.com');
    recordVisit('https://a.com');
    recordVisit('https://b.com');
    // C has 0 visits
    
    const leastUsed = leastUsedHeap.getLeastVisited(2);
    assertEqual(leastUsed.length, 2);
    assertEqual(leastUsed[0].visitCount, 0, 'First should have 0 visits');
    assertTrue(leastUsed[1].visitCount <= 1, 'Second should have <= 1 visits');
});

test('Min heap updates correctly', () => {
    bookmarkHashTable = new HashTable(100);
    titleTrie = new Trie();
    leastUsedHeap = new MinHeap();
    recentBookmarks = new LinkedList(20);
    
    addBookmark('A', 'https://a.com', 'Test');
    addBookmark('B', 'https://b.com', 'Test');
    
    recordVisit('https://b.com');
    recordVisit('https://b.com');
    recordVisit('https://a.com');
    recordVisit('https://a.com');
    recordVisit('https://a.com');
    recordVisit('https://a.com');
    
    const min = leastUsedHeap.peek();
    assertEqual(min.url, 'https://b.com', 'B should be minimum with 2 visits');
});

// Feature 6: Category Management
console.log('\n🏷️  Feature 6: Category Management');
test('Categories are tracked', () => {
    allCategories = new Set(['Uncategorized']);
    bookmarkHashTable = new HashTable(100);
    titleTrie = new Trie();
    leastUsedHeap = new MinHeap();
    
    addBookmark('GitHub', 'https://github.com', 'Development');
    addBookmark('YouTube', 'https://youtube.com', 'Entertainment');
    
    assertTrue(allCategories.has('Development'));
    assertTrue(allCategories.has('Entertainment'));
    assertTrue(allCategories.has('Uncategorized'));
});

test('Filtering by category works', () => {
    allCategories = new Set(['Uncategorized']);
    bookmarkHashTable = new HashTable(100);
    titleTrie = new Trie();
    leastUsedHeap = new MinHeap();
    
    addBookmark('GitHub', 'https://github.com', 'Development');
    addBookmark('YouTube', 'https://youtube.com', 'Entertainment');
    addBookmark('MDN', 'https://mdn.org', 'Learning');
    
    const allBms = bookmarkHashTable.values();
    const devBms = allBms.filter(b => b.category === 'Development');
    
    assertEqual(devBms.length, 1);
    assertEqual(devBms[0].title, 'GitHub');
});

// Feature 7: Combined Workflow
console.log('\n🔗 Feature 7: Combined Workflow');
test('Complete workflow: add, visit, delete', () => {
    bookmarkHashTable = new HashTable(100);
    titleTrie = new Trie();
    leastUsedHeap = new MinHeap();
    recentBookmarks = new LinkedList(20);
    
    // Add bookmarks
    addBookmark('GitHub', 'https://github.com', 'Dev');
    addBookmark('Google', 'https://google.com', 'Search');
    
    assertEqual(bookmarkHashTable.getCount(), 2);
    
    // Record visits
    recordVisit('https://github.com');
    recordVisit('https://github.com');
    recordVisit('https://google.com');
    
    // Check recent
    const recent = recentBookmarks.getAll();
    assertEqual(recent.length, 2);
    
    // Delete one
    deleteBookmark('https://google.com');
    assertEqual(bookmarkHashTable.getCount(), 1);
    
    // Search still works for remaining
    const searchResults = titleTrie.searchByPrefix('git');
    assertEqual(searchResults.length, 1);
});

test('Multiple operations integration', () => {
    bookmarkHashTable = new HashTable(100);
    titleTrie = new Trie();
    leastUsedHeap = new MinHeap();
    recentBookmarks = new LinkedList(20);
    
    const urls = [
        'https://github.com',
        'https://stackoverflow.com',
        'https://mdn.org',
        'https://youtube.com'
    ];
    
    urls.forEach((url, i) => {
        addBookmark(`Site${i}`, url, `Category${i % 2}`);
    });
    
    // Simulate visits
    recordVisit(urls[0]); // 1 visit
    recordVisit(urls[1]); // 1 visit
    recordVisit(urls[1]); // 2 visits
    recordVisit(urls[2]); // 1 visit
    // urls[3] has 0 visits
    
    // Check least used
    const least = leastUsedHeap.getLeastVisited(2);
    assertTrue(least[0].visitCount <= least[1].visitCount);
    
    // Delete and verify
    deleteBookmark(urls[0]);
    assertEqual(bookmarkHashTable.getCount(), 3);
    assertFalse(titleTrie.search('Site0'));
});

// Summary
console.log(`\n📊 TEST SUMMARY`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Total: ${passed + failed}`);
console.log(`🎯 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

if (failed > 0) {
    console.log('Failed tests:');
    tests.filter(t => t.status === 'fail').forEach(t => {
        console.log(`  - ${t.name}: ${t.error}`);
    });
}

process.exit(failed > 0 ? 1 : 0);
