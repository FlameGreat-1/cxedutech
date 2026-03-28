import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Landing.css';

const Landing: React.FC = () => {
    return (
        <div className="landing-container">
            <Navbar />
            <header className="landing-header">
                <h1>Welcome to the Flashcard Store</h1>
                <p>Your one-stop shop for offline-first educational flashcards!</p>
                <a href="/store" className="cta-button">Shop Now</a>
            </header>
            <section className="landing-features">
                <h2>Why Choose Our Flashcards?</h2>
                <ul>
                    <li>Engaging and interactive learning experience</li>
                    <li>Designed for children aged 3-8</li>
                    <li>Physical and printable options available</li>
                </ul>
            </section>
            <Footer />
        </div>
    );
};

export default Landing;