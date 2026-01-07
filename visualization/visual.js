/**
 * DSA VISUALIZATION - INTERACTIVE VISUALIZATION LOGIC
 * Step-by-step visual exploration of each data structure
 */

// ============================================
// STATE MANAGEMENT
// ============================================

let currentDSA = 'hashtable';
let visualState = {
    hashtable: new HashTable(10),
    trie: new Trie(),
    linkedlist: new LinkedList(10),
    minheap: new MinHeap(),
    step: 0,
    history: []
};

// ============================================
// DSA SELECTOR
// ============================================

/**
 * Switch between DSA visualizations
 */
function selectDSA(dsa) {
    currentDSA = dsa;

    // Update button states
    document.querySelectorAll('.dsa-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update section visibility
    document.querySelectorAll('.dsa-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(dsa + '-section').classList.add('active');

    // Reset visualization state
    visualState.step = 0;
    visualState.history = [];
}

// ============================================
// HASH TABLE VISUALIZATION
// ============================================

let hashTableDemo = new HashTable(10);

/**
 * Initialize hash table visualization
 */
function initHashTable() {
    renderHashTableVisual();
}

/**
 * Render hash table visual
 */
function renderHashTableVisual() {
    const container = document.getElementById('hashSlots');
    container.innerHTML = '';

    for (let i = 0; i < hashTableDemo.size; i++) {
        const slot = document.createElement('div');
        slot.className = 'hash-slot empty';
        slot.innerHTML = `<span>-</span><div class="hash-slot-index">Index ${i}</div>`;

        // Check if slot has data
        if (hashTableDemo.table[i] !== null && hashTableDemo.table[i] !== undefined) {
            slot.classList.remove('empty');
            slot.classList.add('filled');
            slot.innerHTML = `
                <strong>${hashTableDemo.table[i].key.substring(0, 8)}</strong>
                <div class="hash-slot-index">Idx ${i}</div>
            `;
        }

        container.appendChild(slot);
    }
}

/**
 * Insert into hash table demo
 */
function hashTableInsert() {
    const input = document.getElementById('hashInput');
    const key = input.value.trim();

    if (!key) {
        updateHashStatus('Please enter a key!');
        return;
    }

    hashTableDemo.put(key, `Value-${key}`);
    renderHashTableVisual();
    updateHashStatus(`✅ Inserted "${key}" at index ${hashTableDemo.hash(key)}`);
    input.value = '';
}

/**
 * Search hash table demo
 */
function hashTableSearch() {
    const input = document.getElementById('hashInput');
    const key = input.value.trim();

    if (!key) {
        updateHashStatus('Please enter a key!');
        return;
    }

    const value = hashTableDemo.get(key);
    if (value) {
        updateHashStatus(`✅ Found "${key}" → "${value}"`);
    } else {
        updateHashStatus(`❌ Key "${key}" not found`);
    }
}

/**
 * Reset hash table demo
 */
function hashTableReset() {
    hashTableDemo = new HashTable(10);
    document.getElementById('hashInput').value = '';
    renderHashTableVisual();
    updateHashStatus('Hash table reset');
}

/**
 * Update hash table status message
 */
function updateHashStatus(message) {
    document.getElementById('hashStatus').textContent = message;
    document.getElementById('hashOps').textContent = hashTableDemo.getCount();
}

/**
 * Next step for hash table
 */
function hashTableNext() {
    updateHashStatus('Click Insert, Search, or Delete to see operations');
}

// ============================================
// TRIE VISUALIZATION
// ============================================

let trieDemo = new Trie();
let trieVisualizationData = [];

/**
 * Initialize trie visualization
 */
function initTrie() {
    renderTrieVisual();
}

/**
 * Render trie visual
 */
function renderTrieVisual() {
    const container = document.getElementById('trieVisual');

    if (trieDemo.getWordCount() === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #999;">
                <p>Insert words to visualize the trie structure</p>
                <p style="margin-top: 10px; font-size: 0.9em;">
                    Try: "car", "card", "care", "careful"
                </p>
            </div>
        `;
        return;
    }

    // Get all words from trie
    const words = trieDemo.getAllWords();
    container.innerHTML = `
        <div style="text-align: left; width: 100%;">
            <p style="margin-bottom: 15px; color: #666;">
                <strong>Words stored:</strong> ${words.map(w => w.word).join(', ')}
            </p>
            <div style="background: #f8f9ff; padding: 15px; border-radius: 6px;">
                <p><strong>Trie Structure (Root → Leaf):</strong></p>
                <p style="margin-top: 10px; color: #666; font-size: 0.95em; line-height: 1.8;">
                    Root
                    ${words.map(w => `<br/>→ ${w.word.split('').join(' → ')} (END)`).join('<br/>')}
                </p>
            </div>
        </div>
    `;

    document.getElementById('trieCount').textContent = trieDemo.getWordCount();
}

/**
 * Insert word into trie demo
 */
function trieInsert() {
    const input = document.getElementById('trieInput');
    const word = input.value.trim();

    if (!word) {
        updateTrieStatus('Please enter a word!');
        return;
    }

    if (!/^[a-z]+$/i.test(word)) {
        updateTrieStatus('Only alphabetic characters allowed!');
        return;
    }

    // Check if word already exists
    if (trieDemo.search(word)) {
        updateTrieStatus(`Word "${word}" already exists!`);
        input.value = '';
        return;
    }

    trieDemo.insert(word, `url-${word}`);
    renderTrieVisual();
    updateTrieStatus(`✅ Inserted "${word}"`);
    input.value = '';
}

/**
 * Search prefix in trie demo
 */
function trieSearch() {
    const input = document.getElementById('trieInput');
    const prefix = input.value.trim();

    if (!prefix) {
        updateTrieStatus('Please enter a prefix!');
        return;
    }

    const results = trieDemo.searchByPrefix(prefix);

    if (results.length === 0) {
        updateTrieStatus(`❌ No words found with prefix "${prefix}"`);
    } else {
        const matches = results.map(r => r.word).join(', ');
        updateTrieStatus(`✅ Found ${results.length} word(s): ${matches}`);
    }
}

/**
 * Reset trie demo
 */
function trieReset() {
    trieDemo = new Trie();
    document.getElementById('trieInput').value = '';
    renderTrieVisual();
    updateTrieStatus('Trie reset');
}

/**
 * Update trie status message
 */
function updateTrieStatus(message) {
    document.getElementById('trieStatus').textContent = message;
    document.getElementById('trieCount').textContent = trieDemo.getWordCount();
}

/**
 * Next step for trie
 */
function trieNext() {
    updateTrieStatus('Try these words: apple, app, apply, application');
}

// ============================================
// LINKED LIST VISUALIZATION
// ============================================

let llDemo = new LinkedList(10);

/**
 * Initialize linked list visualization
 */
function initLinkedList() {
    renderLinkedListVisual();
}

/**
 * Render linked list visual
 */
function renderLinkedListVisual() {
    const container = document.getElementById('llVisual');
    const items = llDemo.getAll();

    if (items.length === 0) {
        container.innerHTML = `
            <div style="width: 100%; text-align: center; color: #999;">
                <p>Insert values to build the linked list</p>
            </div>
        `;
        return;
    }

    let html = '';
    items.forEach((item, index) => {
        html += `
            <div class="ll-node ${index === 0 ? 'active' : ''}">
                <div class="ll-node-value">${item.title || item}</div>
                <div class="ll-node-pointer">Head: ${index === 0 ? 'Yes' : 'No'}</div>
            </div>
        `;

        if (index < items.length - 1) {
            html += `<div class="ll-arrow">→</div>`;
        }
    });

    html += `<div class="ll-arrow">→</div><div class="ll-null">null</div>`;
    container.innerHTML = html;

    document.getElementById('llSize').textContent = llDemo.getSize();
}

/**
 * Insert at front of linked list
 */
function llInsertFront() {
    const input = document.getElementById('llInput');
    const value = input.value.trim();

    if (!value) {
        updateLLStatus('Please enter a value!');
        return;
    }

    llDemo.insertAtBeginning({
        title: value,
        url: `http://${value}.com`,
        category: 'Demo',
        visitCount: Math.floor(Math.random() * 10),
        createdAt: Date.now()
    });

    renderLinkedListVisual();
    updateLLStatus(`✅ Inserted "${value}" at front`);
    input.value = '';
}

/**
 * Delete from linked list
 */
function llDelete() {
    const input = document.getElementById('llInput');
    const value = input.value.trim();

    if (!value) {
        updateLLStatus('Please enter a value to delete!');
        return;
    }

    const items = llDemo.getAll();
    const found = items.find(item => item.title === value);

    if (found && llDemo.delete(found.url)) {
        renderLinkedListVisual();
        updateLLStatus(`✅ Deleted "${value}"`);
        input.value = '';
    } else {
        updateLLStatus(`❌ "${value}" not found in list`);
    }
}

/**
 * Reset linked list demo
 */
function llReset() {
    llDemo = new LinkedList(10);
    document.getElementById('llInput').value = '';
    renderLinkedListVisual();
    updateLLStatus('Linked list reset');
}

/**
 * Update linked list status
 */
function updateLLStatus(message) {
    document.getElementById('llStatus').textContent = message;
    document.getElementById('llSize').textContent = llDemo.getSize();
}

/**
 * Next step for linked list
 */
function llNext() {
    updateLLStatus('Each new insert goes to the front (LIFO behavior)');
}

// ============================================
// MIN HEAP VISUALIZATION
// ============================================

let heapDemo = new MinHeap();

/**
 * Initialize min heap visualization
 */
function initHeap() {
    renderHeapVisual();
}

/**
 * Render min heap visual
 */
function renderHeapVisual() {
    const container = document.getElementById('heapVisual');
    const heap = heapDemo.heap;

    if (heap.length === 0) {
        container.innerHTML = `
            <div style="width: 100%; text-align: center; color: #999;">
                <p>Insert values to build the min heap</p>
            </div>
        `;
        return;
    }

    let html = heap
        .map((item, index) => {
            const isRoot = index === 0;
            return `
                <div class="heap-node ${isRoot ? 'active' : ''} ${index > 0 ? 'parent' : ''}">
                    ${item.visitCount}
                </div>
            `;
        })
        .join('');

    container.innerHTML = html;
    document.getElementById('heapSize').textContent = heapDemo.getSize();
}

/**
 * Insert into min heap demo
 */
function heapInsert() {
    const input = document.getElementById('heapInput');
    const value = parseInt(input.value);

    if (isNaN(value) || value < 1 || value > 100) {
        updateHeapStatus('Please enter a number between 1 and 100!');
        return;
    }

    heapDemo.insert({
        url: `http://bookmark${Math.random()}.com`,
        title: `Bookmark ${value}`,
        category: 'Demo',
        visitCount: value,
        createdAt: Date.now()
    });

    renderHeapVisual();
    updateHeapStatus(`✅ Inserted value ${value}`);
    input.value = '';
}

/**
 * Extract min from heap
 */
function heapExtractMin() {
    const min = heapDemo.extractMin();

    if (min) {
        renderHeapVisual();
        updateHeapStatus(`✅ Extracted minimum: ${min.visitCount}`);
    } else {
        updateHeapStatus('❌ Heap is empty!');
    }
}

/**
 * Reset heap demo
 */
function heapReset() {
    heapDemo = new MinHeap();
    document.getElementById('heapInput').value = '';
    renderHeapVisual();
    updateHeapStatus('Min heap reset');
}

/**
 * Update heap status
 */
function updateHeapStatus(message) {
    document.getElementById('heapStatus').textContent = message;
    document.getElementById('heapSize').textContent = heapDemo.getSize();
}

/**
 * Next step for heap
 */
function heapNext() {
    updateHeapStatus('Try inserting: 15, 10, 20, 25, 5 to see heap structure');
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initHashTable();
    initTrie();
    initLinkedList();
    initHeap();
});
