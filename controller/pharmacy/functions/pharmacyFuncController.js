const Pharmacy = require('../../../model/pharmacy/Pharmacy');
const Store = require('../../../model/pharmacy/Store');
const HandleAsync = require('../../../utils/HandleAsync');
const AppError = require('../../../utils/AppError');





const createStore = HandleAsync(async (req, res) => {
    const { name,
        address,
        city,
        state,
        postalaCode,
        Country,
        phoneNumber,
        operatingHours,
        createdBy
    } = req.body;

    const { pharmacyId } = req.params;
    
    // find a pharmacy
    const foundPharmacy = await Pharmacy.findById( pharmacyId )
    if (!foundPharmacy) {
    throw new AppError('Pharmacy not found!', 404)

    }
     
    location = {
        "type": "Point",
        "coordinates": [7.4820, 9.0556]
    }

    try {
        const store = new Store({
            name,
            address,
            city,
            state,
            postalaCode,
            Country,
            phoneNumber,
            operatingHours,
            createdBy,
            location:location
        });
        


    // Associate the store with the pharmacy by pushing its ObjectId to the pharmacy's stores array
        foundPharmacy.stores.push(store);
        store.pharmacy = foundPharmacy;

        
        // Save the store and pharmacy to the database
        await store.save();
        await foundPharmacy.save();


        
        // Respond with success message and store data
        res.status(201).json({ msg: 'Store created successfully!', data: [store] });
    }
    catch (err) {
        res.status(500).json({ error: 'Server error', err });
        console.error('Server error:', err);
    }
    
   
});



module.exports = {
    createStore
}