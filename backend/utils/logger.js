// Simple logger for uniform log messages

exports.info = (message, ...args) => {
    console.log(`ℹ️ INFO: ${message}`, ...args);
};

exports.error = (message, ...args) => {
    console.error(`❌ ERROR: ${message}`, ...args);
};

exports.debug = (message, ...args) => {
    if (process.env.DEBUG === 'true') {
        console.log(`🐛 DEBUG: ${message}`, ...args);
    }
};