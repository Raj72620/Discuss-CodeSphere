// frontend/src/services/googleAuth.js
export const initGoogleAuth = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      resolve();
    };
    document.head.appendChild(script);
  });
};

export const handleGoogleLogin = () => {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error('Google Auth not loaded'));
      return;
    }

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: (response) => {
        resolve(response);
      },
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        window.google.accounts.id.renderButton(
          document.getElementById('googleButton'),
          { theme: 'outline', size: 'large', width: '100%' }
        );
      }
    });
  });
};