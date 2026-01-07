/**
 * INTELLIGENT BOOKMARK MANAGER - MAIN APPLICATION LOGIC
 * 
 * Uses ES6 JavaScript with:
 * - Hash Table: Fast bookmark lookup by URL
 * - Trie: Autocomplete search by title
 * - Linked List: Recently visited bookmarks (LIFO)
 * - Min Heap: Track least frequently used bookmarks
 */

// ============================================
// GLOBAL STATE
// ============================================

let bookmarkHashTable = new HashTable(100); // URL -> Bookmark data
let titleTrie = new Trie(); // Title autocomplete
let recentBookmarks = new LinkedList(20); // Recently visited (max 20)
let leastUsedHeap = new MinHeap(); // Min heap by visit count

let allCategories = new Set(['Uncategorized']); // All available categories
let activeFilters = new Set(); // Currently active category filters
let currentSort = 'recent'; // Current sort method
const MAX_BOOKMARKS = 100; // Maximum bookmarks allowed

// ============================================
// DOM ELEMENTS
// ============================================

const bookmarkForm = document.getElementById('bookmarkForm');
const bookmarksList = document.getElementById('bookmarksList');
const searchInput = document.getElementById('searchInput');
const autocompleteDropdown = document.getElementById('autocompleteDropdown');
const recentList = document.getElementById('recentList');
const leastUsedList = document.getElementById('leastUsedList');
const categoryFilters = document.getElementById('categoryFilters');
const bookmarkCount = document.getElementById('bookmarkCount');
const formMessage = document.getElementById('formMessage');
const sortSelect = document.getElementById('sortSelect');
const categorySelect = document.getElementById('bookmarkCategory');
const newCategoryInput = document.getElementById('newCategory');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const clearSearchBtn = document.getElementById('clearSearchBtn');

// Statistics elements
const statTotal = document.getElementById('statTotal');
const statCategories = document.getElementById('statCategories');
const statRecent = document.getElementById('statRecent');
const statStorage = document.getElementById('statStorage');

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize app with sample data
 * Time Complexity: O(n * m) where n = bookmarks, m = avg title length
 */
