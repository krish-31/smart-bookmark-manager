/**
 * Min Heap Implementation
 * Used to track least frequently used (LFU) bookmarks
 * 
 * Root element is always the minimum (least visited bookmark)
 * Useful for eviction strategies and analytics
 */

class MinHeap {
    constructor() {
        this.heap = [];
    }

    /**
     * Get parent index
     */
    getParentIndex(index) {
        return Math.floor((index - 1) / 2);
    }

    /**
     * Get left child index
     */
    getLeftChildIndex(index) {
        return 2 * index + 1;
    }

    /**
     * Get right child index
     */
    getRightChildIndex(index) {
        return 2 * index + 2;
    }

    /**
     * Swap two elements in heap
     */
    swap(index1, index2) {
        [this.heap[index1], this.heap[index2]] = [this.heap[index2], this.heap[index1]];
    }

    /**
     * Insert bookmark into min heap based on visit count
     * Time Complexity: O(log n)
     */
    insert(bookmarkData) {
        this.heap.push(bookmarkData);
        this.heapifyUp(this.heap.length - 1);
    }

    /**
     * Move element up to maintain min heap property
     * Time Complexity: O(log n)
     */
    heapifyUp(index) {
        while (index > 0) {
            const parentIndex = this.getParentIndex(index);

            // If parent's visitCount > current's visitCount, swap
            if (this.heap[parentIndex].visitCount > this.heap[index].visitCount) {
                this.swap(parentIndex, index);
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    /**
     * Remove and return minimum element (least visited bookmark)
     * Time Complexity: O(log n)
     */
    extractMin() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.heapifyDown(0);
        return min;
    }

    /**
     * Move element down to maintain min heap property
     * Time Complexity: O(log n)
     */
    heapifyDown(index) {
        while (true) {
            let minIndex = index;
            const leftChildIndex = this.getLeftChildIndex(index);
            const rightChildIndex = this.getRightChildIndex(index);

            // Check left child
            if (
                leftChildIndex < this.heap.length &&
                this.heap[leftChildIndex].visitCount < this.heap[minIndex].visitCount
            ) {
                minIndex = leftChildIndex;
            }

            // Check right child
            if (
                rightChildIndex < this.heap.length &&
                this.heap[rightChildIndex].visitCount < this.heap[minIndex].visitCount
            ) {
                minIndex = rightChildIndex;
            }

            // If min is not current, swap and continue
            if (minIndex !== index) {
                this.swap(index, minIndex);
                index = minIndex;
            } else {
                break;
            }
        }
    }

    /**
     * Get minimum element without removing
     * Time Complexity: O(1)
     */
    peek() {
        return this.heap.length > 0 ? this.heap[0] : null;
    }

    /**
     * Update a bookmark's visit count and re-heapify
     * Time Complexity: O(n) in worst case, but typically faster
     */
    updateBookmark(bookmarkURL, newVisitCount) {
        let index = -1;

        // Find bookmark index
        for (let i = 0; i < this.heap.length; i++) {
            if (this.heap[i].url === bookmarkURL) {
                index = i;
                break;
            }
        }

        if (index === -1) return false; // Not found

        const oldCount = this.heap[index].visitCount;
        this.heap[index].visitCount = newVisitCount;

        // Re-heapify based on whether count increased or decreased
        if (newVisitCount < oldCount) {
            this.heapifyUp(index);
        } else if (newVisitCount > oldCount) {
            this.heapifyDown(index);
        }

        return true;
    }

    /**
     * Get all bookmarks sorted by visit count (ascending)
     * Time Complexity: O(n log n) due to repeated extractMin
     */
    getAllSorted() {
        const sorted = [];
        const tempHeap = [...this.heap]; // Make copy

        while (this.heap.length > 0) {
            sorted.push(this.extractMin());
        }

        // Restore original heap
        this.heap = tempHeap;
        return sorted;
    }

    /**
     * Get all elements without sorting
     * Time Complexity: O(n)
     */
    getAll() {
        return [...this.heap];
    }

    /**
     * Check if bookmark exists
     * Time Complexity: O(n)
     */
    contains(bookmarkURL) {
        return this.heap.some(bookmark => bookmark.url === bookmarkURL);
    }

    /**
     * Delete bookmark by URL and re-heapify
     * Time Complexity: O(n)
     */
    delete(bookmarkURL) {
        const index = this.heap.findIndex(item => item.url === bookmarkURL);
        if (index === -1) return false;

        // Move last element to deleted position
        this.heap[index] = this.heap.pop();

        // Re-heapify if not the last element
        if (index < this.heap.length) {
            this.heapifyUp(index);
            this.heapifyDown(index);
        }

        return true;
    }

    /**
     * Get heap size
     */
    getSize() {
        return this.heap.length;
    }

    /**
     * Clear heap
     */
    clear() {
        this.heap = [];
    }

    /**
     * Get least visited bookmarks (bottom of heap)
     * Time Complexity: O(k) where k = count
     */
    getLeastVisited(count = 5) {
        return this.getAllSorted().slice(0, count);
    }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MinHeap;
}
