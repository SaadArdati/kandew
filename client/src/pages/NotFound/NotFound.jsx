import {Link} from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
    return (<div className="not-found min-h-dvh flex items-center justify-center p-8 text-on-surface max-sm:p-4">
        <div className="text-center">
            <h1 className="not-found-code text-primary font-normal leading-none text-[clamp(4rem,10vw,8rem)]">404</h1>
            <p className="mt-3 text-lg text-on-surface-variant">This page doesn't exist.</p>
            <div className="mt-8 flex items-center justify-center gap-6">
                <Link to="/"
                      className="text-[0.9375rem] font-semibold text-white bg-primary px-6 py-2.5 rounded-xl no-underline transition-opacity hover:opacity-92 active:opacity-85">Back
                    to home</Link>
                <Link to="/login"
                      className="text-[0.9375rem] font-medium text-on-surface-variant no-underline transition-colors hover:text-primary">Log
                    in</Link>
            </div>
        </div>
    </div>);
}