function initializeApp() {
    // Load sample bookmarks
    const sampleBookmarks = [
        { title: 'GitHub', url: 'https://github.com', category: 'Development' },
        { title: 'Stack Overflow', url: 'https://stackoverflow.com', category: 'Development' },
        { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', category: 'Learning' },
        { title: 'YouTube', url: 'https://youtube.com', category: 'Entertainment' },
        { title: 'Twitter', url: 'https://twitter.com', category: 'Social' },
        { title: 'LinkedIn', url: 'https://linkedin.com', category: 'Professional' },
        { title: 'Medium', url: 'https://medium.com', category: 'Learning' },
        { title: 'Figma', url: 'https://figma.com', category: 'Design' },
    ];

    sampleBookmarks.forEach(bookmark => {
        addBookmarkInternal(bookmark.title, bookmark.url, bookmark.category, true);
    });

    // Simulate some visits to populate recent and least used lists
    for (let i = 0; i < Math.min(5, sampleBookmarks.length); i++) {
        const bm = sampleBookmarks[i];
        for (let j = 0; j < Math.random() * 5; j++) {
            recordBookmarkVisit(bm.url);
        }
    }

    updateUI();
    showMessage('App initialized with sample bookmarks!', 'info');
}

/**
 * Format timestamp for display
 * Time Complexity: O(1)
 */
function formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

// ============================================
// BOOKMARK MANAGEMENT
// ============================================

/**
 * Add bookmark to all data structures
 * Time Complexity: O(m) where m = title length (dominant factor in trie insert)
 */
function addBookmarkInternal(title, url, category, isInitializing = false) {
    // Validate inputs
    if (!title || !url || !category) {
        showMessage('All fields are required!', 'error');
        return false;
    }

    // Check if URL already exists
    if (bookmarkHashTable.contains(url)) {
        showMessage('Bookmark with this URL already exists!', 'error');
        return false;
    }

    // Check bookmark limit
    if (bookmarkHashTable.getCount() >= MAX_BOOKMARKS) {
        showMessage(`Bookmark limit (${MAX_BOOKMARKS}) reached!`, 'error');
        return false;
    }

    // Create bookmark object
    const bookmark = {
        title: title.trim(),
        url: url.trim(),
        category: category.trim(),
        visitCount: 0,
        createdAt: Date.now(),
        lastVisited: null
    };

    // Insert into Hash Table (for fast lookup by URL)
    bookmarkHashTable.put(url, bookmark);

    // Insert title into Trie (for autocomplete)
    titleTrie.insert(title, url);

    // Add to Min Heap (for least used tracking)
    leastUsedHeap.insert(bookmark);

    // Add category to set
    allCategories.add(category);

    // Update UI elements
    updateCategorySelect();
    updateCategoryFilters();

    if (!isInitializing) {
        showMessage('Bookmark added successfully!', 'success');
    }

    return true;
}

/**
 * Delete bookmark from all data structures
 * Time Complexity: O(m + n) where m = title length (trie), n = heap size
 */
function deleteBookmark(url) {
    const bookmark = bookmarkHashTable.get(url);
    if (!bookmark) return false;

    // Remove from Hash Table
    bookmarkHashTable.delete(url);

    // Remove from Trie
    titleTrie.delete(bookmark.title);

    // Remove from recent list
    recentBookmarks.delete(url);

    // Remove from min heap
    leastUsedHeap.delete(url);

    showMessage('Bookmark deleted!', 'success');
    return true;
}

/**
 * Record visit to bookmark
 * Updates visit count and adds to recent list
 * Time Complexity: O(log h) where h = heap size (heapify operation)
 */
function recordBookmarkVisit(url) {
    const bookmark = bookmarkHashTable.get(url);
    if (!bookmark) return;

    // Increment visit count
    bookmark.visitCount++;
    bookmark.lastVisited = Date.now();

    // Update in hash table
    bookmarkHashTable.put(url, bookmark);

    // Update in min heap
    leastUsedHeap.updateBookmark(url, bookmark.visitCount);

    // Add to recent visited list (moves to front if exists)
    if (recentBookmarks.contains(url)) {
        recentBookmarks.moveToFront(url);
    } else {
        recentBookmarks.insertAtBeginning(bookmark);
    }
}

// ============================================
// SEARCH & AUTOCOMPLETE
// ============================================

/**
 * Search bookmarks by title prefix using Trie
 * Time Complexity: O(m + k) where m = query length, k = results count
 */
function searchByPrefix(query) {
    if (query.length === 0) {
        autocompleteDropdown.classList.remove('active');
        return;
    }

    // Use Trie to find all titles starting with query
    const results = titleTrie.searchByPrefix(query);

    if (results.length === 0) {
        autocompleteDropdown.classList.remove('active');
        return;
    }

    // Display dropdown with results
    autocompleteDropdown.innerHTML = results
        .slice(0, 8) // Limit to 8 results
        .map(result => {
            const bm = bookmarkHashTable.get(result.bookmarkURL);
            return `
                <div class="autocomplete-item" onclick="selectBookmark('${result.bookmarkURL}')">
                    <strong>${result.word}</strong>
                    <div style="font-size: 0.8em; color: #999;">
                        📁 ${bm.category} • 👁️ ${bm.visitCount} visits
                    </div>
                </div>
            `;
        })
        .join('');

    autocompleteDropdown.classList.add('active');
}

/**
 * Select bookmark from autocomplete
 * Time Complexity: O(1)
 */
function selectBookmark(url) {
    const bookmark = bookmarkHashTable.get(url);
    if (bookmark) {
        recordBookmarkVisit(url);
        updateUI();
        autocompleteDropdown.classList.remove('active');
        searchInput.value = '';
        // Open bookmark in new tab
        window.open(url, '_blank');
    }
}

// ============================================
// FILTERING & SORTING
// ============================================

/**
 * Get filtered and sorted bookmarks
 * Time Complexity: O(n log n) for sorting
 */
function getFilteredAndSortedBookmarks() {
    const allBookmarks = bookmarkHashTable.values();

    // Apply category filters
    let filtered = allBookmarks;
    if (activeFilters.size > 0) {
        filtered = allBookmarks.filter(bm => activeFilters.has(bm.category));
    }

    // Apply sorting
    switch (currentSort) {
        case 'recent':
            filtered.sort((a, b) => (b.lastVisited || b.createdAt) - (a.lastVisited || a.createdAt));
            break;
        case 'name':
            filtered.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'visits':
            filtered.sort((a, b) => b.visitCount - a.visitCount);
            break;
    }

    return filtered;
}

/**
 * Toggle category filter
 * Time Complexity: O(n log n) (UI update triggers sort)
 */
function toggleCategoryFilter(category) {
    if (activeFilters.has(category)) {
        activeFilters.delete(category);
    } else {
        activeFilters.add(category);
    }
    updateUI();
}

// ============================================
// UI RENDERING
// ============================================

/**
 * Update category select dropdown
 * Time Complexity: O(k) where k = number of categories
 */
function updateCategorySelect() {
    const selected = categorySelect.value;
    categorySelect.innerHTML = '<option value="">Select or create category</option>';

    Array.from(allCategories)
        .sort()
        .forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });

    if (selected) {
        categorySelect.value = selected;
    }
}

