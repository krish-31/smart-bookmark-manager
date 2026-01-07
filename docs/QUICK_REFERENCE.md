╔════════════════════════════════════════════════════════════════════╗
║          QUICK REFERENCE - DSA OPERATIONS & TIME COMPLEXITY         ║
╚════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  HASH TABLE - Fast URL Lookup

    Operation               Time      Where Used
    ────────────────────────────────────────────────────
    Insert(url, bookmark)   O(1)      Add bookmark
    Get(url)                O(1)      Load bookmark data
    Delete(url)             O(1)      Remove bookmark
    Contains(url)           O(1)      Check if exists
    Keys() / Values()        O(n)      List all bookmarks
    
    Internal: Linear probing for collisions
    Load Factor Threshold: 75%
    
    Example:
    ┌─────────────────────────────────────┐
    │ Hash Table (10 slots)               │
    ├─────────────────────────────────────┤
    │ [0] github.com → GitHub             │
    │ [1] empty                           │
    │ [2] stackoverflow.com → StackOF     │
    │ ... (probing if collision)          │
    └─────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2️⃣  TRIE - Autocomplete Search

    Operation                   Time        Used For
    ────────────────────────────────────────────────────────
    Insert(title)               O(m)        Add title to trie
    Search(title)               O(m)        Find exact word
    SearchByPrefix(prefix)      O(m + k)    Autocomplete suggestions
    Delete(title)               O(m)        Remove from trie
    GetAllWords()               O(n)        List all words
    
    m = word/prefix length
    k = number of results
    n = total characters in trie
    
    Example (m = 3 for "car"):
    ┌──────────────────┐
    │ Root             │
    ├──────────────────┤
    │ └─ c             │ (1 step)
    │    └─ a          │ (2 steps)
    │       └─ r ✓     │ (3 steps = O(m))
    │          ├─ d ✓  │
    │          └─ e ✓  │
    └──────────────────┘
    
    Results from "car": car, card, care (k = 3)
    Total time: O(3 + 3) = O(m + k)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3️⃣  LINKED LIST - Recently Visited (LIFO)

    Operation                    Time    Behavior
    ────────────────────────────────────────────────────
    InsertAtBeginning(data)      O(1)    Add to front
    InsertAtEnd(data)            O(1)    Add to back
    RemoveFromFront()            O(1)    Remove head
    RemoveFromEnd()              O(n)    Remove tail (traverse)
    Search(value)                O(n)    Find element
    Delete(url)                  O(n)    Remove specific
    MoveToFront(url)             O(n)    Re-order if exists
    GetAll()                     O(n)    Get list copy
    
    Structure: HEAD → [Data|Next] → [Data|Next] → NULL
    Max Size: 20 nodes (oldest removed when exceeded)
    
    Example (visiting bookmarks):
    
    Initial:    NULL
    
    Visit GitHub:
    HEAD → [GitHub|ptr] → NULL
    
    Visit YouTube:
    HEAD → [YouTube|ptr] → [GitHub|ptr] → NULL
    
    Visit GitHub again (moveToFront):
    HEAD → [GitHub|ptr] → [YouTube|ptr] → NULL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4️⃣  MIN HEAP - Least Visited Bookmarks

    Operation                  Time       Use Case
    ────────────────────────────────────────────────────
    Insert(item, priority)     O(log n)   Add bookmark to track
    ExtractMin()               O(log n)   Get least visited
    Peek()                     O(1)       See min without removal
    Delete(index)              O(n)       Remove from tracking
    UpdateValue(item, newVal)  O(n)       Update visit count
    GetLeastVisited(k)         O(k log n) Get bottom k items
    
    Property: parent ≤ children (min at root)
    Array Representation:
    - Parent of i at index: (i-1)/2
    - Left child at index: 2*i+1
    - Right child at index: 2*i+2
    
    Example (visit counts):
    
    Array: [5, 10, 20, 30, 35, 25, 40]
    
    Tree:
           5 (MIN - least visited)
          / \
        10   20
       / \  / \
      30 35 25 40
    
    Extract min (5) → Reheapify → New min becomes 10

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 OPERATION COMPARISON MATRIX

