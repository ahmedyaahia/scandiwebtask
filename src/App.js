import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// components 
import ProductListingPage from './Components/ProductListingPage';
import ProductDetailPage from './Components/ProductDetailPage';
import Header from './Components/Header';
import CartOverlay from './Components/CartOverlay';

// css style
import './App.css';

const App = () => {
    const [isCartOverlayOpen, setIsCartOverlayOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [headerCartItems, setHeaderCartItems] = useState(0); 

    const addToCart = (product) => {
        const isFromQuickShop = product.fromQuickShop;

        // Check if the product already exists in the cart with the same options
        const existingProductIndex = cartItems.findIndex(item =>
            JSON.stringify({
                id: item.id,
                options: (item.selectedOptions || []).map(option => `${option.name}:${option.value}`).join(',')
            }) === JSON.stringify({
                id: product.id,
                options: (product.selectedOptions || []).map(option => `${option.name}:${option.value}`).join(',')
            })
        );

        if (existingProductIndex !== -1) {
            // If the product exists in the cart with the same options, increase its quantity by 1
            const updatedCartItems = cartItems.map((item, index) => {
                if (index === existingProductIndex) {
                    return { ...item, quantity: item.quantity + 1 };
                }
                return item;
            });
            setCartItems(updatedCartItems);
            // Update cart items count in the header
            setHeaderCartItems(updatedCartItems.length);
        } else {
            // If the product is not in the cart with the same options, add it with quantity 1
            setCartItems(prevCartItems => [
                ...prevCartItems,
                { ...product, quantity: 1, fromQuickShop: isFromQuickShop }
            ]);
            // Update cart items count in the header
            setHeaderCartItems(prevCount => prevCount + 1);
        }
    };




    const handleToggleCartOverlay = () => {
        setIsCartOverlayOpen(prevState => !prevState);
    };

    const updateHeaderCartItems = (count) => {
        setHeaderCartItems(count);
    };

    return (
        <BrowserRouter>
            <>
                <Header cartItemCount={headerCartItems} cartItems={cartItems} setHeaderCartItems={setHeaderCartItems} />
                <Routes>
                    {/* Route for the product listing page with category parameter */}
                    <Route path="/:category?" element={<ProductListingPage addToCart={addToCart} />} />
                    <Route path="/product/:id" element={<ProductDetailPage addToCart={addToCart} handleCloseCartOverlay={handleToggleCartOverlay} />} />
                </Routes>
                {isCartOverlayOpen && <CartOverlay handleCloseCartOverlay={handleToggleCartOverlay} cartItems={cartItems} updateHeaderCartItems={updateHeaderCartItems} />}
            </>
        </BrowserRouter>
    );
};

export default App;
