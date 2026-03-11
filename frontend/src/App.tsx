import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AllRoutes from './routes/allRoutes';

function App() {
  return (
  <div>
  <AllRoutes />
  <ToastContainer position="top-right" autoClose={3000} />
  </div>
  )
}
export default App;
