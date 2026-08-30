/**
 * Service to handle real-time notifications via Server-Sent Events (SSE)
 */
class NotificationService {
    constructor() {
        this.eventSource = null;
        this.listeners = new Set();
    }

    /**
     * Connect to the SSE endpoint for a specific user
     * @param {number|string} userId 
     * @param {function} onNotification - Callback for new notifications
     */
    connect(userId, onNotification) {
        if (this.eventSource) {
            this.disconnect();
        }

        const url = `http://localhost:8082/api/notifications/stream/${userId}`;
        console.log(`Connecting to notification stream: ${url}`);
        
        this.eventSource = new EventSource(url);

        this.eventSource.onmessage = (event) => {
            try {
                const notification = JSON.parse(event.data);
                console.log('Received notification:', notification);
                onNotification(notification);
            } catch (err) {
                console.error('Error parsing notification data:', err);
            }
        };

        this.eventSource.onerror = (err) => {
            console.error('EventSource failed:', err);
            // Browser will usually attempt to reconnect automatically
        };
    }

    /**
     * Close the SSE connection
     */
    disconnect() {
        if (this.eventSource) {
            console.log('Disconnecting from notification stream');
            this.eventSource.close();
            this.eventSource = null;
        }
    }
}

const notificationService = new NotificationService();
export default notificationService;
