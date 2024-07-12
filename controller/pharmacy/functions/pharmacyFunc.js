const Pharmacy = require('../../../model/pharmacy/Pharmacy');
const Store = require('../../../model/pharmacy/Store');
const Product = require('../../../model/pharmacy/Product');
const HandleAsync = require('../../../utils/HandleAsync');
const AppError = require('../../../utils/AppError');



// Function to generate a unique 6-digit numeric store ID
const generateStoreId = async () => {
    const min = 100000; // Minimum 6-digit number
    const max = 999999; // Maximum 6-digit number
    let newId;

    do {
        newId = `STORE-${Math.floor(min + Math.random() * (max - min + 1))}`;
        // Check if this ID already exists in your database or collection
        const existingStore = await Store.findOne({ storeId: newId });
        if (!existingStore) {
            break;
        }
    } while (true);

    return newId;
};


// Function to generate a unique 6-digit numeric product ID
const generateProductId = async () => {
    const min = 100000; // Minimum 6-digit number
    const max = 999999; // Maximum 6-digit number
    let newId;

    do {
        newId = `PROD-${Math.floor(min + Math.random() * (max - min + 1))}`;
        // Check if this ID already exists in your database or collection
        const existingProduct = await Product.findOne({ productId: newId });
        if (!existingProduct) {
            break;
        }
    } while (true);

    return newId;
};




// function to create a store for a pharmacy
const createStore = HandleAsync(async (req, res, next) => {
    const { name, address, city, state, postalaCode, country, phoneNumber, operatingHours, createdBy } = req.body;
    const { pharmacyId } = req.params;

    // Find the pharmacy
    const foundPharmacy = await Pharmacy.findOne({ pharmacyId } );
    if (!foundPharmacy) {
         return res.status(404).json({ error: 'Pharmacy not found!' });

        
    }

    // Define the location
    const location = {
        type: "Point",
        coordinates: [ 7.3078,  8.9643]
    };

    try {

         // Generate a unique storeId
        const storeId = await generateStoreId();
        console.log('Store Id:', storeId);




        // Create a new store instance
        const store = new Store({
            storeId,
            name,
            address,
            city,
            state,
            postalaCode,
            country,
            phoneNumber,
            operatingHours,
            createdBy,
            location,
            pharmacy: foundPharmacy.pharmacyId, 
        });

        // Associate the store with the pharmacy
        foundPharmacy.stores.push(store.storeId);

        // Save the store and pharmacy to the database
        await store.save();
        await foundPharmacy.save();

        // Respond with success message and store data
        res.status(201).json({ msg: 'Store created successfully!', data: [store] });
    } catch (err) {
        next(err); // Pass the error to the next error handler
        console.error('Server error:', err);
    }
});



// Function to create products for a pharmacy
const createProduct = HandleAsync(async (req, res, next) => {
    const { name, description, price, quantity, category, subcategory, manufacturer, expiryDate } = req.body;
    const { storeId } = req.params;

    // Find the store
    const foundStore = await Store.findOne({ storeId });
    if (!foundStore) {
       return res.status(404).json({ error: 'Store not found!' });
    }

    try {
        // Generate a unique productId
        const productId = await generateProductId();
        console.log('Product Id:', productId);

         // Handle single or multiple image uploads
            const productImages = [];
        if (req.files) {
            req.files.forEach(file => {
                productImages.push(file.path);
            });
        }

        // Create a new product instance
        const product = new Product({
            productId,
            name,
            description,
            price,
            quantity,
            category,
            subcategory,
            manufacturer,
            expiryDate,
            images:productImages,
            store: foundStore.storeId,
        });

        foundStore.products.push(product.productId)

        // Save the product and store to the database
        await product.save();
        await foundStore.save();

        // Respond with success message and product data
        res.status(201).json({ msg: 'Product created successfully!', data: product });
    } catch (err) {
        next(err)
        console.error('Server error:', err);
    }
});



module.exports = {
    createStore,
    createProduct
}