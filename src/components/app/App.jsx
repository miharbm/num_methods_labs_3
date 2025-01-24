import {Route, BrowserRouter as Router, Routes, Navigate} from "react-router-dom";
import "../../styles/index.scss"
import { Suspense, lazy } from "react";
import Lab3 from "../labs/Lab3.jsx";
const Lab1 = lazy(() => import("../labs/Lab1.jsx"));
const Lab2 = lazy(() => import("../labs/Lab2.jsx"));


const App = () => {
    return(
        <Router>
            {/*<AppHeader/>*/}
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/" element={<Navigate to="/lab1" />} />
                    <Route path="/lab1" element={<Lab1/>} />
                    <Route path="/lab2" element={<Lab2/>} />
                    <Route path="/lab3" element={<Lab3/>} />
                </Routes>
            </Suspense>
        </Router>
    )
}
export default App