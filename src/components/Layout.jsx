import {Outlet} from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
    return (
        <div className="min-h-screen bg-surface text-on-surface transition-colors">
            <Navbar/>
            <main>
                <Outlet/>
            </main>
        </div>
    );
}
