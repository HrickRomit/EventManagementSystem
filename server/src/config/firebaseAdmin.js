import admin from "firebase-admin";

const getFirebaseAdmin = () => {
  if (admin.apps.length) {
    return admin;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || "event-management-7c019";
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);

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
