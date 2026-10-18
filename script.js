/* ----------  Simple UUID v4  ---------- */
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/* ----------  Storage Keys  ---------- */
const STORAGE = {
  dataPrefix: 'portofolio_data_'   // per‑ID storage
};

/* ----------  State Variables  ---------- */
let currentId = null;   // ID yang sedang dipakai
let uploadedImages = []; // array dataURL
let uploadedVideos = []; // array dataURL

/* ----------  Load & Render  ---------- */
function load() {
  const urlParams = new URLSearchParams(window.location.search);
  currentId = urlParams.get('id');
  const mode = urlParams.get('mode') || 'normal';

  if (currentId) {
    const stored = JSON.parse(localStorage.getItem(STORAGE.dataPrefix + currentId) || '{}');
    uploadedImages = stored.images || [];
    uploadedVideos = stored.videos || [];
    const txt = stored.text || 'Selamat datang di portofolio saya!';
    const audio = stored.audio || '';
    const bg = stored.bg || null;
    document.getElementById('kenangan-text').textContent = txt;
    document.getElementById('text-input').value = txt;
    renderGallery(uploadedImages, uploadedVideos);
    setAudio(audio);
    setBackground(bg);
    previewBackground(bg);
  } else {
    // mode default (normal)
    uploadedImages = JSON.parse(localStorage.getItem('portofolio_images') || '[]');
    uploadedVideos = JSON.parse(localStorage.getItem('portofolio_videos') || '[]');
    const txt = localStorage.getItem('portofolio_text') || 'Selamat datang di portofolio saya!';
    const audio = localStorage.getItem('portofolio_audio') || '';
    const bg = JSON.parse(localStorage.getItem('portofolio_bg') || 'null');
    document.getElementById('kenangan-text').textContent = txt;
    document.getElementById('text-input').value = txt;
    renderGallery(uploadedImages, uploadedVideos);
    setAudio(audio);
    setBackground(bg);
    previewBackground(bg);
  }

  // UI mode handling
  if (mode === 'view') {
    document.getElementById('settings').style.display = 'none';
    document.getElementById('toggle-settings').style.display = 'none';
    document.querySelectorAll('button[id^="save-"]').forEach(btn => btn.style.display = 'none');
  } else {
    document.getElementById('settings').style.display = 'block';
    document.getElementById('toggle-settings').style.display
