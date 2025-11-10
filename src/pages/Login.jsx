import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "../store/useAuthStore";
import "./Login.css";

function Login() {
  const { loginWithGoogle, error, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const googleToken = credentialResponse.credential;

      if (!googleToken) {
        console.error("No credential received from Google");
        return;
      }

      // Call Zustand store function
      await loginWithGoogle(googleToken);

      console.log("✅ Google login successful");
      navigate("/");
    } catch (err) {
      console.error("❌ Login error:", err);
    }
  };

  const handleGoogleError = () => {
    console.error("❌ Google login failed");
  };

  return (
    <div className="login-page">
      {/* Hero Section */}
      <div className="login-hero">
        <div className="login-container">
          {/* Left Side - Branding */}
          <div className="login-content">
            <div className="login-logo-section">
              <svg className="login-logo" viewBox="0 0 24 24" fill="#4285F4">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
              </svg>
              <h1 className="login-brand">Calendar</h1>
            </div>

            <h2 className="login-headline">
              Spend less time planning and more time doing
            </h2>
            <p className="login-description">
              Manage your events, holidays, and reminders effortlessly in one
              place. Stay productive anywhere.
            </p>
          </div>

          {/* Right Side - Sign In Card */}
          <div className="login-card-container">
            <div className="login-card">
              <div className="card-header">
                <svg className="card-logo" viewBox="0 0 24 24" fill="#4285F4">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                </svg>
                <h2 className="card-title">Sign in</h2>
                <p className="card-subtitle">to continue to Calendar</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="error-message">
                  <svg
                    className="error-icon"
                    viewBox="0 0 24 24"
                    fill="#EA4335"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Google Login */}
              <div className="google-login-wrapper">
                {isLoading ? (
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-400 text-white rounded"
                  >
                    Loading...
                  </button>
                ) : (
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    auto_select={false}
                    theme="outline"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                    width="320"
                  />
                )}
              </div>

              <div className="card-footer">
                <p className="footer-text">
                  By signing in, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </div>
            </div>

            <div className="help-links">
              <a href="#" className="help-link">
                Help
              </a>
              <span className="help-divider">•</span>
              <a href="#" className="help-link">
                Privacy
              </a>
              <span className="help-divider">•</span>
              <a href="#" className="help-link">
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
