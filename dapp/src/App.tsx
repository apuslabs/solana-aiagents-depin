import { RouterProvider } from 'react-router-dom'
import "./App.css";
import Header from "./components/Header";
import router from './config/router'

function App() {
  return (
    <div className="py-5 px-8 w-full h-screen">
      <Header />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
