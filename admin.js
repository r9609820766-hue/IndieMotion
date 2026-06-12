// ======================================================
// INDIE MOTION - ADMIN.JS
// Shared Admin Functions: Role Check, Cloudinary Upload, etc.
// ======================================================

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = 'drf0guw5w';
const CLOUDINARY_UPLOAD_PRESET = 'indiemotion_unsigned';

// ======================================================
// ADMIN ROLE CHECK
// ======================================================
async function checkAdminRole() {
  if (!window.supabaseClient) {
    console.error('Supabase client not initialized');
    return false;
  }
  const { data: { session } } = await window.supabaseClient.auth.getSession();
  if (!session) return false;
  
  const { data: profile } = await window.supabaseClient
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
  
  return profile && profile.role === 'admin';
}

// Redirect non-admin users to home or login
async function requireAdmin() {
  const isAdmin = await checkAdminRole();
  if (!isAdmin) {
    window.location.href = '/admin-login.html';
    return false;
  }
  return true;
}

// ======================================================
// CLOUDINARY UPLOAD FUNCTIONS
// ======================================================

// Upload any file (image/video) to Cloudinary
async function uploadToCloudinary(file, onProgress = null) {
  if (!file) return null;
  
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`);
    
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = (e.loaded / e.total) * 100;
          onProgress(percent);
        }
      });
    }
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.secure_url);
      } else {
        reject(new Error('Upload failed: ' + xhr.statusText));
      }
    };
    
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
}

// Upload poster image (simplified)
async function uploadPoster(file) {
  return uploadToCloudinary(file);
}

// Upload video file
async function uploadVideo(file, onProgress = null) {
  return uploadToCloudinary(file, onProgress);
}

// ======================================================
// ADMIN TABLE RENDER HELPERS
// ======================================================

// Generic function to render a data table
function renderAdminTable(containerId, columns, data, actions = null) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (!data || data.length === 0) {
    container.innerHTML = '<div class="text-center text-white-50 py-4">No data available</div>';
    return;
  }
  
  let html = '<div class="table-responsive"><table class="table table-dark table-hover"><thead><tr>';
  columns.forEach(col => {
    html += `<th>${col.label}</th>`;
  });
  if (actions) html += '<th>Actions</th>';
  html += '</tr></thead><tbody>';
  
  data.forEach(row => {
    html += '<tr>';
    columns.forEach(col => {
      let value = row[col.key] !== undefined ? row[col.key] : '-';
      if (col.formatter) value = col.formatter(value, row);
      html += `<td>${value}</td>`;
    });
    if (actions) {
      html += '<td>';
      actions.forEach(action => {
        html += `<button class="btn btn-sm btn-${action.color || 'primary'} me-1" onclick="${action.handler}('${row.id}')"><i class="fas ${action.icon}"></i></button>`;
      });
      html += '</td>';
    }
    html += '</tr>';
  });
  
  html += '</tbody></table></div>';
  container.innerHTML = html;
}

// ======================================================
// HELPER: Show Toast Notification
// ======================================================
function showAdminToast(message, type = 'success') {
  // Create a temporary toast container if not exists
  let toastContainer = document.getElementById('adminToastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'adminToastContainer';
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
  toastContainer.appendChild(toast);
  const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
  bsToast.show();
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

// ======================================================
// EXPORT FUNCTIONS TO GLOBAL SCOPE
// ======================================================
window.admin = {
  checkAdminRole,
  requireAdmin,
  uploadToCloudinary,
  uploadPoster,
  uploadVideo,
  renderAdminTable,
  showToast: showAdminToast
};