import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../firebase";

export const DEFAULT_PHONE_COUNTRY_CODE = "+880";

export const formatPhoneNumberForOtp = (phoneNumber) => {
  const compactNumber = phoneNumber.replace(/[\s()-]/g, "");

  if (compactNumber.startsWith("+")) {
    return compactNumber;
  }

  if (compactNumber.startsWith("00")) {
    return `+${compactNumber.slice(2)}`;
  }

  if (compactNumber.startsWith("0")) {
    return `${DEFAULT_PHONE_COUNTRY_CODE}${compactNumber.slice(1)}`;
  }

  return `${DEFAULT_PHONE_COUNTRY_CODE}${compactNumber}`;
};

export const getPhoneOtpErrorMessage = (error) => {
  if (error?.code === "auth/billing-not-enabled") {
    return "Phone OTP is not available yet because Firebase billing is not enabled for SMS verification.";
  }

  return error?.message || "Could not send OTP. Please check the phone number.";
};

export const requestPhoneOtp = async (phoneNumber) => {
  const formattedPhoneNumber = formatPhoneNumberForOtp(phoneNumber);

  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "normal",
      }
    );
  }

  return signInWithPhoneNumber(auth, formattedPhoneNumber, window.recaptchaVerifier);
};

export const resetPhoneRecaptcha = () => {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }
};
