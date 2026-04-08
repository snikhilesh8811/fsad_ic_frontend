import { GoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { isFirebaseConfigured, signInWithGooglePopup, wrapFirebaseError } from "../../services/firebaseAuth";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleSignUpButton({ onCredential, onFirebaseSession, onError, mode = "signup" }) {
  const firebaseLabel = mode === "signin" ? "Sign in with Google" : "Sign up with Google";

  if (isFirebaseConfigured()) {
    return (
      <button
        type="button"
        onClick={async () => {
          try {
            const session = await signInWithGooglePopup();
            onFirebaseSession?.(session);
          } catch (err) {
            console.error(err);
            onError?.(wrapFirebaseError(err).message);
          }
        }}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50"
      >
        <FcGoogle className="text-lg" aria-hidden />
        {firebaseLabel}
      </button>
    );
  }

  if (!clientId) {
    return (
      <p className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-center text-xs text-gray-600">
        Add Firebase web config in <code className="rounded bg-gray-200 px-1 py-0.5 text-[0.7rem]">.env</code> (see project docs) or set{" "}
        <code className="rounded bg-gray-200 px-1 py-0.5 text-[0.7rem]">VITE_GOOGLE_CLIENT_ID</code> for Google-only sign-in.
      </p>
    );
  }

  return (
    <div className="flex w-full items-center justify-center">
      <GoogleLogin
        onSuccess={(res) => onCredential(res.credential)}
        onError={() => onError?.()}
        theme="outline"
        size="medium"
        text={mode === "signin" ? "signin_with" : "signup_with"}
        shape="rectangular"
      />
    </div>
  );
}
