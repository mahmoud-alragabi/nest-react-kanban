import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomMessage from "../../components/CustomMessage/CustomMessage";
import TextField from "../../components/TextField/TextField";
import LoadingButton from "../../components/LoadingButton/LoadingButton";
import { axiosInstance } from "../../api/axiosInstance";
import { HttpStatusCode } from "axios";

interface RegistrationForm {
  name: string;
  email: string;
  password: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegistrationForm>({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [messageData, setMessageData] = useState({ status: "", message: "" });
  const navigateTo = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessageData({ status: "", message: "" });

    try {
      const response = await axiosInstance.post("/users", formData);

      if (response.status === HttpStatusCode.Created) {
        setMessageData({
          status: "success",
          message: "Registration successful.",
        });

        navigateTo("/kanban");
      }
    } catch (error: any) {
      const messageData = { status: "error", message: "Registration failed" };

      if (error.response?.status === HttpStatusCode.Conflict)
        messageData.message = "Email already in use";

      setMessageData(messageData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded">
        <h2 className="text-2xl font-semibold mb-4 text-center">Register</h2>

        <CustomMessage status={messageData.status}>
          {messageData.message}
        </CustomMessage>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            autoComplete="name"
          />

          <TextField
            label="Email"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />

          <TextField
            label="Password"
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            wrapperClassName="mb-6"
          />

          <LoadingButton
            type="submit"
            loading={loading}
            loadingText="Registering..."
          >
            Register
          </LoadingButton>

          <div className="text-center mt-4">
            <span className="text-gray-600 mr-2">Already have an account?</span>
            <Link to="/login" className="text-blue-500 underline">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
