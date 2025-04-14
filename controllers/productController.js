const Product = require('../models/productModel');
const asyncHandler = require('../middleware/asyncHandler');
const cloudinary = require('../config/cloudinaryConfig');

const addProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, quantity, slug } = req.body;

  if (
    !name ||
    !description ||
    !price ||
    !category ||
    !quantity ||
    !req.file
  ) {
    return res
      .status(400)
      .json({ status: false, message: "All fields are required" });
  }

  try {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      async (error, result) => {
        if (error) {
          return res
            .status(400)
            .json({ status: false, message: error.message });
        }

        const imageUrl = result.secure_url;

        const newProduct = new Product({
          name,
          description,
          price,
          category,
          image: imageUrl,
          user:req.user._id,
          slug,
          quantity,
        });

        await newProduct.save();
        res.status(201).json({
          status: true,
          message: "Product created successfully",
          results: newProduct,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

//update products
const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category} = req.body;
  const productId = req.params.id;
  const product = await Product.findById(productId);

  if (product) {
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.user = req.user._id || product.user;
    product.slug = req.body.slug || product.slug;
    product.quantity = req.body.quantity || product.quantity;

    product.reviews = req.body.reviews || product.reviews;

    //upload image to cloudinary
    if (req.file) {
      try {
        const imageUrl = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            async (error, result) => {
              if (error) {
                reject(error);
              }
              resolve(result.secure_url);
            }
          );
          uploadStream.end(req.file.buffer);
        });
        product.image = imageUrl || product.image;
      } catch (error) {
        return res.status(400).json({
          status: false,
          message: "Error uploading image" + error.message,
        });
      }
    }

    //save info in db
    try {
      await product.save();
      res.status(200).json({
        status: true,
        message: "Product updated successfully",
        results: product,
      });
    } catch (error) {
      return res.status(400).json({ status: false, message: error.message });
    }
  } else {
    //if  we didn't find the product, return 404 error
    return res
      .status(404)
      .json({ status: false, message: "Product not found" });
  }
});

//get all products
const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await Product.find()
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    const totalProducts = await Product.countDocuments();

    return res.status(200).json({
      status: true,
      totalproducts: totalProducts,
      page: parseInt(page),
      results: products,
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

//get all products by category
const getProductsCat = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const catcode = req.params.catcode;
  const skip = (parseInt(page)-1) * parseInt(limit);
  try {
    if (!catcode) {
      return res
        .status(404)
        .json({ status: false, message: "Category code is invalid" });
    }
    const products = await Product.find({ category: catcode }).skip(parseInt(skip)).limit(parseInt(limit)).sort({createdAt: -1});
    if(products.length === 0){
        return res.status(404).json({status: false, message:'Products with this category not found'});
    }

    return res.status(200).json({status:true, results:products});
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
  
});

//get product by id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.status(200).json({ status: true, results: product });
  } else {
    res.status(404).json({ status: false, message: "Product not found" });
  }
});

//delet product by id
const deleteProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await Product.deleteOne({ _id: req.params.id });
    res
      .status(200)
      .json({ status: true, message: "Product deleted successfully" });
  } else {
    res.status(404).json({ status: false, message: "Product not found" });
  }
});

//search for products with keyword
const searchProducts = asyncHandler(async (req, res) => {
  try {
    const { keyword, page = 1, limit = 10 } = req.query;

    if (!keyword) {
      return res
        .status(400)
        .json({ status: false, message: "Keyword is required" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await Product.find({
      $text: { $search: keyword },
    })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    const totalProducts = await Product.countDocuments();

    if (products.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "No products found" });
    }
    return res.status(200).json({
      status: true,
      totalFound: products.length,
      totalProducts: totalProducts,
      results: products,
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

//get product name by id
const getProductNameById = async (prodId) => {
    try{
        const productName = await Product.findById(prodId).select('name');
        return {success:true, results:productName.name};
    }catch(error){
        return {success:false, error:error.message};
    }
}

module.exports = {
  addProduct,
  updateProduct,
  getAllProducts,
  getProductsCat,
  getProductById,
  deleteProductById,
  searchProducts,
  getProductNameById
}
