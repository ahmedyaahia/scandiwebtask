import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchProducts } from '../Services/GraphqlRequests';
import { LuShoppingCart } from 'react-icons/lu';

const ProductListingPage = ({ addToCart }) => {
    const [products, setProducts] = useState([]);
    const [categoryName, setCategoryName] = useState('All');
    const { category } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const productsData = await fetchProducts();
                setProducts(productsData);
                // Set the category name to the selected category or 'All' if no category is selected
                setCategoryName(category ? category : 'All');
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchData();
    }, [category]);

    // Filter products based on the selected category
    const filteredProducts = category && category !== 'All' ? products.filter(product => product.category && product.category.name.toLowerCase() === category.toLowerCase()) : products;

    // Function to handle adding product to the cart with default selected options
    const handleQuickShop = (product) => {
        console.log('Product:', product); // Log the product object 

        // Check if the product has attributes and at least one attribute value
        if (product.attributes && product.attributes.length > 0) {
            const defaultSelectedOptions = product.attributes.map(attribute => ({
                name: attribute.name,
                value: attribute.values && attribute.values.length > 0 ? attribute.values[0] : '' // Check if attribute values exist before accessing the first element
            }));
            addToCart({ ...product, selectedOptions: defaultSelectedOptions, fromQuickShop: true }); // flag to mark it as added from Quick Shop
        } else {
            console.error('Product attributes are missing or empty:', product);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4" id="TitlListing">{categoryName} Products</h2>
            <div className="row">
                {filteredProducts.map(product => (
                    <div key={product.id} className="col-md-4 mb-4">
                        <div className="card">
                            <Link to={`/product/${product.id}`}>
                                <div className="image-container">
                                    {product.images && product.images.length > 0 ? (
                                        <img
                                            src={product.images[0].url}
                                            alt={product.name}
                                            className={product.inStock ? '' : 'out-of-stock'}
                                        />
                                    ) : (
                                        <div className="card-placeholder">Image Placeholder</div>
                                    )}
                                    {!product.inStock && (
                                        <div className="out-of-stock-overlay">
                                            OUT OF STOCK
                                        </div>
                                    )}

                                </div>
                            </Link>
                            {product.inStock && (
                                <button className="quick-shop-btn" onClick={() => handleQuickShop(product)}>
                                    <LuShoppingCart />
                                </button>
                            )}
                            <div className="card-body">
                                <h5 className="card-title">{product.name}</h5>
                                {product.price && (
                                    <p className="card-text">${product.price.toFixed(2)}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductListingPage;
