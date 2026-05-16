import admin from "firebase-admin";
import { readFileSync } from "node:fs";

const getFirebaseAdmin = () => {
  if (admin.apps.length) {
    return admin;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || "sems-9d72b";
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (serviceAccountJson || serviceAccountPath) {
    const serviceAccount = serviceAccountJson
      ? JSON.parse(serviceAccountJson)
      : JSON.parse(readFileSync(serviceAccountPath, "utf8"));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId
    });
  } else {
    admin.initializeApp({ projectId });
  }

  return admin;
};

export default getFirebaseAdmin;
