// Service to read GPS coordinate files and return driver locations
const fs = require('fs').promises;
const path = require('path');

exports.parseLocationFile = async (filename) => {
    const filePath = path.join(__dirname, '..', filename);
    const data = await fs.readFile(filePath, 'utf8');

    return data
        .trim()
        .split('\n')
        .map(line => {
            const [lat, lon, driverId, timestamp] = line.split(',');
            return {
                latitude: parseFloat(lat),
                longitude: parseFloat(lon),
                driverId: driverId.trim(),
                timestamp: new Date(timestamp.trim())
            };
        });
};