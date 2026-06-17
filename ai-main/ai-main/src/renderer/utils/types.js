/**
 * NEXUS AI - Types & Interfaces
 * টাইপ ডেফিনিশন (JSDoc)
 */

/**
 * @typedef {Object} AppConfig
 * @property {string} apiKey - Gemini API Key
 * @property {string} language - Recognition language
 * @property {string} outputLanguage - Output language
 * @property {string} wakeWord - Wake word
 * @property {boolean} faceRecognitionEnabled - Face recognition toggle
 * @property {boolean} screenCaptureEnabled - Screen capture toggle
 * @property {boolean} autoListenEnabled - Auto listen toggle
 */

/**
 * @typedef {Object} VoiceResult
 * @property {string} final - Final transcript
 * @property {string} interim - Interim transcript
 * @property {number} confidence - Confidence score
 * @property {boolean} isFinal - Whether result is final
 */

/**
 * @typedef {Object} AIResponse
 * @property {string} text - Response text
 * @property {string} [error] - Error message if any
 * @property {number} tokens - Token count
 * @property {number} latency - Response latency in ms
 */

/**
 * @typedef {Object} ActionResult
 * @property {boolean} success - Whether action succeeded
 * @property {string} [message] - Result message
 * @property {any} [data] - Additional data
 */

/**
 * @typedef {Object} ScreenPosition
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 */

/**
 * @typedef {Object} FaceDetection
 * @property {string} label - Face label
 * @property {number} distance - Match distance
 * @property {Object} box - Bounding box
 */

/**
 * @typedef {Object} LogEntry
 * @property {string} type - Entry type (user, ai, action, system)
 * @property {string} text - Entry text
 * @property {number} timestamp - Entry timestamp
 */

// Export types
window.NEXUSTypes = {
    AppConfig: {},
    VoiceResult: {},
    AIResponse: {},
    ActionResult: {},
    ScreenPosition: {},
    FaceDetection: {},
    LogEntry: {}
};