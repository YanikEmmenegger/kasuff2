// src/App.tsx
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import PlayerProvider from "./contexts/playerProvider.tsx";
import HomePage from "./pages/HomePage.tsx";
import PlayerSetting from "./pages/PlayerSetting.tsx";
import ToastProvider from "./components/ToastProvider.tsx";
import GamePage from "./pages/GamePage.tsx";
import ColoredBackground from "./components/ColoredBackground.tsx";

const App = () => {
    return (
        <ToastProvider>
            <ColoredBackground>
                <Router basename={"/"}>
                    <PlayerProvider>
                            <Routes>
                                <Route path="/" element={<HomePage/>}/>
                                <Route path="/profile" element={<PlayerSetting/>}/>
                                <Route path="/game" element={<GamePage/>}/> {/* Add the lobby route */}
                            </Routes>
                    </PlayerProvider>
                </Router>
            </ColoredBackground>
        </ToastProvider>
    );
};

export default App;
