module.exports = {
  expo: {
    name: "GAUGE",
    slug: "gauge",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#1A1A1A"
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "app.gaugestyle.app",
      infoPlist: {
        NSCameraUsageDescription: "GAUGE needs camera access to analyze clothing.",
        NSPhotoLibraryUsageDescription: "GAUGE needs photo library access to select clothing images."
      },
      config: {
        usesNonExemptEncryption: false
      }
    },
    android: {
      package: "app.gaugestyle.app",
      permissions: ["CAMERA", "READ_EXTERNAL_STORAGE"],
      versionCode: 1,
      softwareKeyboardLayoutMode: "pan" // Ensures keyboard pushes content up instead of resizing
    },
    plugins: [
      [
        "expo-image-picker",
        {
          photosPermission: "GAUGE accesses your photos to analyze clothing.",
          cameraPermission: "GAUGE uses your camera to capture clothing photos."
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "393435b7-6591-45c6-895d-1f9d5764b2a2"
      }
    }
  }
};

