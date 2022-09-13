import { Link, NavLink } from "@remix-run/react";
import cn from 'classnames';
import { useOptionalUser } from "~/utils";
import DarkModeToggle from './DarkModeToggle';

export default function Header() {
    const user = useOptionalUser();

    return (      
        <header className="text-gray-700 body-font border-b-2 border-blue-100 bg-blue-50 dark:bg-gray-700">
            <div className="container flex flex-col flex-wrap items-center p-5 mx-auto md:flex-row">
                <Link 
                    to="/" className="flex items-center mb-4 font-medium text-gray-900 dark:text-gray-200 title-font md:mb-0">
                    Directed Stack
                </Link>
                <nav className="flex flex-wrap items-center justify-center text-base md:mr-auto md:ml-4 md:py-1 md:pl-4 md:border-l md:border-gray-400">
                    <NavLink 
                        to="/about" 
                        className={({ isActive }) => cn(
                            isActive 
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-200",
                            "text-base  hover:text-gray-800 mr-4"
                        )}
                    >
                        About Us
                    </NavLink>
                    <NavLink 
                        to="/blog" 
                        className={({ isActive }) => cn(
                            isActive 
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-200",
                            "text-base  hover:text-gray-800 mr-4"
                        )}
                    >
                        Blog
                    </NavLink>
                    <a 
                        href="https://github.com/freekrai/directed-stack" 
                        target="_blank"
                        className="text-gray-500 dark:text-gray-200 px-3 py-2 font-medium text-sm hover:text-blue-700 dark:hover:text-blue-500"
                    >
                        <svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                            <path
                                fillRule="evenodd"
                                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </a>
                </nav>
                <div>
                    {user ? (
                        <NavLink
                            to="/notes"
                            className="inline-flex justify-center px-4 py-2 mt-4 mr-4 text-sm font-medium transition duration-150 ease-in-out bg-gray-200 border border-transparent rounded-md hover:bg-gray-300 focus:outline-none focus:border-gray-700 focus:shadow-outline-royal-blue active:bg-royal-blue-700 md:mt-0"
                        >
                            My Notes
                        </NavLink>
                    ) : (<>
                        <NavLink 
                            to="/signin" 
                            className="inline-flex justify-center px-4 py-2 mt-4 mr-4 text-sm font-medium transition duration-150 ease-in-out bg-gray-200 border border-transparent rounded-md hover:bg-gray-300 focus:outline-none focus:border-gray-700 focus:shadow-outline-royal-blue active:bg-royal-blue-700 md:mt-0"
                        >
                            Login
                        </NavLink>
                        <NavLink
                            to="/signup" 
                            className="inline-flex justify-center px-4 py-2 mt-4 mr-4 text-sm font-medium transition duration-150 ease-in-out bg-blue-200 border border-transparent rounded-md hover:bg-blue-300 focus:outline-none focus:border-blue-700 focus:shadow-outline-royal-blue active:bg-royal-blue-700 md:mt-0"
                        >
                            Signup
                        </NavLink>
                    </>)}
                    <DarkModeToggle />
                </div>
            </div>
        </header>
    )
}