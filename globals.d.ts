// globals.d.ts
declare namespace chrome {
    // Declare the APIs you intend to use
    // Example:
    interface Runtime {
        // Add properties or methods you plan to use
        // For example:
        sendMessage(message: any, responseCallback?: (response: any) => void): void;
        // Add other methods or properties you require
    }
    // Declare other chrome.* APIs you intend to use in a similar manner
}
