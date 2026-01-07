/**
 * Min Heap Implementation in C
 * Complete binary tree where parent <= children
 * 
 * Compile: gcc -o min_heap min_heap.c -lm
 * Run: ./min_heap
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

#define MAX_HEAP_SIZE 100

/**
 * Item in heap (with value and label)
 */
typedef struct {
    int value;
    char label[256];
} HeapItem;

/**
 * Min Heap structure
 */
typedef struct {
    HeapItem *items;
    int size;
    int capacity;
} MinHeap;

/**
 * Helper function: get parent index
 */
int get_parent(int index) {
    return (index - 1) / 2;
}

/**
 * Helper function: get left child index
 */
int get_left_child(int index) {
    return 2 * index + 1;
}

/**
 * Helper function: get right child index
 */
int get_right_child(int index) {
    return 2 * index + 2;
}

/**
 * Swap two elements in heap
 */
void swap_items(HeapItem *a, HeapItem *b) {
    HeapItem temp = *a;
    *a = *b;
    *b = temp;
}

/**
 * Create new min heap
 * Time Complexity: O(1)
 */
MinHeap *min_heap_create(int capacity) {
    MinHeap *heap = (MinHeap *)malloc(sizeof(MinHeap));
    heap->items = (HeapItem *)malloc(capacity * sizeof(HeapItem));
    heap->size = 0;
    heap->capacity = capacity;
    return heap;
}

/**
 * Move element up to maintain min heap property
 * Time Complexity: O(log n)
 */
void heapify_up(MinHeap *heap, int index) {
    while (index > 0) {
        int parent_index = get_parent(index);
        
        if (heap->items[parent_index].value > heap->items[index].value) {
            swap_items(&heap->items[parent_index], &heap->items[index]);
            index = parent_index;
        } else {
            break;
        }
    }
}

/**
 * Move element down to maintain min heap property
 * Time Complexity: O(log n)
 */
void heapify_down(MinHeap *heap, int index) {
    while (1) {
        int min_index = index;
        int left_child = get_left_child(index);
        int right_child = get_right_child(index);
        
        // Check left child
        if (left_child < heap->size && 
            heap->items[left_child].value < heap->items[min_index].value) {
            min_index = left_child;
        }
        
        // Check right child
        if (right_child < heap->size && 
            heap->items[right_child].value < heap->items[min_index].value) {
            min_index = right_child;
        }
        
        // If min is not current, swap and continue
        if (min_index != index) {
            swap_items(&heap->items[index], &heap->items[min_index]);
            index = min_index;
        } else {
            break;
        }
    }
}

/**
 * Insert element into min heap
 * Time Complexity: O(log n)
 */
int min_heap_insert(MinHeap *heap, int value, const char *label) {
    if (heap->size >= heap->capacity) {
        printf("Heap is full!\n");
        return 0;
    }
    
    // Add new element at end
    heap->items[heap->size].value = value;
    if (label) {
        strncpy(heap->items[heap->size].label, label, 255);
    }
    
    // Move up to maintain heap property
    heapify_up(heap, heap->size);
    heap->size++;
    
    return 1;
}

/**
 * Get minimum element without removing
 * Time Complexity: O(1)
 */
int min_heap_peek(MinHeap *heap, HeapItem *out) {
    if (heap->size == 0) return 0;
    *out = heap->items[0];
    return 1;
}

/**
 * Extract and remove minimum element
 * Time Complexity: O(log n)
 */
int min_heap_extract_min(MinHeap *heap, HeapItem *out) {
    if (heap->size == 0) return 0;
    
    *out = heap->items[0];
    
    // Move last element to root
    heap->items[0] = heap->items[heap->size - 1];
    heap->size--;
    
    // Restore heap property if not empty
    if (heap->size > 0) {
        heapify_down(heap, 0);
    }
    
    return 1;
}

/**
 * Delete element at specific index
 * Time Complexity: O(log n)
 */
int min_heap_delete(MinHeap *heap, int index) {
    if (index < 0 || index >= heap->size) return 0;
    
    // Move last element to deleted position
    heap->items[index] = heap->items[heap->size - 1];
    heap->size--;
    
    // Restore heap property if not last element
    if (index < heap->size) {
        if (index > 0 && heap->items[index].value < 
            heap->items[get_parent(index)].value) {
            heapify_up(heap, index);
        } else {
            heapify_down(heap, index);
        }
    }
    
    return 1;
}

