import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  Paper,
} from "@mui/material";
import axios from "axios";

const ApiTester = () => {
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000/api/user");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    userId: "",
  });
  const [token, setToken] = useState("");
  const [response, setResponse] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const showResponse = (res) =>
    setResponse(JSON.stringify(res.data, null, 2));

  const handleRegister = async () => {
    try {
      const res = await axios.post(`${baseUrl}/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        mobile: formData.mobile,
      });
      showResponse(res);
    } catch (err) {
      showResponse(err.response);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${baseUrl}/login`, {
        email: formData.email,
        password: formData.password,
      });
      setToken(res.data.token);
      showResponse(res);
    } catch (err) {
      showResponse(err.response);
    }
  };

  const handleProfile = async () => {
    try {
      const res = await axios.get(`${baseUrl}/userprofile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showResponse(res);
    } catch (err) {
      showResponse(err.response);
    }
  };

  const handleAllUsers = async () => {
    try {
      const res = await axios.get(`${baseUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showResponse(res);
    } catch (err) {
      showResponse(err.response);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axios.delete(`${baseUrl}/deleteuser`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          email: formData.email,
          _id: formData.userId,
        },
      });
      showResponse(res);
    } catch (err) {
      showResponse(err.response);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        CRM API Tester
      </Typography>

      <TextField
        fullWidth
        label="Base URL"
        value={baseUrl}
        onChange={(e) => setBaseUrl(e.target.value)}
        margin="normal"
      />
      <Divider sx={{ my: 2 }} />

      <TextField
        label="Name"
        name="name"
        fullWidth
        value={formData.name}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        label="Email"
        name="email"
        fullWidth
        value={formData.email}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        fullWidth
        value={formData.password}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        label="Mobile"
        name="mobile"
        fullWidth
        value={formData.mobile}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        label="User ID (for delete)"
        name="userId"
        fullWidth
        value={formData.userId}
        onChange={handleChange}
        margin="normal"
      />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, my: 2 }}>
        <Button onClick={handleRegister} variant="contained" color="primary">
          Register
        </Button>
        <Button onClick={handleLogin} variant="contained" color="secondary">
          Login
        </Button>
        <Button onClick={handleProfile} variant="outlined">
          Profile
        </Button>
        <Button onClick={handleAllUsers} variant="outlined">
          All Users
        </Button>
        <Button onClick={handleDelete} variant="contained" color="error">
          Delete
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>
        Response
      </Typography>
      <Box component="pre" sx={{ bgcolor: "#f6f8fa", p: 2, borderRadius: 2 }}>
        {response}
      </Box>
    </Paper>
  );
};

export default ApiTester;
