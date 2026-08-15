import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_SECRET;

export const encryptPayload = (payload) => {
  if (!payload) return null;
  
  try {
    const jsonString = JSON.stringify(payload);
    const encryptedData = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
    
    // Send it nested under encryptedData to match backend expectation
    return { encryptedData };
  } catch (error) {
    console.error('Encryption failed', error);
    return null;
  }
};