/**
 * Print heap as tree structure
 * Time Complexity: O(n)
 */
void min_heap_print(MinHeap *heap) {
    printf("\n=== Min Heap Contents ===\n");
    
    if (heap->size == 0) {
        printf("Heap is empty\n\n");
        return;
    }
    
    printf("Heap array (level-order):\n");
    for (int i = 0; i < heap->size; i++) {
        printf("[%d] Value: %d", i, heap->items[i].value);
        if (heap->items[i].label[0] != '\0') {
            printf(" (Label: %s)", heap->items[i].label);
        }
        if (i == 0) printf(" ← MIN (Root)");
        printf("\n");
    }
    
    // Print as tree with levels
    printf("\nHeap tree structure:\n");
    int level_size = 1;
    int level_count = 0;
    int index = 0;
    
    while (index < heap->size) {
        for (int i = 0; i < level_size && index < heap->size; i++) {
            printf("%d ", heap->items[index].value);
            index++;
        }
        printf("\n");
        level_size *= 2;
        level_count++;
    }
    
    printf("Size: %d / Capacity: %d\n\n", heap->size, heap->capacity);
}

/**
 * Get all elements sorted (doesn't modify heap)
 * Time Complexity: O(n log n)
 */
void min_heap_print_sorted(MinHeap *heap) {
    printf("\nElements in sorted order (min to max):\n");
    
    if (heap->size == 0) {
        printf("Heap is empty\n");
        return;
    }
    
    // Create temporary copy
    MinHeap *temp = min_heap_create(heap->capacity);
    for (int i = 0; i < heap->size; i++) {
        temp->items[i] = heap->items[i];
    }
    temp->size = heap->size;
    
    printf("[ ");
    while (temp->size > 0) {
        HeapItem min;
        min_heap_extract_min(temp, &min);
        printf("%d ", min.value);
    }
    printf("]\n\n");
    
    free(temp->items);
    free(temp);
}

/**
 * Free heap memory
 */
void min_heap_free(MinHeap *heap) {
    free(heap->items);
    free(heap);
}

/**
 * Demonstration program
 */
int main() {
    printf("=== Min Heap Implementation in C ===\n");
    printf("Data Structure: Min Heap (Complete Binary Tree)\n");
    printf("Operations: Insert O(log n), Extract Min O(log n), Peek O(1)\n\n");
    
    MinHeap *heap = min_heap_create(MAX_HEAP_SIZE);
    
    // Insert elements
    printf("--- Inserting elements ---\n");
    int values[] = {50, 30, 70, 15, 10, 20, 25, 35, 5};
    int count = sizeof(values) / sizeof(values[0]);
    
    for (int i = 0; i < count; i++) {
        min_heap_insert(heap, values[i], "");
        printf("Inserted: %d\n", values[i]);
    }
    
    min_heap_print(heap);
    
    // Peek at minimum
    printf("--- Peeking at minimum ---\n");
    HeapItem min;
    if (min_heap_peek(heap, &min)) {
        printf("Minimum element: %d\n\n", min.value);
    }
    
    // Extract min multiple times
    printf("--- Extracting minimum (5 times) ---\n");
    for (int i = 0; i < 5; i++) {
        if (min_heap_extract_min(heap, &min)) {
            printf("Extracted: %d\n", min.value);
        }
    }
    
    min_heap_print(heap);
    
    // Insert more elements
    printf("--- Inserting more elements ---\n");
    int new_values[] = {8, 22, 3};
    for (int i = 0; i < 3; i++) {
        min_heap_insert(heap, new_values[i], "");
        printf("Inserted: %d\n", new_values[i]);
    }
    
    min_heap_print(heap);
    
    // Print sorted
    min_heap_print_sorted(heap);
    
    // Delete element at specific index
    printf("--- Deleting element at index 1 ---\n");
    if (min_heap_delete(heap, 1)) {
        printf("✓ Deleted element at index 1\n");
    }
    
    min_heap_print(heap);
    
    // Cleanup
    min_heap_free(heap);
    printf("Min heap freed.\n");
    
    return 0;
}
