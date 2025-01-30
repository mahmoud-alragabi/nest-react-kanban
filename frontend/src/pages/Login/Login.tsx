import React, { useState } from "react";
import { Link } from "react-router-dom";
import TextField from "../../components/TextField/TextField";
import LoadingButton from "../../components/LoadingButton/LoadingButton";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";

interface LoginResponse {
  access_token?: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Invalid credentials");
        return;
      }

      const data: LoginResponse = await response.json();
      if (data.access_token) {
        console.log(data.access_token);
        // Save token to localStorage or a global auth store
        // localStorage.setItem("token", data.access_token);
        // Optionally navigate to another route, e.g.:
        // navigate("/boards");
      }
    } catch (error) {
      setErrorMessage("Server error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded">
        <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>

        <ErrorMessage>{errorMessage}</ErrorMessage>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            id="email"
            type="email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField
            label="Password"
            id="password"
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            wrapperClassName="mb-6"
            required
          />

          <LoadingButton
            type="submit"
            loading={loading}
            loadingText="Logging in..."
          >
            Login
          </LoadingButton>
        </form>

        <div className="text-center mt-4">
          <span className="text-gray-600 mr-2">Don't have an account?</span>
          <Link to="/register" className="text-blue-500 underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
