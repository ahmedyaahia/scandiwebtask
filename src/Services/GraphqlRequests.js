import axios from "axios";

const baseURL = 'https://scandiweb-testtask.000webhostapp.com/graphql.php'; //  base URL

// Define functions for making GraphQL requests
export const fetchCategories = async () => {
  try {
    const response = await axios.post(baseURL, {
      query: `
        query {
          categories {
            id
            name
          }
        }
      `
    });
    return response.data.data.categories;
  } catch (error) {
    console.error('Error fetching categories:', error.response ? error.response.data.errors : error.message);
    return [];
  }
};

// Define function to fetch products
export const fetchProducts = async () => {
  try {
    const response = await axios.post(baseURL, { 
      query: `
        query {
          products {
            id
            name
            inStock
            description
            category {
              id
              name
            }
            brand
            images {
              url
            }
            price
            attributes {
              name
              value
            }
          }
        }
      `
    });
    if (response.data && response.data.data && response.data.data.products) {
      return response.data.data.products;
    } else {
      throw new Error('Products data not found in response');
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Define function to fetch product details by id
export const fetchProductById = async (productId) => {
  try {
    const query = `
          query Product($productId: ID!) {
              product(productId: $productId) {
                  id
                  name
                  inStock
                  description
                  price
                  images {
                      url
                  }
                  attributes {
                      name
                      value
                  }
              }
          }
      `;

    const variables = {
      productId: productId // Ensure productId variable is passed correctly
    };

    console.log('GraphQL Query:', query); // Log the GraphQL query
    console.log('Variables:', variables); // Log the variables

    const response = await axios.post(baseURL, { 
      query: query,
      variables: variables
    });

    console.log('Response Data:', response.data); // Log the entire response data

    const productData = response.data.data.product;

    return productData;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw new Error('Failed to fetch product details');
  }
};

export const insertOrder = async (orderProducts, totalPrice) => {
  try {
    // Send a GraphQL mutation request to insert the order
    const response = await axios.post(baseURL, {
      query: `
        mutation InsertOrder($orderProducts: [ID!]!, $totalPrice: Float!) {
          insertOrder(orderProducts: $orderProducts, totalPrice: $totalPrice) 
        }
      `,
      variables: {
        orderProducts: orderProducts,
        totalPrice: totalPrice
      }
    });

    // Check if the mutation was successful
    if (response.data && response.data.data && response.data.data.insertOrder) {
      // Return the ID of the inserted order
      return response.data.data.insertOrder.id;
    } else {
      // Handle the case where the mutation failed
      throw new Error('Failed to insert order');
    }
  } catch (error) {
    // Handle any errors that occurred during the request
    console.error('Error inserting order:', error);
    throw new Error('Failed to insert order');
  }
};
