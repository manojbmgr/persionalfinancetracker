import { AuthProvider } from '../contexts/AuthContext';
import { FinanceProvider } from '../contexts/FinanceContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <FinanceProvider>
        <Component {...pageProps} />
        <ToastContainer position="top-right" autoClose={3000} />
      </FinanceProvider>
    </AuthProvider>
  );
}

export default MyApp;

