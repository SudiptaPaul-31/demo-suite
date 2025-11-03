// Firebase configuration and initialization
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Get Firebase configuration from environment variables
function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}

// Check if config is valid (not placeholder)
function isConfigValid(config: ReturnType<typeof getFirebaseConfig>): boolean {
  return !!(
    config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.apiKey !== 'build-placeholder' &&
    config.projectId !== 'build-placeholder' &&
    !config.apiKey.includes('placeholder') &&
    !config.projectId.includes('placeholder')
  );
}

// Placeholder config for build-time only
const placeholderConfig = {
  apiKey: 'build-placeholder',
  authDomain: 'build-placeholder.firebaseapp.com',
  projectId: 'build-placeholder',
  storageBucket: 'build-placeholder.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:placeholder',
  measurementId: 'G-PLACEHOLDER',
};

// Initialize Firebase instances - using lazy initialization
// Using definite assignment assertions since they're always initialized via getFirebase()
let app!: FirebaseApp;
let db!: Firestore;
let auth!: Auth;
let initialized = false;
let initializedWithPlaceholder = false;

// Lazy initialization function - only initializes when actually needed
function getFirebase(): { app: FirebaseApp; db: Firestore; auth: Auth } {
  // If already initialized, return existing instances
  if (initialized && app && db && auth) {
    return { app, db, auth };
  }

  const config = getFirebaseConfig();
  const isValid = isConfigValid(config);
  const isBrowser = typeof window !== 'undefined';

  // Check if Firebase is already initialized (by another module or during build)
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
    db = getFirestore(app);
    auth = getAuth(app);
    
    // Check if we're using placeholder by examining the project ID
    const projectId = (app.options as any).projectId;
    const isUsingPlaceholder = projectId === 'build-placeholder';
    
    // CRITICAL: In browser runtime, if we have valid config but Firebase was initialized with placeholder,
    // we can't re-initialize, so we need to throw an error
    if (isBrowser && isUsingPlaceholder && isValid) {
      const errorMsg = 
        'Firebase was initialized with placeholder config during build, but real config is available at runtime. ' +
        'Firebase cannot be re-initialized. Please ensure NEXT_PUBLIC_FIREBASE_* environment variables ' +
        'are set in Vercel project settings (not just environment variables) so they are available during build.';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    initialized = true;
    initializedWithPlaceholder = isUsingPlaceholder;
    return { app, db, auth };
  }

  // Use placeholder ONLY during build/SSR if config is missing
  // In browser runtime, always use real config if available, never placeholder
  const usePlaceholder = !isValid && !isBrowser;

  // In browser runtime, only initialize with real config
  if (isBrowser && !isValid) {
    throw new Error(
      'Missing required Firebase configuration. Please set all NEXT_PUBLIC_FIREBASE_* environment variables.'
    );
  }

  const finalConfig = usePlaceholder ? placeholderConfig : config;

  try {
    app = initializeApp(finalConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    initialized = true;
    initializedWithPlaceholder = usePlaceholder;
  } catch (error) {
    // During build/SSR, use placeholder to allow build to proceed
    if (!isBrowser) {
      try {
        app = initializeApp(placeholderConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        initialized = true;
        initializedWithPlaceholder = true;
      } catch (fallbackError) {
        // Force initialization with placeholder for build compatibility
        app = initializeApp(placeholderConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        initialized = true;
        initializedWithPlaceholder = true;
      }
    } else {
      // In browser runtime, re-throw the error
      throw error;
    }
  }

  return { app, db, auth };
}

// Initialize lazily - defer initialization until actually needed
// This ensures we use real config in browser if available
// During SSR/build, we'll initialize with placeholder if needed
// But we wait until first access to avoid initializing with placeholder in browser
if (typeof window !== 'undefined') {
  // Browser: Try to initialize with real config immediately
  // This will be called when the module is first imported in browser
  try {
    const result = getFirebase();
    app = result.app;
    db = result.db;
    auth = result.auth;
  } catch (error) {
    // If initialization fails in browser and we detect placeholder was used during build,
    // we need to handle this gracefully - but we can't re-initialize Firebase
    // The error message will guide the user to fix their Vercel environment variables
    console.error('Firebase initialization failed in browser:', error);
    // Still set app, db, auth to prevent TypeScript errors, but they'll be placeholder
    try {
      const existingApps = getApps();
      if (existingApps.length > 0) {
        app = existingApps[0];
        db = getFirestore(app);
        auth = getAuth(app);
      } else {
        // Fallback - should never happen
        app = initializeApp(placeholderConfig);
        db = getFirestore(app);
        auth = getAuth(app);
      }
    } catch (fallbackError) {
      // Last resort
      app = initializeApp(placeholderConfig);
      db = getFirestore(app);
      auth = getAuth(app);
    }
  }
} else {
  // SSR/Build: Initialize with placeholder to allow build to proceed
  // This is safe because Next.js will rebuild client bundles with real env vars if available
  try {
    const config = getFirebaseConfig();
    const isValid = isConfigValid(config);
    
    if (isValid) {
      // If we have valid config during build, use it!
      app = initializeApp(config);
      db = getFirestore(app);
      auth = getAuth(app);
      initialized = true;
      initializedWithPlaceholder = false;
    } else {
      // Only use placeholder if config is actually missing
      app = initializeApp(placeholderConfig);
      db = getFirestore(app);
      auth = getAuth(app);
      initialized = true;
      initializedWithPlaceholder = true;
    }
  } catch (error) {
    // This should never happen, but ensures TypeScript knows they're defined
    throw new Error('Failed to initialize Firebase during build');
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
