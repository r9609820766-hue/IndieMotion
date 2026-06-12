// ======================================================
// INDIE MOTION - MAIN.JS
// Shared Supabase Client, Auth State, and Helpers
// ======================================================

// Supabase Configuration
const SUPABASE_URL = 'https://lxqxdtsgwgdogmncgaqj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4cXhkdHNnd2dkb2dtbmNnYXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExODkyMTgsImV4cCI6MjA5Njc2NTIxOH0.pkJOOXG9NkVqsRloO3lm1dRWXcrQESBlEiXW8g_Oh-8';

// Initialize Supabase Client (global)
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global state
window.currentUser = null;
window.currentUserRole = null;

// ======================================================
// AUTHENTICATION
// ======================================================

// Get current session and set global user
async function initAuth() {
  const { data: { session } } = await window.supabaseClient.auth.getSession();
  if (session) {
    window.currentUser = session.user;
    // Fetch user role from profiles
    const { data: profile } = await window.supabaseClient
      .from('profiles')
      .select('role, name')
      .eq('id', session.user.id)
      .single();
    if (profile) {
      window.currentUserRole = profile.role;
      window.currentUser.name = profile.name;
    }
  } else {
    window.currentUser = null;
    window.currentUserRole = null;
  }
  updateNavbar();
  // Dispatch event for pages that need to know auth state
  window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user: window.currentUser, role: window.currentUserRole } }));
}

// Listen for auth changes (login, logout, token refresh)
window.supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    window.currentUser = session.user;
    // Re-fetch profile
    window.supabaseClient.from('profiles').select('role, name').eq('id', session.user.id).single()
      .then(({ data }) => {
        if (data) {
          window.currentUserRole = data.role;
          window.currentUser.name = data.name;
        }
        updateNavbar();
        window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user: window.currentUser, role: window.currentUserRole } }));
      });
  } else if (event === 'SIGNED_OUT') {
    window.currentUser = null;
    window.currentUserRole = null;
    updateNavbar();
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user: null, role: null } }));
  }
});

// ======================================================
// NAVIGATION BAR UPDATE
// ======================================================
function updateNavbar() {
  const authNav = document.getElementById('authNav');
  if (!authNav) return;
  
  if (window.currentUser) {
    // User is logged in
    const userName = window.currentUser.name || window.currentUser.email.split('@')[0];
    let adminLink = '';
    if (window.currentUserRole === 'admin') {
      adminLink = '<li><a class="dropdown-item" href="admin-dashboard.html"><i class="fas fa-cog me-2"></i>Admin Panel</a></li><li><hr class="dropdown-divider"></li>';
    }
    authNav.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-link text-decoration-none text-white dropdown-toggle d-flex align-items-center gap-2" data-bs-toggle="dropdown">
                    <i class="fas fa-user-circle fs-4"></i>
                    <span>${userName}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-dark">
                    <li><a class="dropdown-item" href="profile.html"><i class="fas fa-user me-2"></i>Profile</a></li>
                    ${adminLink}
                    <li><a class="dropdown-item" href="#" id="navbarLogoutBtn"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                </ul>
            </div>
        `;
    const logoutBtn = document.getElementById('navbarLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await window.supabaseClient.auth.signOut();
        window.location.href = '/index.html';
      });
    }
  } else {
    // Guest
    authNav.innerHTML = `
            <a href="auth.html" class="btn btn-outline-light btn-sm">Login</a>
            <a href="auth.html?register=true" class="btn btn-danger btn-sm">Sign Up</a>
        `;
  }
}

// ======================================================
// GUEST WATCH HISTORY (localStorage)
// ======================================================
function saveGuestProgress(contentType, contentId, progressSeconds) {
  const key = `guest_watch_${contentType}_${contentId}`;
  localStorage.setItem(key, JSON.stringify({
    progress: progressSeconds,
    timestamp: Date.now()
  }));
}

function getGuestProgress(contentType, contentId) {
  const key = `guest_watch_${contentType}_${contentId}`;
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data).progress;
    } catch (e) { return null; }
  }
  return null;
}

// ======================================================
// HELPER: Format Duration (seconds to MM:SS)
// ======================================================
function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ======================================================
// HELPER: Format Date
// ======================================================
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

// ======================================================
// INITIALIZATION
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});