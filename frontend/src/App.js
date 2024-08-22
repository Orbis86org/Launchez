
import {React , useEffect} from 'react';
import AOS from 'aos';
import { Route, Routes } from 'react-router-dom';
import Header from './components/header/index';
import Footer from './components/footer';
import '../src/assets/font/font-awesome.css'
import routes from './pages';
import Page404 from './pages/404';
import {ToastContainer} from "react-toastify";

function App() {

    useEffect(() => {
        AOS.init({
          duration : 2000
        });
      }, []);

    return (
        <>

            <ToastContainer />
            <Header />

            <Routes>

                {
                    routes.map((data,idx) => (
                        <Route key={idx} path={data.path} element={data.component} exact />
                    ))
                }

                <Route path='*' element={<Page404 />} />
            </Routes>

            <Footer />
        </>
    );
}

export default App;
