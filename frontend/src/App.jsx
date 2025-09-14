import { BrowserRouter } from "react-router-dom";
import CustomRouter from "./Routes/CustomRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import {SocketProvider} from "./Context/SocketWrapper.jsx";

function App() {
  return (
    <BrowserRouter>
        <SocketProvider>
      <CustomRouter />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
        </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