Operation        │ Hash Table │ Trie      │ Link List │ Min Heap
─────────────────┼────────────┼───────────┼───────────┼──────────
Insert           │ O(1) ✓     │ O(m)      │ O(1)      │ O(log n)
Lookup exact     │ O(1) ✓     │ O(m)      │ O(n)      │ O(n)
Lookup prefix    │ ✗          │ O(m+k)✓   │ ✗         │ ✗
Update           │ O(1) ✓     │ O(m)      │ O(n)      │ O(n)
Delete           │ O(1) ✓     │ O(m)      │ O(n)      │ O(n)
Extract min      │ ✗          │ ✗         │ ✗         │ O(log n)✓
Space            │ O(n)       │ O(n*m)    │ O(n)      │ O(n)

Legend: ✓ = Optimal choice | ✗ = Not applicable

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 DATA FLOW IN APP

User Action              │ DSA Used              │ Operation
─────────────────────────┼───────────────────────┼─────────────────
Add bookmark             │ HT + Trie + Heap      │ Insert
Search by title          │ Trie                  │ searchByPrefix()
Visit bookmark           │ HT + LL + Heap        │ recordVisit()
Filter by category       │ HT                    │ values()
Show recent              │ LL                    │ getAll()
Show least used          │ Heap                  │ getLeastVisited()
Delete bookmark          │ HT + Trie + LL + Heap │ delete() all
View all bookmarks       │ HT                    │ values()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 KEY ALGORITHM PATTERNS

Hash Table Insertion (with collision handling):
    hash_index = hash(key) % table_size
    while table[hash_index] occupied:
        hash_index = (hash_index + 1) % table_size  ← linear probe
    table[hash_index] = value

Trie Prefix Search (with DFS):
    navigate to end of prefix
    if not found: return empty
    dfs(node) {
        if node.isEndOfWord: add to results
        for each child: dfs(child)
    }

Linked List Move To Front:
    find node in list        ← O(n)
    remove from current pos  ← update pointers
    insert at head           ← O(1)

Min Heap Heapify Up (after insert):
    while index > 0:
        parent = (index - 1) / 2
        if heap[index] < heap[parent]:
            swap(index, parent)
            index = parent
        else:
            break

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 WHEN TO USE EACH DSA

Hash Table:
  ✓ Need fast O(1) lookups by unique key
  ✓ Caching/Memoization
  ✓ Duplicate detection
  ✗ Need to maintain order
  ✗ Need prefix matching

Trie:
  ✓ Autocomplete / Prefix search
  ✓ IP routing (longest prefix match)
  ✓ Word dictionary
  ✗ Random access needed
  ✗ Memory-constrained (uses more space)

Linked List:
  ✓ Need efficient insertion/deletion at front
  ✓ Stack/Queue behavior
  ✓ LRU cache (doubly linked)
  ✗ Need random access
  ✗ Need efficient search

Min Heap:
  ✓ Priority queue
  ✓ Dijkstra's algorithm
  ✓ Heapsort
  ✓ Find k smallest/largest
  ✗ Need all elements sorted
  ✗ Need deletion by key (use hash + heap)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 PERFORMANCE WITH 100 BOOKMARKS

Operation               Time     Real Time (approx)
──────────────────────────────────────────────────────
Add bookmark            ~O(1)    ~2-3 ms
Search (autocomplete)   O(m)     <1 ms
Filter (sort)           O(n)     ~5-10 ms
Record visit            O(log n) ~1-2 ms
Load recently visited   O(n)     <1 ms
Get least used          O(k)     <1 ms
Delete bookmark         O(n)     ~2-5 ms

m = query length (typically 3-5)
n = 100 bookmarks
k = 5 results

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

C vs JavaScript Implementation

Aspect               │ JavaScript      │ C
─────────────────────┼─────────────────┼─────────────────────
Speed                │ ~100x slower    │ ~100x faster
Memory mgmt          │ Automatic (GC)  │ Manual (malloc/free)
Code complexity      │ Simple syntax   │ More verbose
Type safety          │ Weak typing     │ Strong typing
Development time     │ Faster          │ Slower
Compilation          │ Interpreted     │ Compiled to binary
Use case             │ Web app         │ Systems, embedded
Learning curve       │ Easier          │ Harder

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This reference card summarizes all 4 DSAs and their use in the
Intelligent Bookmark Manager application.

For detailed information, see README.md

Generated: December 2025
