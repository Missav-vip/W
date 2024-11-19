// Function to check available storage
function checkStorageAndDownload(sizeInZB) {
  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then((storage) => {
      const availableSpace = storage.quota - storage.usage;
      if (availableSpace >= sizeInZB * Math.pow(1024, 5)) { // Convert size from ZB to bytes
        alert('Sufficient storage. Proceeding to download...');
        checkUserLocation(); // Proceed to location check
      } else {
        alert('Insufficient storage space for the file.');
      }
    }).catch((error) => {
      alert('Error checking storage: ' + error);
    });
  } else {
    alert('Storage estimation not supported by this browser.');
  }
}

// Function to check user's location
function checkUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const highRiskAreas = [
        { lat: 35.3606, lng: 137.4280 }, // Example location: Mount Fuji
        { lat: 38.2970, lng: 141.0196 }  // Example location: Fukushima
      ];

      const isHighRisk = highRiskAreas.some(area => {
        const distance = Math.sqrt(
          Math.pow(latitude - area.lat, 2) + Math.pow(longitude - area.lng, 2)
        );
        return distance < 0.1; // Rough check for proximity
      });

      if (isHighRisk) {
        generateTokenAndDownload();
      } else {
        alert('Download is only allowed in high-risk areas.');
      }
    }, (error) => {
      alert('Error getting geolocation: ' + error.message);
    });
  } else {
    alert('Geolocation is not supported by this browser.');
  }
}

// Function to generate a random token, encrypt it, and start download
function generateTokenAndDownload() {
  const token = generateRandomToken();
  const encryptedToken = encryptToken(token);

  // Save the token and its expiration time
  const expirationTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
  sessionStorage.setItem('token', encryptedToken);
  sessionStorage.setItem('expiration', expirationTime);

  // Create a download file with the encrypted token
  const blob = new Blob([encryptedToken], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'tokenFile.txt';
  link.click();
}

// Function to generate a random token of 22 characters
function generateRandomToken() {
  const charset = 'あいうえおかきくけこさしすせそたちつてとにぬねのまみむめもやゆよらりるれろわをんABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 22; i++) {
    token += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return token;
}

// Simple encryption (reverse the string)
function encryptToken(token) {
  return token.split('').reverse().join('');
}

// Function to check if the token is expired
function checkTokenExpiration() {
  const expirationTime = sessionStorage.getItem('expiration');
  if (expirationTime && Date.now() > expirationTime) {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('expiration');
    alert('Token has expired. Please generate a new one.');
  } else {
    alert('Token is still valid.');
  }
}

// Update progress bar (dummy example, you can modify to reflect actual progress)
function updateProgressBar(percent) {
  const progressBar = document.getElementById('progress-bar');
  progressBar.style.width = percent + '%';
}

// Function to prevent device enumeration
function disableDeviceEnumeration() {
  navigator.mediaDevices.enumerateDevices = function() {
    return Promise.resolve([]);
  };
}

// Call disableDeviceEnumeration to prevent device enumeration at page load
disableDeviceEnumeration();