/**
 * Update category filter buttons
 * Time Complexity: O(k) where k = number of categories
 */
function updateCategoryFilters() {
    categoryFilters.innerHTML = Array.from(allCategories)
        .sort()
        .map(cat => `
            <button 
                class="filter-btn ${activeFilters.has(cat) ? 'active' : ''}"
                onclick="toggleCategoryFilter('${cat}')"
            >
                ${cat}
            </button>
        `)
        .join('');
}

/**
 * Render all bookmarks
 * Time Complexity: O(n) where n = number of bookmarks
 */
function renderBookmarks() {
    const bookmarks = getFilteredAndSortedBookmarks();

    if (bookmarks.length === 0) {
        bookmarksList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">No bookmarks</div>
                <p>No bookmarks found. ${activeFilters.size > 0 ? 'Try changing filters.' : 'Add one to get started!'}</p>
            </div>
        `;
        return;
    }

    bookmarksList.innerHTML = bookmarks
        .map(bm => `
            <div class="bookmark-card">
                <div class="bookmark-title">${escapeHtml(bm.title)}</div>
                <a href="${bm.url}" class="bookmark-url" target="_blank">${bm.url}</a>
                <span class="bookmark-category">${bm.category}</span>
                
                <div class="bookmark-stats">
                    <div class="bookmark-stat">${bm.visitCount} visits</div>
                    <div class="bookmark-stat">${formatTime(bm.lastVisited || bm.createdAt)}</div>
                </div>
                
                <div class="bookmark-actions">
                    <button class="btn-visit" onclick="visitBookmark('${bm.url}')">
                        Open
                    </button>
                    <button class="btn-delete" onclick="deleteAndRefresh('${bm.url}')">
                        Delete
                    </button>
                </div>
            </div>
        `)
        .join('');
}

/**
 * Render recently visited bookmarks (from Linked List)
 * Time Complexity: O(m) where m = recent list size (max 20)
 */
function renderRecentBookmarks() {
    const recent = recentBookmarks.getAll();

    if (recent.length === 0) {
        recentList.innerHTML = `
            <div class="empty-state">
                <p>No recently visited bookmarks yet.</p>
            </div>
        `;
        return;
    }

    recentList.innerHTML = recent
        .map(bm => `
            <div class="recent-item">
                <div class="recent-item-info">
                    <div class="recent-item-title">${escapeHtml(bm.title)}</div>
                    <div class="recent-item-meta">
                        ${bm.category} • ${bm.visitCount} visits
                    </div>
                </div>
                <button class="btn-visit" onclick="visitBookmark('${bm.url}')">
                    Open
                </button>
            </div>
        `)
        .join('');
}

/**
 * Render least used bookmarks (from Min Heap)
 * Time Complexity: O(k log h) where k = results, h = heap size
 */
function renderLeastUsedBookmarks() {
    const leastUsed = leastUsedHeap.getLeastVisited(5);

    if (leastUsed.length === 0) {
        leastUsedList.innerHTML = `
            <div class="empty-state">
                <p>No bookmarks yet.</p>
            </div>
        `;
        return;
    }

    leastUsedList.innerHTML = leastUsed
        .map(bm => `
            <div class="least-item">
                <div class="recent-item-info">
                    <div class="recent-item-title">${escapeHtml(bm.title)}</div>
                    <div class="recent-item-meta">
                        ${bm.category}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.5em; font-weight: 700; color: #16a085;">
                        ${bm.visitCount}
                    </div>
                    <div style="font-size: 0.8em; color: #999;">visits</div>
                </div>
            </div>
        `)
        .join('');
}

/**
 * Update all statistics
 * Time Complexity: O(1) - all stored counters
 */
function updateStatistics() {
    statTotal.textContent = bookmarkHashTable.getCount();
    statCategories.textContent = allCategories.size;
    statRecent.textContent = recentBookmarks.getSize();
    const percentage = Math.round((bookmarkHashTable.getCount() / MAX_BOOKMARKS) * 100);
    statStorage.textContent = `${percentage}%`;
    bookmarkCount.textContent = `${bookmarkHashTable.getCount()}/${MAX_BOOKMARKS} bookmarks`;
}

/**
 * Master UI update function - calls all render functions
 * Time Complexity: O(n log n) dominated by sorting
 */
function updateUI() {
    renderBookmarks();
    renderRecentBookmarks();
    renderLeastUsedBookmarks();
    updateStatistics();
}

// ============================================
// EVENT HANDLERS
// ============================================

/**
 * Handle form submission
 */
bookmarkForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('bookmarkTitle').value;
    const url = document.getElementById('bookmarkURL').value;
    const category = document.getElementById('bookmarkCategory').value;

    if (addBookmarkInternal(title, url, category)) {
        bookmarkForm.reset();
        updateUI();
    }
});

/**
 * Handle search input with autocomplete
 * Time Complexity: O(m + k) per keystroke
 */
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    searchByPrefix(query);
});

/**
 * Close autocomplete when clicking outside
 */
document.addEventListener('click', (e) => {
    if (e.target !== searchInput && e.target !== autocompleteDropdown) {
        autocompleteDropdown.classList.remove('active');
    }
});

/**
 * Handle add category button
 */
addCategoryBtn.addEventListener('click', () => {
    const newCat = newCategoryInput.value.trim();
    if (newCat && !allCategories.has(newCat)) {
        allCategories.add(newCat);
        updateCategorySelect();
        updateCategoryFilters();
        newCategoryInput.value = '';
        categorySelect.value = newCat;
        showMessage(`Category "${newCat}" added!`, 'success');
    } else {
        showMessage('Category already exists or invalid name!', 'error');
    }
});

/**
 * Handle clear search
 */
clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    autocompleteDropdown.classList.remove('active');
    updateUI();
});

/**
 * Handle sort change
 */
sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    updateUI();
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Visit bookmark and record visit
 * Time Complexity: O(log h) where h = heap size
 */
function visitBookmark(url) {
    recordBookmarkVisit(url);
    updateUI();
    window.open(url, '_blank');
}

/**
 * Delete bookmark and refresh UI
 * Time Complexity: O(m + n + h)
 */
function deleteAndRefresh(url) {
    if (confirm('Are you sure you want to delete this bookmark?')) {
        deleteBookmark(url);
        updateUI();
    }
}

/**
 * Escape HTML special characters for XSS prevention
 * Time Complexity: O(n) where n = string length
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show temporary message to user
 * Time Complexity: O(1)
 */
function showMessage(text, type = 'info') {
    formMessage.textContent = text;
    formMessage.className = `message ${type}`;
    setTimeout(() => {
        formMessage.className = 'message';
    }, 4000);
}

// ============================================
// APP STARTUP
// ============================================

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', initializeApp);
