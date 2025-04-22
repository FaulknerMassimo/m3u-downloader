// backend/src/controllers/systemController.js
const path = require('path');
const fs = require('fs').promises;
const { getDb, DEFAULT_SETTINGS } = require('../utils/database'); // Import DEFAULT_SETTINGS
const logger = require('../utils/logger');

const LOGS_DIR = path.join(__dirname, '../../logs');
// Use the default download path from settings for clearing
const DOWNLOADS_DIR = DEFAULT_SETTINGS.download_path; 

// Helper function to delete directory contents
const deleteDirectoryContents = async (directoryPath) => {
    try {
        // Check if directory exists first
        await fs.access(directoryPath); 
        const files = await fs.readdir(directoryPath);
        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            try {
                const stat = await fs.lstat(filePath);
                if (stat.isDirectory()) {
                    // Optionally recursively delete subdirectories, or just skip them
                    // await fs.rm(filePath, { recursive: true, force: true }); 
                    logger.info(`Skipping directory: ${filePath}`);
                } else {
                    await fs.unlink(filePath);
                    logger.info(`Deleted file: ${filePath}`);
                }
            } catch (fileError) {
                 logger.error(`Error processing file ${filePath}:`, fileError);
                 // Decide if you want to continue or stop on error
            }
        }
    } catch (error) {
        // Ignore errors if directory doesn't exist
        if (error.code === 'ENOENT') {
             logger.warn(`Directory not found, skipping deletion: ${directoryPath}`);
        } else {
            logger.error(`Error accessing or reading directory ${directoryPath}:`, error);
            throw error; // Re-throw other errors
        }
    }
};

const resetApplication = async (req, res) => {
    const db = getDb();
    try {
        logger.warn('Starting application reset process...');

        // 1. Clear Database Tables
        logger.info('Clearing database tables...');
        await db.run('DELETE FROM downloads');
        logger.info('Cleared downloads table.');
        await db.run('DELETE FROM watchlist');
        logger.info('Cleared watchlist table.');
        await db.run('DELETE FROM m3u_links');
        logger.info('Cleared m3u_links table.');
        await db.run('DELETE FROM categories');
        logger.info('Cleared categories table.');
        
        // 2. Reset Settings Table to Defaults
        logger.info('Resetting settings table...');
        await db.run(
            'UPDATE settings SET download_path = ?, webui_port = ?, watchlist_refresh_rate = ? WHERE id = 1',
            [DEFAULT_SETTINGS.download_path, DEFAULT_SETTINGS.webui_port, DEFAULT_SETTINGS.watchlist_refresh_rate]
        );
        logger.info('Settings table reset to defaults.');

        // 3. Re-insert Default Categories
        logger.info('Re-inserting default categories...');
        // Add download_path for default categories
        await db.run("INSERT INTO categories (name, download_path) VALUES ('TV Shows', ?)", [DEFAULT_SETTINGS.download_path]);
        await db.run("INSERT INTO categories (name, download_path) VALUES ('Movies', ?)", [DEFAULT_SETTINGS.download_path]);
        logger.info('Default categories re-inserted with default download paths.');

        // 4. Clear logs directory
        logger.info(`Clearing logs directory: ${LOGS_DIR}`);
        await deleteDirectoryContents(LOGS_DIR);
         // Ensure logs directory exists after clearing
         try {
            await fs.mkdir(LOGS_DIR, { recursive: true });
        } catch (mkdirError) {
            logger.error(`Failed to recreate logs directory ${LOGS_DIR}:`, mkdirError);
        }


        // 5. Clear downloads directory (using the default path)
        logger.info(`Clearing default downloads directory: ${DOWNLOADS_DIR}`);
        await deleteDirectoryContents(DOWNLOADS_DIR);
        // Ensure downloads directory exists after clearing
         try {
            await fs.mkdir(DOWNLOADS_DIR, { recursive: true });
        } catch (mkdirError) {
            logger.error(`Failed to recreate downloads directory ${DOWNLOADS_DIR}:`, mkdirError);
        }


        logger.warn('Application reset completed successfully.');
        // Send success response BEFORE potentially restarting
        res.status(200).json({ message: 'Application reset successfully. Frontend will reload.' });

    } catch (error) {
        logger.error('Failed to reset application:', error);
        res.status(500).json({ error: 'Failed to reset application', details: error.message });
    }
};

module.exports = {
    resetApplication,
};
