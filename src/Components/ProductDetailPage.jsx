import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductById } from '../Services/GraphqlRequests';
import { GrNext, GrPrevious } from "react-icons/gr";

const ProductDetailsPage = ({ addToCart }) => {
    const [product, setProduct] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const productData = await fetchProductById(id);

                if (productData && productData.attributes) {
                    const mergedAttributes = {};
                    productData.attributes.forEach(attribute => {
                        if (!mergedAttributes[attribute.name]) {
                            mergedAttributes[attribute.name] = [attribute.value];
                        } else {
                            mergedAttributes[attribute.name].push(attribute.value);
                        }
                    });
                    productData.attributes = Object.entries(mergedAttributes).map(([name, values]) => ({
                        name,
                        values
                    }));
                }

                setProduct(productData);
                setSelectedImage(productData.images[0]); // Set the first image as selected by default
                setLoading(false);
            } catch (error) {
                console.error('Error fetching product:', error);
                setError('Failed to fetch product details');
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleOptionChange = (optionName, optionValue) => {
        const updatedOptions = { ...selectedOptions, [optionName]: optionValue };

        Object.keys(selectedOptions).forEach(name => {
            if (name === optionName && selectedOptions[name] !== optionValue) {
                delete updatedOptions[name];
            }
        });

        setSelectedOptions(updatedOptions);
    };

    const handleAddToCart = () => {
        if (product) {
            const selectedOptionsArray = Object.entries(selectedOptions).map(([name, value]) => ({ name, value }));
            addToCart({ ...product, selectedOptions: selectedOptionsArray, image: selectedImage });
        }
    };

    const handleImageClick = (image, index) => {
        setSelectedImage(image);
        setSelectedImageIndex(index);
    };

    const handleNextImage = () => {
        const nextIndex = (selectedImageIndex + 1) % product.images.length;
        setSelectedImage(product.images[nextIndex]);
        setSelectedImageIndex(nextIndex);
    };

    const handlePreviousImage = () => {
        const prevIndex = (selectedImageIndex - 1 + product.images.length) % product.images.length;
        setSelectedImage(product.images[prevIndex]);
        setSelectedImageIndex(prevIndex);
    };

    return (
        <div className="container mt-5">
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : product ? (
                <div className="row" id="productDetailsPage">
                    <div className="col-md-6" id="product-image">
                        <div className="main-image">
                            <img src={selectedImage.url} alt={selectedImage.alt} />
                            <div className="prev-next-buttons">
                                <GrPrevious onClick={handlePreviousImage} className='prevNex' />
                                <GrNext onClick={handleNextImage} className='prevNex' />
                            </div>
                        </div>
                        <div className="thumbnail-images">
                            {product.images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image.url}
                                    alt={image.alt}
                                    className={selectedImage === image ? 'selected' : ''}
                                    onClick={() => handleImageClick(image, index)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="col-md-4" id="product-details">
                        <h2>{product.name}</h2>
                        {product.attributes &&
                            product.attributes.map((attribute, index) => (
                                <div key={index}>
                                    {/* Check if attribute name is not 'color' */}
                                    {attribute.name.toLowerCase() !== 'color' ? (
                                        <div>
                                            <h6>{attribute.name}:</h6>
                                            <div className="options" style={{ marginBottom: '15px' }}>
                                                {attribute.values && attribute.values.map((value, idx) => (
                                                    <button
                                                        key={`${attribute.name}-${idx}`}
                                                        className={`attribute-button ${selectedOptions[attribute.name] === value ? 'selected' : ''}`}
                                                        onClick={() => handleOptionChange(attribute.name, value)}
                                                    >
                                                        {value}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        // If it's a color attribute, only display color buttons
                                        <div className="options" style={{ marginBottom: '15px' }}>
                                            <h6>Colors :</h6>
                                            {attribute.values && attribute.values.map((value, idx) => (
                                                <button
                                                    key={`${attribute.name}-${idx}`}
                                                    className={`attribute-button ${selectedOptions[attribute.name] === value ? 'selected' : ''}`}
                                                    style={{ backgroundColor: value, color: 'transparent' }}
                                                    onClick={() => handleOptionChange(attribute.name, value)}
                                                >
                                                    {value}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                        <h4>Price: ${product.price.toFixed(2)}</h4>

                        {!product.inStock && (
                            <p className="text-danger">Out of Stock</p>
                        )}
                        {product.inStock && (
                            <button
                                className="btn btn-success" id="buttonAddToCart"
                                onClick={handleAddToCart}
                                disabled={!Object.keys(selectedOptions).length}
                            >
                                Add to Cart
                            </button>
                        )}

                        <p id="description">{product.description}</p>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default ProductDetailsPage;
