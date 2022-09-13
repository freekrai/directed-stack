import Header from './Header';
import Footer from './Footer';

export default function Container({children}) {
    return (
        <div>
            <Header />
            <main id="skip" className="flex flex-col justify-center px-2 py-2">
                {children}
                <Footer />
            </main>
        </div>
    )
}