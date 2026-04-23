import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/auth/Login/LoginPage.jsx");import.meta.env = {"BASE_URL": "/", "DEV": true, "MODE": "development", "PROD": false, "SSR": false, "VITE_API_BASE_URL": "http://localhost:8080/api", "VITE_GOOGLE_CLIENT_ID": "194337731331-kv55hq4n86bln9honk84e7ida235o02f.apps.googleusercontent.com"};const useState = __vite__cjsImport0_react["useState"];const _jsxDEV = __vite__cjsImport5_react_jsxDevRuntime["jsxDEV"];import __vite__cjsImport0_react from "/node_modules/.vite/deps/react.js?v=6d5e7c74";
import { useNavigate } from "/node_modules/.vite/deps/react-router-dom.js?v=6d5e7c74";
import GoogleLoginButton from "/src/components/auth/GoogleLoginButton.jsx";
import { closeAlert, showError, showInfo, showRunning, showSuccess } from "/src/utils/alerts.js";
import "/src/components/auth/Login/LoginPage.css";
var _jsxFileName = "C:/Users/DELL/Desktop/Smart_Campus_Hub/frontend/src/components/auth/Login/LoginPage.jsx";
import __vite__cjsImport5_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=6d5e7c74";
var _s = $RefreshSig$();
function extractGoogleProfileFromJwt(idToken) {
	try {
		const payloadBase64 = idToken.split(".")[1];
		if (!payloadBase64) {
			return {
				email: "",
				name: "",
				picture: ""
			};
		}
		const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
		const payload = JSON.parse(payloadJson);
		return {
			email: typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "",
			name: typeof payload?.name === "string" ? payload.name.trim() : "",
			picture: typeof payload?.picture === "string" ? payload.picture.trim() : ""
		};
	} catch {
		return {
			email: "",
			name: "",
			picture: ""
		};
	}
}
export default function LoginPage() {
	_s();
	const navigate = useNavigate();
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";
	const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
	async function loginWithGoogle(idToken) {
		setLoading(true);
		setMessage("Checking Google login with backend...");
		showRunning("Signing in", "Checking Google login...");
		try {
			const response = await fetch(`${backendBaseUrl}/auth/google`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ idToken })
			});
			const contentType = response.headers.get("content-type") || "";
			let data = {};
			if (contentType.includes("application/json")) {
				data = await response.json();
			} else {
				const rawBody = await response.text();
				data = rawBody ? { message: rawBody } : {};
			}
			if (!response.ok) {
				throw new Error(data?.message ?? "Google auth failed.");
			}
			const googleProfile = extractGoogleProfileFromJwt(idToken);
			const googleEmail = googleProfile.email;
			const backendEmail = typeof data?.email === "string" ? data.email.trim().toLowerCase() : "";
			const effectiveEmail = googleEmail || backendEmail;
			const backendRole = String(data?.role ?? "").toUpperCase();
			if (!data?.token) {
				throw new Error(data?.message ?? "Google auth failed.");
			}
			// Trust the backend role assignment (admin email is now configured server-side)
			const role = backendRole === "ADMIN" ? "ADMIN" : "USER";
			// Backend blocks pending users before issuing token. If approved is omitted, treat as approved.
			const approved = typeof data?.approved === "boolean" ? data.approved : true;
			const savedUsername = data?.username ?? googleProfile.name ?? effectiveEmail ?? "";
			localStorage.setItem("token", data.token);
			localStorage.setItem("authToken", data.token);
			localStorage.setItem("role", role);
			localStorage.setItem("authRole", role);
			localStorage.setItem("authApproved", String(approved));
			localStorage.setItem("username", savedUsername);
			localStorage.setItem("authLoginType", "google");
			localStorage.setItem("authEmail", effectiveEmail);
			if (googleProfile.picture) {
				localStorage.setItem("authAvatarUrl", googleProfile.picture);
			} else {
				localStorage.removeItem("authAvatarUrl");
			}
			let effectiveRole = role;
			let effectiveApproved = approved;
			try {
				const verifyResponse = await fetch(`${backendBaseUrl}/user/me`, { headers: { Authorization: `Bearer ${data.token}` } });
				const verifyData = await verifyResponse.json();
				if (verifyResponse.ok) {
					const verifyRole = String(verifyData?.role ?? effectiveRole).toUpperCase();
					const verifyApproved = typeof verifyData?.approved === "boolean" ? verifyData.approved : effectiveApproved;
					effectiveRole = verifyRole === "ADMIN" ? "ADMIN" : "USER";
					effectiveApproved = effectiveRole === "ADMIN" ? true : verifyApproved;
					localStorage.setItem("role", effectiveRole);
					localStorage.setItem("authRole", effectiveRole);
					localStorage.setItem("authApproved", String(effectiveApproved));
					if (verifyData?.username) {
						localStorage.setItem("username", String(verifyData.username));
					}
					if (typeof verifyData?.email === "string" && verifyData.email.trim()) {
						localStorage.setItem("authEmail", verifyData.email.trim().toLowerCase());
					}
					localStorage.setItem("authLoginType", "google");
				}
			} catch {}
			if (!effectiveApproved) {
				setMessage("Your account is pending admin approval. Redirecting...");
				closeAlert();
				showInfo("Pending approval", "Your account is waiting for admin approval.");
				navigate("/unauthorized", { replace: true });
				return;
			}
			if (effectiveRole === "ADMIN") {
				setMessage("Admin login successful. Redirecting...");
				closeAlert();
				await showSuccess("Admin login successful", "Welcome to your dashboard.");
				navigate("/admin-dashboard", { replace: true });
				return;
			}
			setMessage("Login successful. Redirecting...");
			closeAlert();
			await showSuccess("Login successful", "Welcome back.");
			navigate("/dashboard");
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Google auth failed.";
			const isPending = errorMessage.toLowerCase().includes("pending");
			const isSuspended = errorMessage.toLowerCase().includes("suspended");
			if (isPending || isSuspended) {
				const googleProfile = extractGoogleProfileFromJwt(idToken);
				const googleEmail = googleProfile.email;
				if (googleProfile.name) {
					localStorage.setItem("username", googleProfile.name);
				} else if (googleEmail) {
					localStorage.setItem("username", googleEmail.split("@")[0] || googleEmail);
				}
				if (googleProfile.picture) {
					localStorage.setItem("authAvatarUrl", googleProfile.picture);
				}
				if (googleEmail) {
					localStorage.setItem("authEmail", googleEmail);
				}
				if (isSuspended) {
					setMessage("Your account is suspended. Redirecting...");
					closeAlert();
					showInfo("Account suspended", "Your account has been suspended. Contact administration for help.");
					setTimeout(() => navigate("/suspended", { replace: true }), 1500);
				} else {
					setMessage("Your account is pending admin approval. Redirecting...");
					closeAlert();
					showInfo("Pending approval", "Your account is waiting for admin approval.");
					setTimeout(() => navigate("/unauthorized", { replace: true }), 1500);
				}
				return;
			}
			setMessage(errorMessage);
			closeAlert();
			showError("Login failed", errorMessage);
		} finally {
			setLoading(false);
		}
	}
	async function loginWithLocal(e) {
		e.preventDefault();
		if (!username.trim() || !password.trim()) {
			setMessage("Please enter both username and password.");
			return;
		}
		setLoading(true);
		setMessage("Signing in...");
		showRunning("Signing in", "Validating credentials...");
		try {
			const response = await fetch(`${backendBaseUrl}/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: username.trim(),
					password
				})
			});
			const contentType = response.headers.get("content-type") || "";
			let data = {};
			if (contentType.includes("application/json")) {
				data = await response.json();
			} else {
				const rawBody = await response.text();
				data = rawBody ? { message: rawBody } : {};
			}
			if (!response.ok) {
				throw new Error(data?.message ?? "Login failed.");
			}
			const role = String(data?.role ?? "USER").toUpperCase();
			const approved = typeof data?.approved === "boolean" ? data.approved : true;
			localStorage.setItem("token", data.token);
			localStorage.setItem("authToken", data.token);
			localStorage.setItem("role", role);
			localStorage.setItem("authRole", role);
			localStorage.setItem("authApproved", String(approved));
			localStorage.setItem("username", data.username ?? username);
			localStorage.setItem("authEmail", data.email ?? username);
			localStorage.setItem("authLoginType", "local");
			if (!approved) {
				setMessage("Your account is pending admin approval.");
				closeAlert();
				showInfo("Pending approval", "Your account is waiting for admin approval.");
				navigate("/unauthorized", { replace: true });
				return;
			}
			if (role === "ADMIN") {
				setMessage("Admin login successful.");
				closeAlert();
				await showSuccess("Admin login successful", "Welcome to your dashboard.");
				navigate("/admin-dashboard", { replace: true });
				return;
			}
			setMessage("Login successful.");
			closeAlert();
			await showSuccess("Login successful", "Welcome back.");
			navigate("/dashboard");
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Login failed.";
			const isSuspended = errorMessage.toLowerCase().includes("suspended");
			const isPending = errorMessage.toLowerCase().includes("pending");
			if (isSuspended || isPending) {
				localStorage.setItem("username", username);
				if (isSuspended) {
					setMessage("Your account is suspended.");
					closeAlert();
					showInfo("Account suspended", "Your account has been suspended. Contact administration.");
					setTimeout(() => navigate("/suspended", { replace: true }), 1500);
				} else {
					setMessage("Your account is pending admin approval.");
					closeAlert();
					showInfo("Pending approval", "Your account is waiting for admin approval.");
					setTimeout(() => navigate("/unauthorized", { replace: true }), 1500);
				}
				return;
			}
			setMessage(errorMessage);
			closeAlert();
			showError("Login failed", errorMessage);
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ _jsxDEV("main", {
		className: "auth-page",
		children: /* @__PURE__ */ _jsxDEV("section", {
			className: "auth-layout",
			children: [/* @__PURE__ */ _jsxDEV("article", {
				className: "auth-hero",
				children: [
					/* @__PURE__ */ _jsxDEV("p", {
						className: "chip",
						children: "Smart Campus"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 281,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ _jsxDEV("h1", { children: ["Campus Management,", /* @__PURE__ */ _jsxDEV("span", { children: " Simplified" }, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 284,
						columnNumber: 13
					}, this)] }, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 282,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ _jsxDEV("p", {
						className: "subtitle",
						children: "A comprehensive platform for resources, bookings, maintenance, and announcements across campus."
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 286,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ _jsxDEV("div", {
						className: "hero-grid",
						children: [
							/* @__PURE__ */ _jsxDEV("div", {
								className: "hero-item",
								children: [/* @__PURE__ */ _jsxDEV("h3", { children: "Smart Booking" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 292,
									columnNumber: 15
								}, this), /* @__PURE__ */ _jsxDEV("p", { children: "Reserve venues and resources without delays." }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 293,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 291,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ _jsxDEV("div", {
								className: "hero-item",
								children: [/* @__PURE__ */ _jsxDEV("h3", { children: "Maintenance" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 296,
									columnNumber: 15
								}, this), /* @__PURE__ */ _jsxDEV("p", { children: "Track and manage maintenance tickets quickly." }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 297,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 295,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ _jsxDEV("div", {
								className: "hero-item",
								children: [/* @__PURE__ */ _jsxDEV("h3", { children: "Resources" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 300,
									columnNumber: 15
								}, this), /* @__PURE__ */ _jsxDEV("p", { children: "Handle campus inventory with clarity." }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 301,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 299,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ _jsxDEV("div", {
								className: "hero-item",
								children: [/* @__PURE__ */ _jsxDEV("h3", { children: "Notifications" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 304,
									columnNumber: 15
								}, this), /* @__PURE__ */ _jsxDEV("p", { children: "Stay updated with real-time campus events." }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 305,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 303,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 290,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 280,
				columnNumber: 9
			}, this), /* @__PURE__ */ _jsxDEV("article", {
				className: "auth-card",
				children: [
					/* @__PURE__ */ _jsxDEV("button", {
						type: "button",
						className: "auth-back-link",
						onClick: () => navigate("/"),
						children: "Back"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 311,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ _jsxDEV("h2", { children: "Welcome Back" }, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 315,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ _jsxDEV("p", {
						className: "auth-note",
						children: "Sign in to access your Smart Campus dashboard."
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 316,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ _jsxDEV("form", {
						className: "local-login-form",
						onSubmit: loginWithLocal,
						children: [
							/* @__PURE__ */ _jsxDEV("div", {
								className: "form-group",
								children: [/* @__PURE__ */ _jsxDEV("label", {
									htmlFor: "username",
									children: "Username or Email"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 320,
									columnNumber: 15
								}, this), /* @__PURE__ */ _jsxDEV("input", {
									type: "text",
									id: "username",
									value: username,
									onChange: (e) => setUsername(e.target.value),
									placeholder: "Enter your username",
									disabled: loading,
									required: true
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 321,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 319,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ _jsxDEV("div", {
								className: "form-group",
								children: [/* @__PURE__ */ _jsxDEV("label", {
									htmlFor: "password",
									children: "Password"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 332,
									columnNumber: 15
								}, this), /* @__PURE__ */ _jsxDEV("input", {
									type: "password",
									id: "password",
									value: password,
									onChange: (e) => setPassword(e.target.value),
									placeholder: "Enter your password",
									disabled: loading,
									required: true
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 333,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 331,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ _jsxDEV("button", {
								type: "submit",
								className: "login-btn btn-primary",
								disabled: loading,
								children: loading ? "Signing in..." : "Sign In"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 343,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 318,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ _jsxDEV("div", {
						className: "auth-divider",
						children: /* @__PURE__ */ _jsxDEV("span", { children: "or continue with" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 349,
							columnNumber: 13
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 348,
						columnNumber: 11
					}, this),
					googleClientId ? /* @__PURE__ */ _jsxDEV("div", {
						className: "google-button-container",
						children: /* @__PURE__ */ _jsxDEV(GoogleLoginButton, {
							clientId: googleClientId,
							onCredential: loginWithGoogle,
							onError: (errorText) => {
								const nextMessage = typeof errorText === "string" && errorText.trim() ? errorText : "Google sign-in failed.";
								setMessage(nextMessage);
								showError("Google sign-in error", nextMessage);
							}
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 354,
							columnNumber: 15
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 353,
						columnNumber: 13
					}, this) : /* @__PURE__ */ _jsxDEV("p", {
						className: "warning",
						children: "Add VITE_GOOGLE_CLIENT_ID to .env so Google button can render."
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 368,
						columnNumber: 13
					}, this),
					/* @__PURE__ */ _jsxDEV("p", {
						className: "status",
						children: message
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 371,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ _jsxDEV("p", {
						className: "auth-register-link",
						children: ["Don't have an account? ", /* @__PURE__ */ _jsxDEV("button", {
							type: "button",
							onClick: () => navigate("/register"),
							className: "btn-link",
							children: "Register here"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 374,
							columnNumber: 36
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 373,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 310,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 279,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 278,
		columnNumber: 5
	}, this);
}
_s(LoginPage, "uVpWH7pC0ktUYD4/pHdsk44IQ18=", false, function() {
	return [useNavigate];
});
_c = LoginPage;
var _c;
$RefreshReg$(_c, "LoginPage");
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
import * as __vite_react_currentExports from "/src/components/auth/Login/LoginPage.jsx";
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }

  const currentExports = __vite_react_currentExports;
  queueMicrotask(() => {
    RefreshRuntime.registerExportsForReactRefresh("C:/Users/DELL/Desktop/Smart_Campus_Hub/frontend/src/components/auth/Login/LoginPage.jsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("C:/Users/DELL/Desktop/Smart_Campus_Hub/frontend/src/components/auth/Login/LoginPage.jsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
function $RefreshReg$(type, id) { return RefreshRuntime.register(type, "C:/Users/DELL/Desktop/Smart_Campus_Hub/frontend/src/components/auth/Login/LoginPage.jsx" + ' ' + id); }
function $RefreshSig$() { return RefreshRuntime.createSignatureFunctionForTransform(); }

//# sourceMappingURL=data:application/json;base64,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LFdBQVU7Z0JBQVU7TUFBa0U7Ozs7O0tBRzNGLHdCQUFDLEtBQUQ7TUFBRyxXQUFVO2dCQUFVO01BQVk7Ozs7O0tBRW5DLHdCQUFDLEtBQUQ7TUFBRyxXQUFVO2dCQUFiLENBQWtDLDJCQUNULHdCQUFDLFVBQUQ7T0FBUSxNQUFLO09BQVMsZUFBZSxTQUFTLFlBQVk7T0FBRSxXQUFVO2lCQUFXO09BQXNCOzs7O2VBQzVIOzs7Ozs7S0FFSTs7Ozs7WUFDRjs7Ozs7O0VBQ0w7Ozs7Ozs7O0VBRVYiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiTG9naW5QYWdlLmpzeCJdLCJ2ZXJzaW9uIjozLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xyXG5pbXBvcnQgeyB1c2VOYXZpZ2F0ZSB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nXHJcbmltcG9ydCBHb29nbGVMb2dpbkJ1dHRvbiBmcm9tICcuLi9Hb29nbGVMb2dpbkJ1dHRvbidcclxuaW1wb3J0IHsgY2xvc2VBbGVydCwgc2hvd0Vycm9yLCBzaG93SW5mbywgc2hvd1J1bm5pbmcsIHNob3dTdWNjZXNzIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvYWxlcnRzJ1xyXG5pbXBvcnQgJy4vTG9naW5QYWdlLmNzcydcclxuXHJcbmZ1bmN0aW9uIGV4dHJhY3RHb29nbGVQcm9maWxlRnJvbUp3dChpZFRva2VuKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHBheWxvYWRCYXNlNjQgPSBpZFRva2VuLnNwbGl0KCcuJylbMV1cclxuICAgIGlmICghcGF5bG9hZEJhc2U2NCkge1xyXG4gICAgICByZXR1cm4geyBlbWFpbDogJycsIG5hbWU6ICcnLCBwaWN0dXJlOiAnJyB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcGF5bG9hZEpzb24gPSBhdG9iKHBheWxvYWRCYXNlNjQucmVwbGFjZSgvLS9nLCAnKycpLnJlcGxhY2UoL18vZywgJy8nKSlcclxuICAgIGNvbnN0IHBheWxvYWQgPSBKU09OLnBhcnNlKHBheWxvYWRKc29uKVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZW1haWw6IHR5cGVvZiBwYXlsb2FkPy5lbWFpbCA9PT0gJ3N0cmluZycgPyBwYXlsb2FkLmVtYWlsLnRyaW0oKS50b0xvd2VyQ2FzZSgpIDogJycsXHJcbiAgICAgIG5hbWU6IHR5cGVvZiBwYXlsb2FkPy5uYW1lID09PSAnc3RyaW5nJyA/IHBheWxvYWQubmFtZS50cmltKCkgOiAnJyxcclxuICAgICAgcGljdHVyZTogdHlwZW9mIHBheWxvYWQ/LnBpY3R1cmUgPT09ICdzdHJpbmcnID8gcGF5bG9hZC5waWN0dXJlLnRyaW0oKSA6ICcnLFxyXG4gICAgfVxyXG4gIH0gY2F0Y2gge1xyXG4gICAgcmV0dXJuIHsgZW1haWw6ICcnLCBuYW1lOiAnJywgcGljdHVyZTogJycgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTG9naW5QYWdlKCkge1xyXG4gIGNvbnN0IG5hdmlnYXRlID0gdXNlTmF2aWdhdGUoKVxyXG5cclxuICBjb25zdCBbbWVzc2FnZSwgc2V0TWVzc2FnZV0gPSB1c2VTdGF0ZSgnJylcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcclxuICBjb25zdCBbdXNlcm5hbWUsIHNldFVzZXJuYW1lXSA9IHVzZVN0YXRlKCcnKVxyXG4gIGNvbnN0IFtwYXNzd29yZCwgc2V0UGFzc3dvcmRdID0gdXNlU3RhdGUoJycpXHJcblxyXG4gIGNvbnN0IGJhY2tlbmRCYXNlVXJsID0gaW1wb3J0Lm1ldGEuZW52LlZJVEVfQVBJX0JBU0VfVVJMID8/ICdodHRwOi8vbG9jYWxob3N0OjgwODAvYXBpJ1xyXG4gIGNvbnN0IGdvb2dsZUNsaWVudElkID0gaW1wb3J0Lm1ldGEuZW52LlZJVEVfR09PR0xFX0NMSUVOVF9JRCA/PyAnJ1xyXG5cclxuICBhc3luYyBmdW5jdGlvbiBsb2dpbldpdGhHb29nbGUoaWRUb2tlbikge1xyXG4gICAgc2V0TG9hZGluZyh0cnVlKVxyXG4gICAgc2V0TWVzc2FnZSgnQ2hlY2tpbmcgR29vZ2xlIGxvZ2luIHdpdGggYmFja2VuZC4uLicpXHJcbiAgICBzaG93UnVubmluZygnU2lnbmluZyBpbicsICdDaGVja2luZyBHb29nbGUgbG9naW4uLi4nKVxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHtiYWNrZW5kQmFzZVVybH0vYXV0aC9nb29nbGVgLCB7XHJcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBpZFRva2VuIH0pLFxyXG4gICAgICB9KVxyXG5cclxuICAgICAgY29uc3QgY29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykgfHwgJydcclxuICAgICAgbGV0IGRhdGEgPSB7fVxyXG4gICAgICBpZiAoY29udGVudFR5cGUuaW5jbHVkZXMoJ2FwcGxpY2F0aW9uL2pzb24nKSkge1xyXG4gICAgICAgIGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKClcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCByYXdCb2R5ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpXHJcbiAgICAgICAgZGF0YSA9IHJhd0JvZHkgPyB7IG1lc3NhZ2U6IHJhd0JvZHkgfSA6IHt9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YT8ubWVzc2FnZSA/PyAnR29vZ2xlIGF1dGggZmFpbGVkLicpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGdvb2dsZVByb2ZpbGUgPSBleHRyYWN0R29vZ2xlUHJvZmlsZUZyb21Kd3QoaWRUb2tlbilcclxuICAgICAgY29uc3QgZ29vZ2xlRW1haWwgPSBnb29nbGVQcm9maWxlLmVtYWlsXHJcbiAgICAgIGNvbnN0IGJhY2tlbmRFbWFpbCA9IHR5cGVvZiBkYXRhPy5lbWFpbCA9PT0gJ3N0cmluZycgPyBkYXRhLmVtYWlsLnRyaW0oKS50b0xvd2VyQ2FzZSgpIDogJydcclxuICAgICAgY29uc3QgZWZmZWN0aXZlRW1haWwgPSBnb29nbGVFbWFpbCB8fCBiYWNrZW5kRW1haWxcclxuICAgICAgY29uc3QgYmFja2VuZFJvbGUgPSBTdHJpbmcoZGF0YT8ucm9sZSA/PyAnJykudG9VcHBlckNhc2UoKVxyXG4gICAgICBpZiAoIWRhdGE/LnRva2VuKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGRhdGE/Lm1lc3NhZ2UgPz8gJ0dvb2dsZSBhdXRoIGZhaWxlZC4nKVxyXG4gICAgICB9XHJcbiAgICAgIC8vIFRydXN0IHRoZSBiYWNrZW5kIHJvbGUgYXNzaWdubWVudCAoYWRtaW4gZW1haWwgaXMgbm93IGNvbmZpZ3VyZWQgc2VydmVyLXNpZGUpXHJcbiAgICAgIGNvbnN0IHJvbGUgPSBiYWNrZW5kUm9sZSA9PT0gJ0FETUlOJyA/ICdBRE1JTicgOiAnVVNFUidcclxuICAgICAgLy8gQmFja2VuZCBibG9ja3MgcGVuZGluZyB1c2VycyBiZWZvcmUgaXNzdWluZyB0b2tlbi4gSWYgYXBwcm92ZWQgaXMgb21pdHRlZCwgdHJlYXQgYXMgYXBwcm92ZWQuXHJcbiAgICAgIGNvbnN0IGFwcHJvdmVkID0gdHlwZW9mIGRhdGE/LmFwcHJvdmVkID09PSAnYm9vbGVhbicgPyBkYXRhLmFwcHJvdmVkIDogdHJ1ZVxyXG4gICAgICBjb25zdCBzYXZlZFVzZXJuYW1lID0gZGF0YT8udXNlcm5hbWUgPz8gZ29vZ2xlUHJvZmlsZS5uYW1lID8/IGVmZmVjdGl2ZUVtYWlsID8/ICcnXHJcblxyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndG9rZW4nLCBkYXRhLnRva2VuKVxyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYXV0aFRva2VuJywgZGF0YS50b2tlbilcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3JvbGUnLCByb2xlKVxyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYXV0aFJvbGUnLCByb2xlKVxyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYXV0aEFwcHJvdmVkJywgU3RyaW5nKGFwcHJvdmVkKSlcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VzZXJuYW1lJywgc2F2ZWRVc2VybmFtZSlcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2F1dGhMb2dpblR5cGUnLCAnZ29vZ2xlJylcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2F1dGhFbWFpbCcsIGVmZmVjdGl2ZUVtYWlsKVxyXG4gICAgICBpZiAoZ29vZ2xlUHJvZmlsZS5waWN0dXJlKSB7XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2F1dGhBdmF0YXJVcmwnLCBnb29nbGVQcm9maWxlLnBpY3R1cmUpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2F1dGhBdmF0YXJVcmwnKVxyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXQgZWZmZWN0aXZlUm9sZSA9IHJvbGVcclxuICAgICAgbGV0IGVmZmVjdGl2ZUFwcHJvdmVkID0gYXBwcm92ZWRcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCB2ZXJpZnlSZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke2JhY2tlbmRCYXNlVXJsfS91c2VyL21lYCwge1xyXG4gICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7ZGF0YS50b2tlbn1gLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBjb25zdCB2ZXJpZnlEYXRhID0gYXdhaXQgdmVyaWZ5UmVzcG9uc2UuanNvbigpXHJcbiAgICAgICAgaWYgKHZlcmlmeVJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICAgICBjb25zdCB2ZXJpZnlSb2xlID0gU3RyaW5nKHZlcmlmeURhdGE/LnJvbGUgPz8gZWZmZWN0aXZlUm9sZSkudG9VcHBlckNhc2UoKVxyXG4gICAgICAgICAgY29uc3QgdmVyaWZ5QXBwcm92ZWQgPSB0eXBlb2YgdmVyaWZ5RGF0YT8uYXBwcm92ZWQgPT09ICdib29sZWFuJyA/IHZlcmlmeURhdGEuYXBwcm92ZWQgOiBlZmZlY3RpdmVBcHByb3ZlZFxyXG5cclxuICAgICAgICAgIGVmZmVjdGl2ZVJvbGUgPSB2ZXJpZnlSb2xlID09PSAnQURNSU4nID8gJ0FETUlOJyA6ICdVU0VSJ1xyXG4gICAgICAgICAgZWZmZWN0aXZlQXBwcm92ZWQgPSBlZmZlY3RpdmVSb2xlID09PSAnQURNSU4nID8gdHJ1ZSA6IHZlcmlmeUFwcHJvdmVkXHJcblxyXG4gICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3JvbGUnLCBlZmZlY3RpdmVSb2xlKVxyXG4gICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2F1dGhSb2xlJywgZWZmZWN0aXZlUm9sZSlcclxuICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhdXRoQXBwcm92ZWQnLCBTdHJpbmcoZWZmZWN0aXZlQXBwcm92ZWQpKVxyXG4gICAgICAgICAgaWYgKHZlcmlmeURhdGE/LnVzZXJuYW1lKSB7XHJcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1c2VybmFtZScsIFN0cmluZyh2ZXJpZnlEYXRhLnVzZXJuYW1lKSlcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICh0eXBlb2YgdmVyaWZ5RGF0YT8uZW1haWwgPT09ICdzdHJpbmcnICYmIHZlcmlmeURhdGEuZW1haWwudHJpbSgpKSB7XHJcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhdXRoRW1haWwnLCB2ZXJpZnlEYXRhLmVtYWlsLnRyaW0oKS50b0xvd2VyQ2FzZSgpKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2F1dGhMb2dpblR5cGUnLCAnZ29vZ2xlJylcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIC8vIElmIC91c2VyL21lIGZhaWxzLCBmYWxsYmFjayB0byBhdXRoIHJlc3BvbnNlIHZhbHVlcy5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFlZmZlY3RpdmVBcHByb3ZlZCkge1xyXG4gICAgICAgIHNldE1lc3NhZ2UoJ1lvdXIgYWNjb3VudCBpcyBwZW5kaW5nIGFkbWluIGFwcHJvdmFsLiBSZWRpcmVjdGluZy4uLicpXHJcbiAgICAgICAgY2xvc2VBbGVydCgpXHJcbiAgICAgICAgc2hvd0luZm8oJ1BlbmRpbmcgYXBwcm92YWwnLCAnWW91ciBhY2NvdW50IGlzIHdhaXRpbmcgZm9yIGFkbWluIGFwcHJvdmFsLicpXHJcbiAgICAgICAgbmF2aWdhdGUoJy91bmF1dGhvcml6ZWQnLCB7IHJlcGxhY2U6IHRydWUgfSlcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGVmZmVjdGl2ZVJvbGUgPT09ICdBRE1JTicpIHtcclxuICAgICAgICBzZXRNZXNzYWdlKCdBZG1pbiBsb2dpbiBzdWNjZXNzZnVsLiBSZWRpcmVjdGluZy4uLicpXHJcbiAgICAgICAgY2xvc2VBbGVydCgpXHJcbiAgICAgICAgYXdhaXQgc2hvd1N1Y2Nlc3MoJ0FkbWluIGxvZ2luIHN1Y2Nlc3NmdWwnLCAnV2VsY29tZSB0byB5b3VyIGRhc2hib2FyZC4nKVxyXG4gICAgICAgIG5hdmlnYXRlKCcvYWRtaW4tZGFzaGJvYXJkJywgeyByZXBsYWNlOiB0cnVlIH0pXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNldE1lc3NhZ2UoJ0xvZ2luIHN1Y2Nlc3NmdWwuIFJlZGlyZWN0aW5nLi4uJylcclxuICAgICAgY2xvc2VBbGVydCgpXHJcbiAgICAgIGF3YWl0IHNob3dTdWNjZXNzKCdMb2dpbiBzdWNjZXNzZnVsJywgJ1dlbGNvbWUgYmFjay4nKVxyXG4gICAgICBuYXZpZ2F0ZSgnL2Rhc2hib2FyZCcpXHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdHb29nbGUgYXV0aCBmYWlsZWQuJ1xyXG4gICAgICBcclxuICAgICAgY29uc3QgaXNQZW5kaW5nID0gZXJyb3JNZXNzYWdlLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ3BlbmRpbmcnKVxyXG4gICAgICBjb25zdCBpc1N1c3BlbmRlZCA9IGVycm9yTWVzc2FnZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdzdXNwZW5kZWQnKVxyXG4gICAgICBcclxuICAgICAgaWYgKGlzUGVuZGluZyB8fCBpc1N1c3BlbmRlZCkge1xyXG4gICAgICAgIGNvbnN0IGdvb2dsZVByb2ZpbGUgPSBleHRyYWN0R29vZ2xlUHJvZmlsZUZyb21Kd3QoaWRUb2tlbilcclxuICAgICAgICBjb25zdCBnb29nbGVFbWFpbCA9IGdvb2dsZVByb2ZpbGUuZW1haWxcclxuICAgICAgICBpZiAoZ29vZ2xlUHJvZmlsZS5uYW1lKSB7XHJcbiAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndXNlcm5hbWUnLCBnb29nbGVQcm9maWxlLm5hbWUpXHJcbiAgICAgICAgfSBlbHNlIGlmIChnb29nbGVFbWFpbCkge1xyXG4gICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VzZXJuYW1lJywgZ29vZ2xlRW1haWwuc3BsaXQoJ0AnKVswXSB8fCBnb29nbGVFbWFpbClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGdvb2dsZVByb2ZpbGUucGljdHVyZSkge1xyXG4gICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2F1dGhBdmF0YXJVcmwnLCBnb29nbGVQcm9maWxlLnBpY3R1cmUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChnb29nbGVFbWFpbCkge1xyXG4gICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2F1dGhFbWFpbCcsIGdvb2dsZUVtYWlsKVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAoaXNTdXNwZW5kZWQpIHtcclxuICAgICAgICAgIHNldE1lc3NhZ2UoJ1lvdXIgYWNjb3VudCBpcyBzdXNwZW5kZWQuIFJlZGlyZWN0aW5nLi4uJylcclxuICAgICAgICAgIGNsb3NlQWxlcnQoKVxyXG4gICAgICAgICAgc2hvd0luZm8oJ0FjY291bnQgc3VzcGVuZGVkJywgJ1lvdXIgYWNjb3VudCBoYXMgYmVlbiBzdXNwZW5kZWQuIENvbnRhY3QgYWRtaW5pc3RyYXRpb24gZm9yIGhlbHAuJylcclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gbmF2aWdhdGUoJy9zdXNwZW5kZWQnLCB7IHJlcGxhY2U6IHRydWUgfSksIDE1MDApXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNldE1lc3NhZ2UoJ1lvdXIgYWNjb3VudCBpcyBwZW5kaW5nIGFkbWluIGFwcHJvdmFsLiBSZWRpcmVjdGluZy4uLicpXHJcbiAgICAgICAgICBjbG9zZUFsZXJ0KClcclxuICAgICAgICAgIHNob3dJbmZvKCdQZW5kaW5nIGFwcHJvdmFsJywgJ1lvdXIgYWNjb3VudCBpcyB3YWl0aW5nIGZvciBhZG1pbiBhcHByb3ZhbC4nKVxyXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiBuYXZpZ2F0ZSgnL3VuYXV0aG9yaXplZCcsIHsgcmVwbGFjZTogdHJ1ZSB9KSwgMTUwMClcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNldE1lc3NhZ2UoZXJyb3JNZXNzYWdlKVxyXG4gICAgICBjbG9zZUFsZXJ0KClcclxuICAgICAgc2hvd0Vycm9yKCdMb2dpbiBmYWlsZWQnLCBlcnJvck1lc3NhZ2UpXHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gbG9naW5XaXRoTG9jYWwoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICBpZiAoIXVzZXJuYW1lLnRyaW0oKSB8fCAhcGFzc3dvcmQudHJpbSgpKSB7XHJcbiAgICAgIHNldE1lc3NhZ2UoJ1BsZWFzZSBlbnRlciBib3RoIHVzZXJuYW1lIGFuZCBwYXNzd29yZC4nKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBzZXRMb2FkaW5nKHRydWUpXHJcbiAgICBzZXRNZXNzYWdlKCdTaWduaW5nIGluLi4uJylcclxuICAgIHNob3dSdW5uaW5nKCdTaWduaW5nIGluJywgJ1ZhbGlkYXRpbmcgY3JlZGVudGlhbHMuLi4nKVxyXG4gICAgXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke2JhY2tlbmRCYXNlVXJsfS9hdXRoL2xvZ2luYCwge1xyXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgdXNlcm5hbWU6IHVzZXJuYW1lLnRyaW0oKSwgcGFzc3dvcmQgfSksXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBjb25zdCBjb250ZW50VHlwZSA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSB8fCAnJ1xyXG4gICAgICBsZXQgZGF0YSA9IHt9XHJcbiAgICAgIGlmIChjb250ZW50VHlwZS5pbmNsdWRlcygnYXBwbGljYXRpb24vanNvbicpKSB7XHJcbiAgICAgICAgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IHJhd0JvZHkgPSBhd2FpdCByZXNwb25zZS50ZXh0KClcclxuICAgICAgICBkYXRhID0gcmF3Qm9keSA/IHsgbWVzc2FnZTogcmF3Qm9keSB9IDoge31cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihkYXRhPy5tZXNzYWdlID8/ICdMb2dpbiBmYWlsZWQuJylcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3Qgcm9sZSA9IFN0cmluZyhkYXRhPy5yb2xlID8/ICdVU0VSJykudG9VcHBlckNhc2UoKVxyXG4gICAgICBjb25zdCBhcHByb3ZlZCA9IHR5cGVvZiBkYXRhPy5hcHByb3ZlZCA9PT0gJ2Jvb2xlYW4nID8gZGF0YS5hcHByb3ZlZCA6IHRydWVcclxuXHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0b2tlbicsIGRhdGEudG9rZW4pXHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhdXRoVG9rZW4nLCBkYXRhLnRva2VuKVxyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncm9sZScsIHJvbGUpXHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhdXRoUm9sZScsIHJvbGUpXHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhdXRoQXBwcm92ZWQnLCBTdHJpbmcoYXBwcm92ZWQpKVxyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndXNlcm5hbWUnLCBkYXRhLnVzZXJuYW1lID8/IHVzZXJuYW1lKVxyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYXV0aEVtYWlsJywgZGF0YS5lbWFpbCA/PyB1c2VybmFtZSlcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2F1dGhMb2dpblR5cGUnLCAnbG9jYWwnKVxyXG5cclxuICAgICAgaWYgKCFhcHByb3ZlZCkge1xyXG4gICAgICAgIHNldE1lc3NhZ2UoJ1lvdXIgYWNjb3VudCBpcyBwZW5kaW5nIGFkbWluIGFwcHJvdmFsLicpXHJcbiAgICAgICAgY2xvc2VBbGVydCgpXHJcbiAgICAgICAgc2hvd0luZm8oJ1BlbmRpbmcgYXBwcm92YWwnLCAnWW91ciBhY2NvdW50IGlzIHdhaXRpbmcgZm9yIGFkbWluIGFwcHJvdmFsLicpXHJcbiAgICAgICAgbmF2aWdhdGUoJy91bmF1dGhvcml6ZWQnLCB7IHJlcGxhY2U6IHRydWUgfSlcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHJvbGUgPT09ICdBRE1JTicpIHtcclxuICAgICAgICBzZXRNZXNzYWdlKCdBZG1pbiBsb2dpbiBzdWNjZXNzZnVsLicpXHJcbiAgICAgICAgY2xvc2VBbGVydCgpXHJcbiAgICAgICAgYXdhaXQgc2hvd1N1Y2Nlc3MoJ0FkbWluIGxvZ2luIHN1Y2Nlc3NmdWwnLCAnV2VsY29tZSB0byB5b3VyIGRhc2hib2FyZC4nKVxyXG4gICAgICAgIG5hdmlnYXRlKCcvYWRtaW4tZGFzaGJvYXJkJywgeyByZXBsYWNlOiB0cnVlIH0pXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNldE1lc3NhZ2UoJ0xvZ2luIHN1Y2Nlc3NmdWwuJylcclxuICAgICAgY2xvc2VBbGVydCgpXHJcbiAgICAgIGF3YWl0IHNob3dTdWNjZXNzKCdMb2dpbiBzdWNjZXNzZnVsJywgJ1dlbGNvbWUgYmFjay4nKVxyXG4gICAgICBuYXZpZ2F0ZSgnL2Rhc2hib2FyZCcpXHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdMb2dpbiBmYWlsZWQuJ1xyXG4gICAgICBcclxuICAgICAgY29uc3QgaXNTdXNwZW5kZWQgPSBlcnJvck1lc3NhZ2UudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnc3VzcGVuZGVkJylcclxuICAgICAgY29uc3QgaXNQZW5kaW5nID0gZXJyb3JNZXNzYWdlLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ3BlbmRpbmcnKVxyXG4gICAgICBcclxuICAgICAgaWYgKGlzU3VzcGVuZGVkIHx8IGlzUGVuZGluZykge1xyXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1c2VybmFtZScsIHVzZXJuYW1lKVxyXG4gICAgICAgIGlmIChpc1N1c3BlbmRlZCkge1xyXG4gICAgICAgICAgc2V0TWVzc2FnZSgnWW91ciBhY2NvdW50IGlzIHN1c3BlbmRlZC4nKVxyXG4gICAgICAgICAgY2xvc2VBbGVydCgpXHJcbiAgICAgICAgICBzaG93SW5mbygnQWNjb3VudCBzdXNwZW5kZWQnLCAnWW91ciBhY2NvdW50IGhhcyBiZWVuIHN1c3BlbmRlZC4gQ29udGFjdCBhZG1pbmlzdHJhdGlvbi4nKVxyXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiBuYXZpZ2F0ZSgnL3N1c3BlbmRlZCcsIHsgcmVwbGFjZTogdHJ1ZSB9KSwgMTUwMClcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2V0TWVzc2FnZSgnWW91ciBhY2NvdW50IGlzIHBlbmRpbmcgYWRtaW4gYXBwcm92YWwuJylcclxuICAgICAgICAgIGNsb3NlQWxlcnQoKVxyXG4gICAgICAgICAgc2hvd0luZm8oJ1BlbmRpbmcgYXBwcm92YWwnLCAnWW91ciBhY2NvdW50IGlzIHdhaXRpbmcgZm9yIGFkbWluIGFwcHJvdmFsLicpXHJcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IG5hdmlnYXRlKCcvdW5hdXRob3JpemVkJywgeyByZXBsYWNlOiB0cnVlIH0pLCAxNTAwKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgc2V0TWVzc2FnZShlcnJvck1lc3NhZ2UpXHJcbiAgICAgIGNsb3NlQWxlcnQoKVxyXG4gICAgICBzaG93RXJyb3IoJ0xvZ2luIGZhaWxlZCcsIGVycm9yTWVzc2FnZSlcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPG1haW4gY2xhc3NOYW1lPVwiYXV0aC1wYWdlXCI+XHJcbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cImF1dGgtbGF5b3V0XCI+XHJcbiAgICAgICAgPGFydGljbGUgY2xhc3NOYW1lPVwiYXV0aC1oZXJvXCI+XHJcbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJjaGlwXCI+U21hcnQgQ2FtcHVzPC9wPlxyXG4gICAgICAgICAgPGgxPlxyXG4gICAgICAgICAgICBDYW1wdXMgTWFuYWdlbWVudCxcclxuICAgICAgICAgICAgPHNwYW4+IFNpbXBsaWZpZWQ8L3NwYW4+XHJcbiAgICAgICAgICA8L2gxPlxyXG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwic3VidGl0bGVcIj5cclxuICAgICAgICAgICAgQSBjb21wcmVoZW5zaXZlIHBsYXRmb3JtIGZvciByZXNvdXJjZXMsIGJvb2tpbmdzLCBtYWludGVuYW5jZSwgYW5kIGFubm91bmNlbWVudHMgYWNyb3NzIGNhbXB1cy5cclxuICAgICAgICAgIDwvcD5cclxuXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImhlcm8tZ3JpZFwiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImhlcm8taXRlbVwiPlxyXG4gICAgICAgICAgICAgIDxoMz5TbWFydCBCb29raW5nPC9oMz5cclxuICAgICAgICAgICAgICA8cD5SZXNlcnZlIHZlbnVlcyBhbmQgcmVzb3VyY2VzIHdpdGhvdXQgZGVsYXlzLjwvcD5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaGVyby1pdGVtXCI+XHJcbiAgICAgICAgICAgICAgPGgzPk1haW50ZW5hbmNlPC9oMz5cclxuICAgICAgICAgICAgICA8cD5UcmFjayBhbmQgbWFuYWdlIG1haW50ZW5hbmNlIHRpY2tldHMgcXVpY2tseS48L3A+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImhlcm8taXRlbVwiPlxyXG4gICAgICAgICAgICAgIDxoMz5SZXNvdXJjZXM8L2gzPlxyXG4gICAgICAgICAgICAgIDxwPkhhbmRsZSBjYW1wdXMgaW52ZW50b3J5IHdpdGggY2xhcml0eS48L3A+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImhlcm8taXRlbVwiPlxyXG4gICAgICAgICAgICAgIDxoMz5Ob3RpZmljYXRpb25zPC9oMz5cclxuICAgICAgICAgICAgICA8cD5TdGF5IHVwZGF0ZWQgd2l0aCByZWFsLXRpbWUgY2FtcHVzIGV2ZW50cy48L3A+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9hcnRpY2xlPlxyXG5cclxuICAgICAgICA8YXJ0aWNsZSBjbGFzc05hbWU9XCJhdXRoLWNhcmRcIj5cclxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImF1dGgtYmFjay1saW5rXCIgb25DbGljaz17KCkgPT4gbmF2aWdhdGUoJy8nKX0+XHJcbiAgICAgICAgICAgIEJhY2tcclxuICAgICAgICAgIDwvYnV0dG9uPlxyXG5cclxuICAgICAgICAgIDxoMj5XZWxjb21lIEJhY2s8L2gyPlxyXG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwiYXV0aC1ub3RlXCI+U2lnbiBpbiB0byBhY2Nlc3MgeW91ciBTbWFydCBDYW1wdXMgZGFzaGJvYXJkLjwvcD5cclxuXHJcbiAgICAgICAgICA8Zm9ybSBjbGFzc05hbWU9XCJsb2NhbC1sb2dpbi1mb3JtXCIgb25TdWJtaXQ9e2xvZ2luV2l0aExvY2FsfT5cclxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgPGxhYmVsIGh0bWxGb3I9XCJ1c2VybmFtZVwiPlVzZXJuYW1lIG9yIEVtYWlsPC9sYWJlbD5cclxuICAgICAgICAgICAgICA8aW5wdXRcclxuICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcclxuICAgICAgICAgICAgICAgIGlkPVwidXNlcm5hbWVcIlxyXG4gICAgICAgICAgICAgICAgdmFsdWU9e3VzZXJuYW1lfVxyXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRVc2VybmFtZShlLnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkVudGVyIHlvdXIgdXNlcm5hbWVcIlxyXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2xvYWRpbmd9XHJcbiAgICAgICAgICAgICAgICByZXF1aXJlZFxyXG4gICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIj5cclxuICAgICAgICAgICAgICA8bGFiZWwgaHRtbEZvcj1cInBhc3N3b3JkXCI+UGFzc3dvcmQ8L2xhYmVsPlxyXG4gICAgICAgICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcclxuICAgICAgICAgICAgICAgIGlkPVwicGFzc3dvcmRcIlxyXG4gICAgICAgICAgICAgICAgdmFsdWU9e3Bhc3N3b3JkfVxyXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRQYXNzd29yZChlLnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkVudGVyIHlvdXIgcGFzc3dvcmRcIlxyXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2xvYWRpbmd9XHJcbiAgICAgICAgICAgICAgICByZXF1aXJlZFxyXG4gICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzc05hbWU9XCJsb2dpbi1idG4gYnRuLXByaW1hcnlcIiBkaXNhYmxlZD17bG9hZGluZ30+XHJcbiAgICAgICAgICAgICAge2xvYWRpbmcgPyAnU2lnbmluZyBpbi4uLicgOiAnU2lnbiBJbid9XHJcbiAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9mb3JtPlxyXG5cclxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXV0aC1kaXZpZGVyXCI+XHJcbiAgICAgICAgICAgIDxzcGFuPm9yIGNvbnRpbnVlIHdpdGg8L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICB7Z29vZ2xlQ2xpZW50SWQgPyAoXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ29vZ2xlLWJ1dHRvbi1jb250YWluZXJcIj5cclxuICAgICAgICAgICAgICA8R29vZ2xlTG9naW5CdXR0b25cclxuICAgICAgICAgICAgICAgIGNsaWVudElkPXtnb29nbGVDbGllbnRJZH1cclxuICAgICAgICAgICAgICAgIG9uQ3JlZGVudGlhbD17bG9naW5XaXRoR29vZ2xlfVxyXG4gICAgICAgICAgICAgICAgb25FcnJvcj17KGVycm9yVGV4dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICBjb25zdCBuZXh0TWVzc2FnZSA9XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGVycm9yVGV4dCA9PT0gJ3N0cmluZycgJiYgZXJyb3JUZXh0LnRyaW0oKVxyXG4gICAgICAgICAgICAgICAgICAgICAgPyBlcnJvclRleHRcclxuICAgICAgICAgICAgICAgICAgICAgIDogJ0dvb2dsZSBzaWduLWluIGZhaWxlZC4nXHJcbiAgICAgICAgICAgICAgICAgIHNldE1lc3NhZ2UobmV4dE1lc3NhZ2UpXHJcbiAgICAgICAgICAgICAgICAgIHNob3dFcnJvcignR29vZ2xlIHNpZ24taW4gZXJyb3InLCBuZXh0TWVzc2FnZSlcclxuICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICApIDogKFxyXG4gICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3YXJuaW5nXCI+QWRkIFZJVEVfR09PR0xFX0NMSUVOVF9JRCB0byAuZW52IHNvIEdvb2dsZSBidXR0b24gY2FuIHJlbmRlci48L3A+XHJcbiAgICAgICAgICApfVxyXG5cclxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInN0YXR1c1wiPnttZXNzYWdlfTwvcD5cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwiYXV0aC1yZWdpc3Rlci1saW5rXCI+XHJcbiAgICAgICAgICAgIERvbid0IGhhdmUgYW4gYWNjb3VudD8gPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gbmF2aWdhdGUoJy9yZWdpc3RlcicpfSBjbGFzc05hbWU9XCJidG4tbGlua1wiPlJlZ2lzdGVyIGhlcmU8L2J1dHRvbj5cclxuICAgICAgICAgIDwvcD5cclxuXHJcbiAgICAgICAgPC9hcnRpY2xlPlxyXG4gICAgICA8L3NlY3Rpb24+XHJcbiAgICA8L21haW4+XHJcbiAgKVxyXG59XHJcbiJdfQ==