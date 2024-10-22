import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import UserProvider from "./contexts/userProvider.tsx";
import HomePage from "./pages/HomePage.tsx";
import PlayerSetting from "./pages/PlayerSetting.tsx";
import ToastProvider from "./components/ToastProvider.tsx";


const App = () => {
    return (
        <ToastProvider>
            <div className={"bg-gradient-to-br from-teal-500 via-purple-500 to-fuchsia-600"}>
                <UserProvider>
                    <Router basename={"/"}>
                        <Routes>
                            <Route path="/" element={<HomePage/>}/>
                            <Route path={"/profile"} element={<PlayerSetting/>}/>
                        </Routes>
                    </Router>
                </UserProvider>
            </div>
        </ToastProvider>
    );
};

export default App;
