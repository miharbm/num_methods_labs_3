import {Route, BrowserRouter as Router, Routes, Navigate} from "react-router-dom";
import Lab1 from "../labs/Lab1.jsx";
import "../../styles/index.scss"

const App = () => {
    return(
        <Router>
            {/*<AppHeader/>*/}
            <Routes>
                <Route path="/" element={<Navigate to="/lab1" />} />
                <Route path="/lab1" element={<Lab1/>} />
            </Routes>
        </Router>
    )
}
export default App