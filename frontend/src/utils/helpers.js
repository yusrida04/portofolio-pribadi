// frontend/src/utils/helpers.js

/**
 * Konversi link Google Drive sharing ke link gambar langsung (direct display)
 * Mendukung format:
 * - https://drive.google.com/file/d/FILE_ID/view...
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 */
export const formatGoogleDriveImage = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Cek apakah merupakan link Google Drive
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    let fileId = null;

    // Pola 1: /file/d/ID/
    const matchPath = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (matchPath && matchPath[1]) {
      fileId = matchPath[1];
    }

    // Pola 2: ?id=ID atau &id=ID
    if (!fileId) {
      const matchQuery = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (matchQuery && matchQuery[1]) {
        fileId = matchQuery[1];
      }
    }

    if (fileId) {
      // Menggunakan CDN Google lh3 untuk gambar cepat & bebas CORS
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  return trimmed;
};

// Daftar bulan standar dalam Bahasa Indonesia
export const DAFTAR_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

// Opsi level keahlian standar
export const LEVEL_KEAHLIAN = [
  { label: 'Pemula (Beginner)', value: 'Pemula', percent: 45 },
  { label: 'Menengah (Intermediate)', value: 'Menengah', percent: 80 },
  { label: 'Mahir (Advanced)', value: 'Mahir', percent: 95 },
];

export const TEMPLATE_KONTAK = [
  { nama: 'WhatsApp', prefix: 'https://wa.me/', placeholder: '628123456789' },
  { nama: 'Email', prefix: 'mailto:', placeholder: 'nama@email.com' },
  { nama: 'LinkedIn', prefix: 'https://linkedin.com/in/', placeholder: 'username' },
  { nama: 'GitHub', prefix: 'https://github.com/', placeholder: 'username' },
  { nama: 'Instagram', prefix: 'https://instagram.com/', placeholder: 'username' },
  { nama: 'Other Link', prefix: 'https://', placeholder: 'https://tautan-anda.com' }
];
