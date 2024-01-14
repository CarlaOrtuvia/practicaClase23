import { productModel } from '../dao/models/products.models.js';

/// en controller se hace normalmente se hace metodod HTTP + Modelo para referirse al nombre del controladr
export const getProducts = async (req, res) => {
    const {limit, page, filter, sort} = req.query;

    const pag = page ? page:1;
    const lim = limit ? limit:10;
    const ord = sort === 'asc' ? 1 : -1;

    try {
        const prods = await productModel.paginate({filer: filter}, {limit: lim, page: pag, sort: {price: ord}});

        if(prods) {
            return res.status(200).send(prods)
        }
        res.status(404).send({message: 'No se encontraron productos'})
    } catch (error) {
        res.status(500).send({message: 'Error al obtener los productos'})
    }
}

export const getProduct = async (req, res) => {
    const {id} = req.params;

    try {
        const prod = await productModel.findById(id);

        if(prod) {
            return res.status(200).send(prod)
        }
        res.status(404).send({message: 'No se encontró el producto'})
    } catch (error) {
        res.status(500).send({message: 'Error al obtener el producto'})
    }
}

export const createProduct = async (req, res) => {
    const {title, description, price, stock, category, code} = req.body;
    console.log('req.body', req.body)

    try {
        const product = await productModel.create({title, description, price, stock, category, code});

        if(product) {
            return res.status(201).send(product)
        }
        res.status(400).send({message: 'No se pudo crear el producto'})
    } catch (error) {
        if(error.code === 11000) {
            return res.status(400).send({message: `El producto de codigo ${code} ya existe`})
        }
        res.status(500).send({message: 'Error al crear el producto'})
    }
}

export const updateProduct = async (req, res) => {
    const {code} = req.params;
    console.log('id', code)
    const {name, description, price, stock, image, category} = req.body;
    console.log('req.body', req.body)

    try {
        const product = await productModel.findOneAndUpdate({ code: code }, {name, description, price, stock, image, category}, { new: true })
        console.log('product', product)
        if(product) {
            return res.status(200).send(product)
        }
        res.status(400).send({message: `Producto ${code} no encontrado` })
    } catch (error) {
        res.status(500).send({message: 'Error al actualizar el producto'})
    }
}

export const deleteProduct = async (req, res) => {
    const {id} = req.params;

    try {
        const product = await productModel.findByIdAndDelete(id);

        if(product) {
            return res.status(200).send({message: 'Producto eliminado'})
        }
        res.status(400).send({message: 'No se pudo eliminar el producto'})
    } catch (error) {
        res.status(500).send({message: 'Error al eliminar el producto'})
    }
}

// Exportar todas las funciones juntas en un objeto
export const productController = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
}