import React, { useState, useEffect } from 'react';
import { insertOrder } from '../Services/GraphqlRequests';

const CartOverlay = ({ cartItems, setHeaderCartItems, handleOptionChange }) => {
    const [products, setProducts] = useState([]);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [showOrderPlacedAlert, setShowOrderPlacedAlert] = useState(false);

    //  function to group attributes by name
    const groupAttributesByName = (attributes) => {
        const groupedAttributes = {};
        attributes.forEach((attribute) => {
            if (!groupedAttributes[attribute.name]) {
                groupedAttributes[attribute.name] = [];
            }
            groupedAttributes[attribute.name].push(attribute.value);
        });
        return groupedAttributes;
    };

    //  function to handle the default selected option
    const handleDefaultSelectedOption = (attributeName, values, isFromQuickShop) => {
        const selectedOption = products.map(product => {
            return {
                ...product,
                selectedOptions: product.selectedOptions.map(option => {
                    if (option.name === attributeName && (isFromQuickShop || option.value === values[0])) {
                        // If the item is from quick shop or the current option value is the first one, select it by default
                        return { ...option, value: values[0] };
                    }
                    return option;
                })
            };
        });
        setProducts(selectedOption);
    };


    useEffect(() => {
        setProducts(cartItems.map(item => {
            // Check if the item has fromQuickShop property
            const isFromQuickShop = item.fromQuickShop;
            const groupedAttributes = isFromQuickShop ? groupAttributesByName(item.attributes || []) : {};
            return {
                ...item,
                groupedAttributes,
                isFromQuickShop // Add this to the product's state
            };
        }));
    }, [cartItems]);


    const generateProductKey = (product) => {
        const optionsString = (product.selectedOptions || []).map(option => `${option.name}:${option.value}`).sort().join(',');
        return `${product.id}-${optionsString}`;
    };


    const handleAddToCart = (productKey) => {
        setProducts(prevProducts => {
            return prevProducts.map(product => {
                if (generateProductKey(product) === productKey) {
                    return { ...product, quantity: product.quantity + 1 };
                }
                return product;
            });
        });
    };


    const handleRemoveFromCart = (productKey) => {
        setProducts(prevProducts => {
            const updatedProducts = prevProducts.map(product => {
                if (generateProductKey(product) === productKey) {
                    const updatedQuantity = product.quantity - 1;
                    const newQuantity = updatedQuantity < 0 ? 0 : updatedQuantity;
                    return { ...product, quantity: newQuantity };
                }
                return product;
            });

            // Filter out products with quantity greater than 0
            const filteredProducts = updatedProducts.filter(product => product.quantity > 0);

            // Update the header cart items count using a callback function
            setHeaderCartItems(prevHeaderCartItems => {
                // Calculate the new header cart items count based on the filtered products
                const newHeaderCartItemsCount = filteredProducts.reduce((count, product) => count + product.quantity, 0);
                return newHeaderCartItemsCount;
            });

            // Set the products state to filteredProducts
            return filteredProducts;
        });
    };


    const handlePlaceOrder = async () => {
        if (products.length === 0) return;
        setIsPlacingOrder(true);
        try {
            // Extract product IDs from cart items
            const productIds = products.map(product => product.id);

            // Calculate total price
            const totalPrice = products.reduce((total, product) => total + (product.price * product.quantity), 0);
            // Call the insertOrder function
            await insertOrder(productIds, totalPrice);
            // Empty the cart after successful order placement
            setProducts([]);
            // Update cart items count in the header
            setHeaderCartItems(0);
            // Show the "Order placed successfully!" alert
            setShowOrderPlacedAlert(true);

            console.log('Order placed successfully!');

            // Hide the alert after 2 seconds
            setTimeout(() => {
                setShowOrderPlacedAlert(false);
            }, 2000);
        } catch (error) {
            console.error('Error placing order:', error);
        } finally {
            setIsPlacingOrder(false);
        }
    };


    const getSizeHint = (size) => {
        switch (size) {
            case 'Small':
                return 'SM';
            case 'Medium':
                return 'M';
            case 'Large':
                return 'L';
            case 'Extra Large':
                return 'XL';
            default:
                return size; // If the size doesn't match, return the original size value
        }
    };

    const totalPrice = products.reduce((total, product) => total + (product.price * product.quantity), 0);

    return (
        <div className="cart-overlay">
            <div className="cart-overlay-content">
                <div className="cart-header">
                    <p><strong>My Bag.</strong> {products.length} items</p>
                </div>
                <div className="cart-products">
                    {products &&
                        products.map((product, index) => (
                            <div className="cart-product" key={`${generateProductKey(product)}-${index}`}>                                <div className="product-info">
                                <p>{product.name}</p>
                                <h6 className='cartPrice'>${product.price ? product.price.toFixed(2) : ''}</h6>
                                {product.isFromQuickShop ? (
                                    // Render grouped attributes for items added from Quick Shop
                                    Object.keys(product.groupedAttributes).map((attributeName, index) => (
                                        <div key={index}>
                                            <h6>{attributeName}:</h6>
                                            <div className="options" style={{ marginBottom: '15px' }}>
                                                {/* Use Set to store unique values */}
                                                {Array.from(new Set(product.groupedAttributes[attributeName])).map((value, idx) => (
                                                    <button
                                                        key={`${attributeName}-${idx}`}
                                                        className={`attribute-button ${idx === 0 ? 'selected' : ''}`}
                                                        onClick={() => handleDefaultSelectedOption(attributeName, product.groupedAttributes[attributeName], true)}
                                                        disabled
                                                    >
                                                        {/* Display color background instead of word for color options */}
                                                        {attributeName.toLowerCase() === 'color' ? (
                                                            <span
                                                                style={{
                                                                    backgroundColor: value, width: '10px', height: '10px', color: 'transparent', display: 'inline-block', padding: '0'
                                                                }}
                                                            ></span>
                                                        ) : (
                                                            // Render other options normally
                                                            getSizeHint(value)
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    // Render regular attributes for other items
                                    product.attributes && product.attributes.map((attribute, index) => (
                                        <div key={index}>
                                            <h6>{attribute.name}:</h6>
                                            <div className="options" style={{ marginBottom: '15px' }}>
                                                {attribute.name.toLowerCase() === 'color' ? (
                                                    attribute.values && attribute.values.map((value, idx) => (
                                                        <button
                                                            key={`${attribute.name}-${idx}`}
                                                            className={`attribute-button ${product.selectedOptions.find(option => option.name === attribute.name && option.value === value) ? 'selected' : ''}`}
                                                            style={{
                                                                backgroundColor: value, color: 'transparent', width: '25px', height: '25px'
                                                            }}
                                                            onClick={() => handleOptionChange(attribute.name, value)} // Utilize the handleOptionChange function here
                                                            disabled
                                                        >
                                                            {/* You can also add some text or icon inside the button if needed */}
                                                        </button>
                                                    ))
                                                ) : (
                                                    attribute.values && attribute.values.map((value, idx) => (
                                                        <button
                                                            key={`${attribute.name}-${idx}`}
                                                            className={`attribute-button ${product.selectedOptions.find(option => option.name === attribute.name && option.value === value) ? 'selected' : ''}`}
                                                            onClick={() => handleOptionChange(attribute.name, value)} // Utilize the handleOptionChange function here
                                                            disabled
                                                        >
                                                            {getSizeHint(value)}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}

                            </div>
                                <div className="quantity-controls">
                                    <button onClick={() => handleRemoveFromCart(generateProductKey(product))}>-</button>
                                    <span>{product.quantity}</span>
                                    <button onClick={() => handleAddToCart(generateProductKey(product))}>+</button>
                                </div>
                                <div className="CartImage">
                                    {product.images && product.images.length > 0 && product.images[0] && (
                                        <img className="cart-product-image" src={product.images[0].url} alt={product.name} />
                                    )}
                                </div>
                            </div>
                        ))}


                </div>
            </div>
            <div className="TotalPrice">
                <div className="cart-total">
                    <p>Total: </p>
                    <p>${totalPrice.toFixed(2)}</p>
                </div>
                <button
                    className="place-order-button"
                    disabled={products.length < 1 || isPlacingOrder} // Disabled if no items in the cart
                    onClick={handlePlaceOrder}
                >
                    {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                </button>            {showOrderPlacedAlert && (
                    <div className="order-placed-alert">
                        <p>Order placed successfully!</p>
                    </div>
                )}
            </div>


        </div>
    );
};

export default CartOverlay;
