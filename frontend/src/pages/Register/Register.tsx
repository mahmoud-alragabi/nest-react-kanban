import React, { useState } from "react";
import { Link } from "react-router-dom";
import CustomMessage from "../../components/CustomMessage/CustomMessage";
import TextField from "../../components/TextField/TextField";
import LoadingButton from "../../components/LoadingButton/LoadingButton";

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
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      //   const response = await axiosInstance.post('/users', {
      //     name: formData.name,
      //     email: formData.email,
      //     password: formData.password,
      //   });
      //   if (response.status === 201) {
      //     setSuccessMessage('Registration successful. You can now log in.');
      //     // Optionally redirect after a delay
      //     // navigate('/login');
      //   }
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErrorMessage("Email already in use");
      } else {
        setErrorMessage("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded">
        <h2 className="text-2xl font-semibold mb-4 text-center">Register</h2>

        <CustomMessage status="error">{errorMessage}</CustomMessage>

        <CustomMessage status="success">{successMessage}</CustomMessage>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            autoComplete="name"
          />

          <TextField
            label="Email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />

          <TextField
            label="Password"
            id="password"
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
