// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate all required Firebase configuration values are present
const isRequiredConfigMissing =
  !firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId;

// During build time, if config is missing, use placeholder values to allow build to proceed
// Errors will be thrown at runtime when Firebase is actually used
const buildTimeConfig = isRequiredConfigMissing
  ? {
      apiKey: 'build-placeholder',
      authDomain: 'build-placeholder.firebaseapp.com',
      projectId: 'build-placeholder',
      storageBucket: 'build-placeholder.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:placeholder',
      measurementId: 'G-PLACEHOLDER',
    }
  : firebaseConfig;

let app: ReturnType<typeof initializeApp>;
let db: ReturnType<typeof getFirestore>;
let auth: ReturnType<typeof getAuth>;

try {
  app = initializeApp(buildTimeConfig);
  db = getFirestore(app);
  auth = getAuth(app);

  // If we used placeholder config, Firebase will initialize but operations will fail
  // This allows the build to proceed, errors will occur at runtime
  if (isRequiredConfigMissing && typeof window !== 'undefined') {
    console.warn(
      'Firebase initialized with placeholder config. Set NEXT_PUBLIC_FIREBASE_* environment variables for full functionality.'
    );
  }
} catch (error) {
  // During build/SSR, don't throw - allow build to proceed
  // Re-initialize with placeholder config to ensure exports are always defined
  try {
    app = initializeApp(buildTimeConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.warn('Firebase initialized with fallback config during build');
  } catch (fallbackError) {
    // If initialization still fails, we must initialize with something
    // Use the buildTimeConfig which should always be valid format-wise
    app = initializeApp(buildTimeConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.warn('Firebase force-initialized for build compatibility');
  }

  // Only throw error in browser runtime if config is actually missing
  if (typeof window !== 'undefined' && isRequiredConfigMissing) {
    throw new Error(
      'Missing required Firebase configuration. Please set all NEXT_PUBLIC_FIREBASE_* environment variables.'
    );
  }
}

export { db, auth };

// Connect to emulators in development (only if explicitly enabled)
if (
  process.env.NODE_ENV === 'development' &&
  process.env.FIREBASE_USE_EMULATOR === 'true' &&
  db &&
  auth
) {
  try {
    // Only connect if not already connected
    if (!(db as any)._delegate._databaseId.projectId.includes('demo-')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
  } catch (error) {
    // Firestore emulator already connected or not available
  }

  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
  } catch (error) {
    // Auth emulator already connected or not available
  }
}

// Initialize Analytics
if (typeof window !== 'undefined' && app) {
  isSupported().then(supported => {
    if (supported) {
      getAnalytics(app);
    }
  });
}
