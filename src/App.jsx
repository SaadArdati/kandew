import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import TeamManagement from './pages/TeamManagement';
import TeamCreation from './pages/TeamCreation';

export default function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="team/new"              element={<TeamCreation />} />
                        <Route path="team/:teamId/manage"   element={<TeamManagement />} />
                        {/* Add more routes here as pages are built */}
                    </Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}
