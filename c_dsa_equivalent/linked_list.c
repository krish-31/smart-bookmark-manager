/**
 * BookmarkHub - Singly Linked List Implementation in C
 * Sequential data structure with dynamic allocation for bookmarks
 * 
 * Compile: gcc -o linked_list linked_list.c
 * Run: ./linked_list
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/**
 * Node structure for linked list
 */
typedef struct Node {
    int value;
    char website_name[256];
    char data[256];
    struct Node *next;
} Node;

/**
 * Linked List structure
 */
typedef struct {
    Node *head;
    Node *tail;
    int size;
    int max_size;
} LinkedList;

/**
 * Create new node
 * Time Complexity: O(1)
 */
Node *node_create(int value, const char *website_name, const char *data) {
    Node *node = (Node *)malloc(sizeof(Node));
    node->value = value;
    
    if (website_name) {
        strncpy(node->website_name, website_name, 255);
    } else {
        node->website_name[0] = '\0';
    }
    
    if (data) {
        strncpy(node->data, data, 255);
    } else {
        node->data[0] = '\0';
    }
    
    node->next = NULL;
    return node;
}

/**
 * Create new linked list
 * Time Complexity: O(1)
 */
LinkedList *linked_list_create(int max_size) {
    LinkedList *list = (LinkedList *)malloc(sizeof(LinkedList));
    list->head = NULL;
    list->tail = NULL;
    list->size = 0;
    list->max_size = max_size;
    return list;
}

/**
 * Insert node at beginning (front)
 * Time Complexity: O(1)
 */
void linked_list_insert_front(LinkedList *list, int value, const char *website_name, const char *data) {
    Node *new_node = node_create(value, website_name, data);
    
    if (list->head == NULL) {
        list->head = new_node;
        list->tail = new_node;
    } else {
        new_node->next = list->head;
        list->head = new_node;
    }
    
    list->size++;
    
    // Remove oldest if exceeds max size
    if (list->size > list->max_size) {
        linked_list_remove_end(list);
    }
}

/**
 * Insert node at end
 * Time Complexity: O(1)
 */
void linked_list_insert_end(LinkedList *list, int value, const char *website_name, const char *data) {
    Node *new_node = node_create(value, website_name, data);
    
    if (list->head == NULL) {
        list->head = new_node;
        list->tail = new_node;
    } else {
        list->tail->next = new_node;
        list->tail = new_node;
    }
    
    list->size++;
}

/**
 * Remove node from end
 * Time Complexity: O(n) for singly linked list
 */
int linked_list_remove_end(LinkedList *list) {
    if (list->head == NULL) return 0;
    
    if (list->head == list->tail) {
        int value = list->head->value;
        free(list->head);
        list->head = NULL;
        list->tail = NULL;
        list->size--;
        return value;
    }
    
    // Find second-to-last node
    Node *current = list->head;
    while (current->next != list->tail) {
        current = current->next;
    }
    
    int value = list->tail->value;
    free(list->tail);
    current->next = NULL;
    list->tail = current;
    list->size--;
    
    return value;
}

/**
 * Remove node from front
 * Time Complexity: O(1)
 */
int linked_list_remove_front(LinkedList *list) {
    if (list->head == NULL) return -1;
    
    Node *temp = list->head;
    int value = temp->value;
    list->head = temp->next;
    
    if (list->head == NULL) {
        list->tail = NULL;
    }
    
    free(temp);
    list->size--;
    
    return value;
}

/**
 * Search for value in list
 * Time Complexity: O(n)
 */
int linked_list_search(LinkedList *list, int value) {
    Node *current = list->head;
    
    while (current != NULL) {
        if (current->value == value) {
            return 1;  // Found
        }
        current = current->next;
    }
    
    return 0;  // Not found
}

/**
 * Delete specific value from list
 * Time Complexity: O(n)
 */
int linked_list_delete(LinkedList *list, int value) {
    if (list->head == NULL) return 0;
    
    // If head needs to be deleted
    if (list->head->value == value) {
        return linked_list_remove_front(list) != -1;
    }
    
    Node *current = list->head;
    Node *prev = NULL;
    
    while (current != NULL) {
        if (current->value == value) {
            prev->next = current->next;
            
            if (current == list->tail) {
                list->tail = prev;
            }
            
            free(current);
            list->size--;
            return 1;
        }
        
        prev = current;
        current = current->next;
    }
    
    return 0;
}

/**
 * Get value at position (0-indexed)
 * Time Complexity: O(n)
 */
