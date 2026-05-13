import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../../components/Toast.jsx";
import API_BASE_URL from "../../apiConfig";
import "./Login.css";
function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_BASE_URL + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);

        if (data.user.role === 'admin') {
          navigate("/admin");
        } else if (data.user.role === 'teacher') {
          navigate("/teacher");
        } else {
          navigate("/student");
        }
      } else {
        toast(data.message || "Invalid credentials", "error");
      }
    } catch (error) {
      toast("Could not connect to the server.", "error");
    }
  };
  const handleRequestOTP = async () => {
    if (!resetEmail) return toast("Please enter your email.", "warning");
    try {
      const res = await fetch(API_BASE_URL + "/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();
      if (res.ok) {
        toast(data.message, "success");
        setStep(2);
      } else {
        toast(data.message, "error");
      }
    } catch (error) {
      toast("Server connection error.", "error");
    }
  };
  const handleResetPassword = async () => {
    if (!otp || !newPassword) return toast("Please fill all fields.", "warning");
    try {
      const res = await fetch(API_BASE_URL + "/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, otp, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        toast(data.message || "Password reset successfully!", "success");
        setIsModalOpen(false);
        setStep(1);
        setResetEmail("");
        setOtp("");
        setNewPassword("");
      } else {
        toast(data.message, "error");
      }
    } catch (error) {
      toast("Server connection error.", "error");
    }
  };
  return (
    <div className="main-container">
      <div className="left-panel">
        <div className="brand-header">
          <div className="logo-box">
            <i className="fa-regular fa-calendar-days"></i>
          </div>
          <h1>UniSchedule</h1>
        </div>
        <p className="brand-desc">
          An advanced Timetable Generator that eliminates scheduling conflicts
          and intelligently optimizes your academic experience.
        </p>
        <div className="timetable-grid">
          <div className="grid-cell uni-header" style={{ gridRow: "1", gridColumn: "1" }}></div>
          <div className="grid-cell uni-header" style={{ gridRow: "1", gridColumn: "2" }}>Sat</div>
          <div className="grid-cell uni-header" style={{ gridRow: "1", gridColumn: "3" }}>Sun</div>
          <div className="grid-cell uni-header" style={{ gridRow: "1", gridColumn: "4" }}>Mon</div>
          <div className="grid-cell uni-header" style={{ gridRow: "1", gridColumn: "5" }}>Tue</div>
          <div className="grid-cell uni-header" style={{ gridRow: "1", gridColumn: "6" }}>Wed</div>
          <div className="grid-cell uni-header" style={{ gridRow: "1", gridColumn: "7" }}>Thurs</div>
          <div className="grid-cell uni-time" style={{ gridRow: "2", gridColumn: "1" }}>8:00</div>
          <div className="grid-cell uni-time" style={{ gridRow: "3", gridColumn: "1" }}>9:00</div>
          <div className="grid-cell uni-time" style={{ gridRow: "4", gridColumn: "1" }}>10:00</div>
          <div className="grid-cell uni-time" style={{ gridRow: "5", gridColumn: "1" }}>11:00</div>
          <div className="grid-cell uni-time" style={{ gridRow: "6", gridColumn: "1" }}>12:00</div>
          <div className="grid-cell uni-time" style={{ gridRow: "7", gridColumn: "1" }}>1:00</div>
          <div className="grid-cell uni-time" style={{ gridRow: "8", gridColumn: "1" }}>2:00</div>
          <div className="grid-cell uni-time" style={{ gridRow: "9", gridColumn: "1" }}>3:00</div>
          <div className="grid-cell uni-time" style={{ gridRow: "10", gridColumn: "1" }}>4:00</div>
          <div className="course-block c-light" style={{ gridColumn: "2", gridRow: "2 / 4", "--order": 1 }}>CS 303 (ن)</div>
          <div className="course-block c-light" style={{ gridColumn: "2", gridRow: "8 / 10", "--order": 8 }}>CS 303 (ع)</div>
          <div className="course-block c-light" style={{ gridColumn: "3", gridRow: "4 / 6", "--order": 2 }}>CS 306 (ن)</div>
          <div className="course-block c-dark" style={{ gridColumn: "3", gridRow: "6 / 8", "--order": 7 }}>CS 308 (ن)</div>
          <div className="course-block c-dark" style={{ gridColumn: "4", gridRow: "2 / 4", "--order": 4 }}>CS 308 (ع)</div>
          <div className="course-block c-dark" style={{ gridColumn: "4", gridRow: "6 / 8", "--order": 5 }}>CS 317 (ن)</div>
          <div className="course-block c-light" style={{ gridColumn: "7", gridRow: "4 / 6", "--order": 12 }}>CS 301 (ن)</div>
          <div className="course-block c-light" style={{ gridColumn: "7", gridRow: "8 / 10", "--order": 13 }}>CS 301 (ع)</div>
          <div className="course-block c-dark" style={{ gridColumn: "7", gridRow: "6 / 8", "--order": 14 }}>CS 309 (ن)</div>
          <div className="course-block c-dark" style={{ gridColumn: "2", gridRow: "4 / 6", "--order": 5 }}>CS 309 (ع)</div>
          <div className="course-block c-dark" style={{ gridColumn: "4", gridRow: "8 / 10", "--order": 11 }}>CS 316 (ن)</div>
          <div className="course-block c-light" style={{ gridColumn: "5", gridRow: "2 / 4", "--order": 3 }}>CS 305 (ن)</div>
          <div className="course-block c-light" style={{ gridColumn: "5", gridRow: "5 / 7", "--order": 9 }}>CS 306 (ع)</div>
          <div className="course-block c-light" style={{ gridColumn: "6", gridRow: "2 / 4", "--order": 6 }}>CS 305 (ع)</div>
          <div className="course-block c-dark" style={{ gridColumn: "6", gridRow: "4 / 6", "--order": 6 }}>CS 317 (ع)</div>
          <div className="course-block c-dark" style={{ gridColumn: "6", gridRow: "8 / 10", "--order": 10 }}>CS 316 (ع)</div>
        </div>
        <div className="feature-tags">
          <span className="tag"><i className="fa-regular fa-calendar-check"></i> Conflict-Free</span>
          <span className="tag"><i className="fa-solid fa-arrows-rotate"></i> Real-Time Sync</span>
          <span className="tag"><i className="fa-regular fa-lightbulb"></i> Smart Suggestions</span>
        </div>
      </div>
      <div className="right-panel">
        <div className="login-header">
          <h2>Welcome back</h2>
          <p>Sign in to your account to access your timetable and manage your schedule.</p>
        </div>
        <form id="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <div className="label-with-link">
              <label htmlFor="password">Password</label>
              <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}>Forgot password?</a>
            </div>
            <div className="password-wrapper">
              <input type={showPassword ? "text" : "password"} id="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <i className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"} password-toggle`} onClick={togglePassword} style={{ cursor: "pointer" }}></i>
            </div>
          </div>
          <div className="keep-signed-in">
            <input type="checkbox" id="keep" checked={keepSignedIn} onChange={(e) => setKeepSignedIn(e.target.checked)} />
            <label htmlFor="keep">Keep me signed in</label>
          </div>
          <button type="submit" className="sign-in-btn">Sign In <span>&rarr;</span></button>
        </form>
        <p className="request-access">Forget passsowrd ? <a href="#" onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}>Request Access</a></p>
      </div>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={() => { setIsModalOpen(false); setStep(1); setResetEmail(""); setOtp(""); setNewPassword(""); }}>&times;</button>
            {step === 1 ? (
              <>
                <h2>Reset Password</h2>
                <p>Enter your university email to receive a One-Time Password (OTP).</p>
                <div className="input-group" style={{ textAlign: "left" }}>
                  <input type="email" placeholder="Your Email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="modal-input" />
                </div>
                <button className="sign-in-btn" onClick={handleRequestOTP} style={{ marginTop: "15px" }}>Send OTP</button>
              </>
            ) : (
              <>
                <h2>Enter OTP & New Password</h2>
                <p>Check your email for the 6-digit code.</p>
                <div className="input-group" style={{ textAlign: "left" }}>
                  <input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength="6" className="modal-input" />
                </div>
                <div className="input-group" style={{ textAlign: "left", marginTop: "15px" }}>
                  <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="modal-input" />
                </div>
                <button className="sign-in-btn" onClick={handleResetPassword} style={{ marginTop: "20px" }}>Confirm & Reset</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default Login;