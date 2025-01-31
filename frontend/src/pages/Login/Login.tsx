import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TextField from "../../components/TextField/TextField";
import LoadingButton from "../../components/LoadingButton/LoadingButton";
import CustomMessage from "../../components/CustomMessage/CustomMessage";
import { axiosInstance } from "../../api/axiosInstance";
import axios, { HttpStatusCode } from "axios";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setCustomMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigateTo = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCustomMessage("");
    setLoading(true);

    try {
      const endpoint = "/auth/login";
      const data = { email, password };
      const options = { withCredentials: true };

      const response = await axiosInstance.post(endpoint, data, options);

      if (response.status === HttpStatusCode.Ok) navigateTo("/kanban");
    } catch (error) {
      let errorMessage = "An unexpected error occurred";

      if (axios.isAxiosError(error) && error.response)
        errorMessage = error?.response?.data?.message || "Invalid Credentials";

      setCustomMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded">
        <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>

        <CustomMessage status="error">{errorMessage}</CustomMessage>

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
