/**
 * LEGENDS OF KAI-JAX: THE MEMORY KING - EVENT BUS
 * The Communications Hub - All game-wide signals flow through here
 * No memory leaks. No spaghetti code. Pure decoupling.
 */

type Callback = (data?: any) => void;

export class EventBus {
    private events: { [key: string]: Callback[] } = {};

    /**
     * Subscribe to an event
     */
    on(event: string, callback: Callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    subscribe(event: string, callback: Callback) {
        this.on(event, callback);
    }

    /**
     * Emit an event to all subscribers
     */
    emit(event: string, data?: any) {
        if (this.events[event]) {
            this.events[event].forEach(cb => {
                try {
                    cb(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Unsubscribe from an event
     */
    off(event: string, callback: Callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    unsubscribe(event: string, callback: Callback) {
        this.off(event, callback);
    }

    /**
     * Remove all listeners for an event
     */
    clear(event: string) {
        if (this.events[event]) {
            delete this.events[event];
        }
    }

    /**
     * Remove all listeners
     */
    clearAll() {
        this.events = {};
    }
}

// Singleton instance - THE ONE TRUE BUS
export const bus = new EventBus();