int linked_list_get_at(LinkedList *list, int position, char *data_out) {
    if (position < 0 || position >= list->size) return -1;
    
    Node *current = list->head;
    for (int i = 0; i < position; i++) {
        current = current->next;
    }
    
    if (data_out && current->data[0] != '\0') {
        strcpy(data_out, current->data);
    }
    
    return current->value;
}

/**
 * Clear entire list
 * Time Complexity: O(n)
 */
void linked_list_clear(LinkedList *list) {
    Node *current = list->head;
    
    while (current != NULL) {
        Node *temp = current;
        current = current->next;
        free(temp);
    }
    
    list->head = NULL;
    list->tail = NULL;
    list->size = 0;
}

/**
 * Print all nodes
 * Time Complexity: O(n)
 */
void linked_list_print(LinkedList *list) {
    printf("\n=== BookmarkHub - Linked List Contents ===\n");
    
    if (list->head == NULL) {
        printf("List is empty\n\n");
        return;
    }
    
    Node *current = list->head;
    int position = 0;
    
    while (current != NULL) {
        printf("[%d] Value: %d", position, current->value);
        if (current->website_name[0] != '\0') {
            printf(" | Website: %s", current->website_name);
        }
        if (current->data[0] != '\0') {
            printf(" | Data: %s", current->data);
        }
        printf(" %s\n", (current == list->head) ? " ← HEAD" : (current == list->tail) ? " ← TAIL" : "");
        
        current = current->next;
        position++;
    }
    
    printf("→ NULL\n");
    printf("Size: %d / Max: %d\n\n", list->size, list->max_size);
}

/**
 * Free linked list memory
 * Time Complexity: O(n)
 */
void linked_list_free(LinkedList *list) {
    linked_list_clear(list);
    free(list);
}

/**
 * Demonstration program
 */
int main() {
    printf("=== BookmarkHub - Singly Linked List Implementation in C ===\n");
    printf("Data Structure: Linked List for bookmark storage\n");
    printf("Operations: Insert O(1), Search O(n), Delete O(n)\n\n");
    
    LinkedList *list = linked_list_create(20);
    
    // Insert at end
    printf("--- Inserting bookmarks at end ---\n");
    linked_list_insert_end(list, 10, "Google", "https://google.com");
    linked_list_insert_end(list, 20, "GitHub", "https://github.com");
    linked_list_insert_end(list, 30, "Stack Overflow", "https://stackoverflow.com");
    linked_list_insert_end(list, 40, "MDN Docs", "https://developer.mozilla.org");
    printf("Inserted 4 bookmarks\n");
    
    linked_list_print(list);
    
    // Insert at front
    printf("--- Inserting bookmarks at front ---\n");
    linked_list_insert_front(list, 5, "YouTube", "https://youtube.com");
    linked_list_insert_front(list, 1, "Reddit", "https://reddit.com");
    printf("Inserted 2 bookmarks at front\n");
    
    linked_list_print(list);
    
    // Search
    printf("--- Searching ---\n");
    if (linked_list_search(list, 20)) {
        printf("✓ Found value 20\n");
    } else {
        printf("✗ Value 20 not found\n");
    }
    
    if (linked_list_search(list, 99)) {
        printf("✓ Found value 99\n");
    } else {
        printf("✗ Value 99 not found\n");
    }
    
    // Get at position
    printf("\n--- Getting bookmark by position ---\n");
    char data_buffer[256];
    int value = linked_list_get_at(list, 0, data_buffer);
    printf("Position 0: Value=%d, Data=%s\n", value, data_buffer);
    
    value = linked_list_get_at(list, 2, data_buffer);
    printf("Position 2: Value=%d, Data=%s\n", value, data_buffer);
    
    // Delete
    printf("\n--- Deleting bookmark ---\n");
    if (linked_list_delete(list, 20)) {
        printf("✓ Deleted bookmark with value 20\n");
    }
    
    linked_list_print(list);
    
    // Remove from front
    printf("--- Removing bookmark from front ---\n");
    int removed = linked_list_remove_front(list);
    printf("Removed bookmark from front: %d\n", removed);
    
    linked_list_print(list);
    
    // Remove from end
    printf("--- Removing bookmark from end ---\n");
    removed = linked_list_remove_end(list);
    printf("Removed bookmark from end: %d\n", removed);
    
    linked_list_print(list);
    
    // Cleanup
    linked_list_free(list);
    printf("Linked list freed.\n");
    
    return 0;
}
