const Category = require('../../../model/pharmacy/Category');
const User = require('../../../model/user/User');
const Product = require('../../../model/pharmacy/Product');
const HandleAsync = require('../../../utils/HandleAsync');
const AppError = require('../../../utils/AppError');



// Generate unique user ID
// Function to generate a unique 6-digit numeric category ID
const generateCategoryId = async () => {
    const min = 100000; // Minimum 6-digit number
    const max = 999999; // Maximum 6-digit number
    let newId;

    do {
        newId = `CAT-${Math.floor(min + Math.random() * (max - min + 1))}`;
        // Check if this ID already exists in your database or collection
        const existingCategory = await Category.findOne({ userId: newId });
        if (!existingCategory) {
            break;
        }
    } while (true);

    return newId;
};



// fucntion to get all users

const getAllUsers = HandleAsync(async (req, res, next) => {

    try {
        const users = await User.find({});
        if (!users) {
        return next(new AppError('No existing users!', 404))
        }
               
        res.status(200).json({ msg: 'Users found successfuly!', data: [users] })


    }
     catch (err) {
        next(err)
        console.log('Sever Error:', err)
    }

})





// function to create a category
const createCategory = HandleAsync(async (req, res, next) => {
    const { name, description } = req.body;

    try {
    
          // Check if name and description are provided
        if (!name || !description) {
            // return res.status(400).json({ error: 'Name and description are required fields!' });
            return next(new AppError('Name and description are required fields!', 400))
        }
      
        // call function to generate category Id
        const categoryId = await generateCategoryId();

        const category = new Category({ name, description, categoryId });

        
        await category.save();
        res.status(201).json({ msg: 'Category created successfuly!', data: [category] })
    }
    catch (err) {
        next(err)
        console.log('Sever Error:', err)
    }

});


const updateACategory = HandleAsync(async (req, res, next) => {
    const updates = req.body;
    const { categoryId } = req.params;
    
    try {

          if (!categoryId || categoryId.trim() === '') {
            //   return res.status(400).json({ error: 'Expected a non-empty category ID but none provided!' });
            return next(new AppError('Expected a non-empty category ID but none provided!', 400))

        }

        const category = await Category.findOneAndUpdate({ categoryId }, updates, { new: true, runValidators: true });

        if (!category) {
            // return res.status(400).json({ error: 'Category not found!' });
            return next(new AppError('Category not found!!', 400));

        }

        res.status(200).json({ msg: 'Category updated successfuly!', data: [category] });
    }
    catch (err) {
        next(err);
        console.log('Server Error', err);
    }

});


const deleteACategory = HandleAsync(async (req, res, next) => {
    const { categoryId } = req.params;
    try {

         if (!categoryId || categoryId.trim() === '') {
            //  return res.status(400).json({ error: 'Expected a non-empty category ID but none provided!' });
             return next(new AppError('Expected a non-empty category ID but none provided!', 400));

             
        }
        
        const category = await Category.findOneAndDelete({ categoryId });

        if (!category) {
            // return res.status(400).json({ error: 'Category not found!' });
             return next(new AppError('Category not found!', 400));

        }

        res.status(200).json({ msg: 'Category deleted successfuly!', data: [category] });

    }
    catch {
        next(err);
        console.log('Server Error', err);
    }
});






module.exports = {
    getAllUsers,
    createCategory,
    updateACategory,
    deleteACategory
}
