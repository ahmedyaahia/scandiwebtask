import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchCategories } from '../Services/GraphqlRequests';
import { LuShoppingCart } from 'react-icons/lu';
import CartOverlay from './CartOverlay';

const Header = ({ handleCloseCartOverlay, cartItemCount, cartItems, setHeaderCartItems }) => {
    const [categories, setCategories] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false); // State for category dropdown
    const location = useLocation();

    useEffect(() => {
        // Function to fetch categories data from the backend
        const fetchData = async () => {
            try {
                // Fetch categories using the fetchCategories function
                const categoriesData = await fetchCategories();
                setCategories(categoriesData);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        // Call the fetchData function when the component mounts
        fetchData();
    }, []);

    const toggleCartOverlay = () => {
        setIsCartOpen(!isCartOpen);
    };

    const toggleCategoryDropdown = () => {
        setIsCategoryOpen(!isCategoryOpen);
    };

    return (
        <nav className="navbar navbar-expand-lg" id="navbarID">
            <div className="container">
                {/* Navbar toggler for mobile */}
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation" onClick={toggleCategoryDropdown}>
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Categories */}
                <div className={`collapse navbar-collapse ${isCategoryOpen ? 'show' : ''}`} id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        {categories.map(category => (
                            <li className="nav-item" key={category.id}>
                                <Link
                                    className={`nav-link ${location.pathname === `/${category.name.toLowerCase()}` ? 'active' : ''}`}
                                    to={category.name.toLowerCase() === 'all' ? '/' : `/${category.name.toLowerCase()}`}
                                >
                                    {category.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Logo */}

                <a className="navbar-brand" id="center-logo" href="/">
                    <img src="/logoscandiweb.png" alt="logo" />
                </a>
                {/* Cart Icon */}
                <div className="icon" >
                    <button className="nav-link CartIcon" onClick={toggleCartOverlay}>
                        <LuShoppingCart />
                        {cartItemCount > 0 && <span className="cart-item-count">{cartItemCount}</span>}
                    </button>
                </div>
            </div>

            {/* Conditionally render the cart overlay */}
            {isCartOpen && <CartOverlay handleCloseCartOverlay={toggleCartOverlay} cartItems={cartItems} setHeaderCartItems={setHeaderCartItems} />}
            {isCartOpen && <div className="overlay-backdrop" onClick={toggleCartOverlay}></div>}

        </nav>
    );
};

export default Header;
