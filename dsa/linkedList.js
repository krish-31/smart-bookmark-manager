/**
 * Singly Linked List Implementation
 * Used to store recently visited bookmarks (newest first - stack behavior)
 * 
 * Each node stores: bookmark data + timestamp
 * Maximum capacity: configurable
 */

class LinkedListNode {
    constructor(bookmarkData) {
        this.data = bookmarkData; // {url, title, category, visitCount, timestamp}
        this.next = null;
    }
}

class LinkedList {
    constructor(maxSize = 20) {
        this.head = null;
        this.tail = null;
        this.size = 0;
        this.maxSize = maxSize; // Maximum number of recent items to keep
    }

    /**
     * Insert bookmark at the beginning (most recent)
     * Time Complexity: O(1)
     */
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

        // Remove oldest if exceeds max size
        if (this.size > this.maxSize) {
            this.removeFromEnd();
        }
    }

    /**
     * Move bookmark to front (mark as recently accessed)
     * Time Complexity: O(n) - needs to find node
     */
    moveToFront(bookmarkURL) {
        let current = this.head;
        let prev = null;

        // Find the node
        while (current !== null) {
            if (current.data.url === bookmarkURL) {
                // Remove from current position
                if (prev !== null) {
                    prev.next = current.next;
                } else {
                    this.head = current.next;
                }

                if (current === this.tail) {
                    this.tail = prev;
                }

                this.size--;

                // Insert at beginning
                this.insertAtBeginning(current.data);
                return true;
            }
            prev = current;
            current = current.next;
        }
        return false;
    }

    /**
     * Remove from end (oldest bookmark)
     * Time Complexity: O(n) - single linked list
     */
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

    /**
     * Get all bookmarks in order (newest first)
     * Time Complexity: O(n)
     */
    getAll() {
        const result = [];
        let current = this.head;

        while (current !== null) {
            result.push(current.data);
            current = current.next;
        }

        return result;
    }

    /**
     * Check if bookmark exists in list
     * Time Complexity: O(n)
     */
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

    /**
     * Delete specific bookmark by URL
     * Time Complexity: O(n)
     */
    delete(bookmarkURL) {
        if (this.head === null) return false;

        // If head needs to be deleted
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

    /**
     * Clear all nodes
     * Time Complexity: O(1) - just reset pointers
     */
    clear() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    /**
     * Get list size
     */
    getSize() {
        return this.size;
    }

    /**
     * Get maximum capacity
     */
    getMaxSize() {
        return this.maxSize;
    }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LinkedList;
}
