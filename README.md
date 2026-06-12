# IndieMotion - Independent OTT Platform

A complete, Netflix-like streaming platform built with HTML/CSS/JS, Supabase, and Cloudinary. Features guest browsing, user authentication, watch history, watchlist, resume watching, admin panel, and advanced video player.

## 🚀 Features

### Public / Guest
- Browse movies and series
- Filter by genre, year, search
- Watch any video (progress saved in localStorage)
- No history or watchlist for guests

### Registered Users (Supabase Auth)
- Login/Register with email/password
- Profile page (edit name, email, password)
- Watch history auto-saves every video (progress + timestamp)
- Watchlist (add/remove movies/series)
- Continue Watching row on homepage
- Rate movies/series (1-5 stars)
- Resume watching from saved progress

### Admin Panel (role='admin')
- Secure login with role verification
- Dashboard with stats (users, movies, views) and Chart.js
- Manage movies: add/edit/delete (poster + video upload to Cloudinary)
- Manage series: add/edit/delete series, seasons, episodes (each episode has video upload)
- Manage categories and genres
- Manage users: view, edit roles, delete
- Reports: most watched, top rated (CSV export)
- System settings (site name, logo, contact info)

## 📁 File Structure
