// PingMe AI — Memory Support

const PINGME_MEMORY_KEY = "pingme_ai_memory";

// Get all saved memories
function getMemory() {
    try {
        const memory = localStorage.getItem(PINGME_MEMORY_KEY);
        return memory ? JSON.parse(memory) : [];
    } catch (error) {
        console.error("Failed to load memory:", error);
        return [];
    }
}

// Save memory list
function saveMemory(memory) {
    try {
        localStorage.setItem(
            PINGME_MEMORY_KEY,
            JSON.stringify(memory)
        );
    } catch (error) {
        console.error("Failed to save memory:", error);
    }
}

// Add a new memory
function addMemory(content, category = "general") {
    if (!content || !content.trim()) {
        return;
    }

    const memory = getMemory();

    memory.push({
        id: Date.now().toString(),
        content: content.trim(),
        category: category,
        timestamp: Date.now()
    });

    saveMemory(memory);
}

// Remove a specific memory
function removeMemory(memoryId) {
    const memory = getMemory();

    const updatedMemory = memory.filter(
        item => item.id !== memoryId
    );

    saveMemory(updatedMemory);
}

// Clear all memories
function clearMemory() {
    try {
        localStorage.removeItem(PINGME_MEMORY_KEY);
        console.log("Memory Cleared");
    } catch (error) {
        console.error("Failed to clear memory:", error);
    }
}

// Check whether memory is enabled
function isMemoryEnabled() {
    if (typeof getSetting === "function") {
        return getSetting("memory.enabled") !== false;
    }

    return true;
}

console.log("Memory Support Connected");