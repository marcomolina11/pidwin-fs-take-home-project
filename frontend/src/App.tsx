import React from 'react';
import { CircularProgress, Container } from '@mui/material';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDataRefresh } from './hooks/useDataRefresh';
import Navbar from './components/Navbar/Navbar';
import Login from './components/Login/Login';
import Home from './components/Home/Home';
import PasswordSetting from './components/PasswordSettings/PasswordSettings';
import WinStreaks from './components/WinStreaks/WinStreaks';

const App: React.FC = () => {
  const { loading } = useDataRefresh();

  if (loading) {
    return (
      <Container
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <BrowserRouter>
      <Container maxWidth="lg">
        <Navbar />
        <ToastContainer
          position="bottom-left"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Login />} />
          <Route path="/password" element={<PasswordSetting />} />
          <Route path="/winStreaks" element={<WinStreaks />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
};

export default App;
