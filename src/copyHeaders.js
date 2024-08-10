function copyHeaders(source, target) {
    const headersToExclude = [
        'via', 
        'x-real-ip', 
        'x-forwarded-proto',
        'x-forwarded-host'
    ];

    for (const [key, value] of Object.entries(source.headers)) {
        // Only exclude headers that are in the exclusion list
        if (!headersToExclude.includes(key.toLowerCase())) {
            try {
                target.setHeader(key, value);
            } catch (e) {
                console.log(`Error setting header ${key}: ${e.message}`);
            }
        }
    }
}

module.exports = copyHeaders;
