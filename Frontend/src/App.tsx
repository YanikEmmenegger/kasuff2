// src/App.tsx
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import PlayerProvider from "./contexts/playerProvider.tsx";
import HomePage from "./pages/HomePage.tsx";
import PlayerSetting from "./pages/PlayerSetting.tsx";
import ToastProvider from "./components/ToastProvider.tsx";
import GamePage from "./pages/GamePage.tsx";

const App = () => {
    return (
        <ToastProvider>
            <div
                className={"bg-gray-800 w-full min-h-screen h-auto flex items-center justify-center"}>
                <Router basename={"/"}>
                    <PlayerProvider>
                            <Routes>
                                <Route path="/" element={<HomePage/>}/>
                                <Route path="/profile" element={<PlayerSetting/>}/>
                                <Route path="/game" element={<GamePage/>}/> {/* Add the lobby route */}
                            </Routes>
                    </PlayerProvider>
                </Router>
            </div>
        </ToastProvider>
    );
};

export default App;
