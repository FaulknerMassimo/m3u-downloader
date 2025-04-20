# M3U Downloader

A web application for searching and downloading content from M3U playlists.

## Features

- Search for content across multiple M3U links
- Download movies and TV show episodes
- Track download progress and history
- Watchlist for automatic downloads of new episodes
- Organize M3U links by categories

## Project Structure

The project is divided into two main parts:

### Backend (Node.js + Express)

- RESTful API for managing M3U links, downloads, and watchlist
- SQLite database for persistent storage
- M3U parsing and content searching
- File downloading with progress tracking
- Automatic watchlist monitoring

### Frontend (React + Vite)

- Modern UI built with React and Tailwind CSS
- Responsive design for all screen sizes
- Real-time download progress updates
- Search functionality with filtering by category

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/FaulknerMassimo/m3u-downloader.git
   cd m3u-downloader
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Add categories and M3U links in the Settings page
2. Search for content on the Home page
3. Download episodes or movies by clicking the download button
4. Add series to your watchlist to automatically download new episodes
5. Monitor active downloads and history in the Downloads page

## License

This project is licensed under the MIT License - see the LICENSE file for details.
