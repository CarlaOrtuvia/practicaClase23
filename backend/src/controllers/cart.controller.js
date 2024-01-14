import { cartModel } from "../dao/models/carts.models.js";
import { productModel } from "../dao/models/products.models.js";
import { ticketModel } from "../dao/models/tickets.models.js"

// Crear los controlers de los carritos 
export const getCarts = async (req, res) => {
    const {limit} = req.query;
    try {
        const carts = await cartModel.find().limit(limit);
        res.status(200).send({respuesta: 'ok', mensaje: carts})
    } catch (error){
        res.status(400).send({respuesta: 'Error', mensaje: error})
    }
}

export const getCart = async (req, res) => {
    const {id} = req.params
    console.log('id', id)
    try {
        const cart = await cartModel.findById(id);
        if (cart)
            res.status(200).send({respuesta: 'ok', mensaje: cart})
        else 
            res.status(404).send({respuesta: 'Error', mensaje: 'Cart not found'})
    } catch (error){
        res.status(400).send({respuesta: 'Error', mensaje: error})
    }
}

export const createCartLogic = async () => {
    try {
        console.log('Creating cart');
        const cart = await cartModel.create({});
        console.log('Cart created: ', cart);
        return cart;
        } catch (error) {
        console.log('error created', error);
        throw error;
        }
    };
    
    export const createCart = async (req, res) => {
        try {
        const cart = await createCartLogic();
        return res.status(201).send({respuesta: 'ok', mensaje: cart});
        } catch (error) {
        console.log('error created', error);
        res.status(400).send({respuesta: 'Error', mensaje: error});
        }
    };
    

export const cleanCart = async (req, res) => {
    const {id} = req.params
    try {
        const cart = await cartModel.findById(id);
        if (cart) {
            cart.products = [];
            await cart.save();
            res.status(200).send({respuesta: 'ok', mensaje: cart})
        }
        else 
            res.status(404).send({respuesta: 'Error', mensaje: 'Cart not found'})
    } catch (error){
        res.status(400).send({respuesta: 'Error', mensaje: error})
    }
}

export const addOrUpdateProductInCart = async (req, res) => {
    const {cid, pid} = req.params
    const {quantity} = req.body

    try {
        const cart = await cartModel.findById(cid);
        if (cart) {
            const product = await productModel.findById(pid);
            if (product) {
                const index = cart.products.findIndex(prod => prod.id_prod._id.toString() === pid);
                if (index !== -1) {
                    cart.products[index].quantity = quantity;
                } else {
                    cart.products.push({ id_prod: pid, quantity: quantity });
                }
                await cart.save();
                res.status(200).send({respuesta: 'ok', mensaje: cart})
            }
            else 
                res.status(404).send({respuesta: 'Error', mensaje: 'Product not found'})
        }
        else 
            res.status(404).send({respuesta: 'Error', mensaje: 'Cart not found'})
    } catch (error){
        res.status(error.message.includes("not found") ? 404 : 400).send({ respuesta: 'Error', mensaje: error.message });
    }
}

export const removeProductbyId = async (req, res) => {
    const {cid, pid} = req.params
    try {
        const cart = await cartModel.findById(cid);
        if (cart) {
            const product = await productModel.findById(pid);
            if (product) {
                const index = cart.products.findIndex(prod => prod.id_prod._id.toString() === pid);
                if (index !== -1) {
                    cart.products.splice(index, 1);
                    await cart.save();
                    res.status(200).send({respuesta: 'ok', mensaje: cart})
                } else {
                    res.status(404).send({respuesta: 'Error', mensaje: `Product ${pid} not found in the cart ${cid}`})
                }
            }
            else 
                res.status(404).send({respuesta: 'Error', mensaje: 'Product not found'})
        }
        else 
            res.status(404).send({respuesta: 'Error', mensaje: 'Cart not found'})
    } catch (error){
        res.status(400).send({respuesta: 'Error', mensaje: error})
    }
}
 export const updateProductQuantity = async (req, res) => {
    try{
        const { cid,pid } = req.params;
        const { quantity } = req.body;
        const cart = await cartModel.findById(cid);

        if(!cart){
            res.status(404).send({ respuesta: "Carrito no encontrado", mensaje: "Not found"});
        }
        const product = await productModel.findById(pid);
        if(!product){
            res.status(404).send({ respuesta: "Producto no encontrado", mensaje: "Not found"});
        }
        const indice = cart.products.findIndex((prod)=> prod.id_prod._id.toString() === pid);
        if(indice !== -1){
            cart.products[indice].quantity;
        } else{
            cart.products.push({ id_prod: pid, quantity: quantity });
        }

        await cart.save();
        res.status(200).send({ respuesta: "OK", mensaje: "Carrito actualizado" , carrito: cart });
    } catch (error) {
        res.status(500).send({ respuesta: "Error", mensaje: "Ha ocurrido un error en el servidor"});
    }
 };

export const updateCartWithProducts = async (req, res) => {
    const {cid} = req.params
    const {products} = req.body
    try {
        const cart = await cartModel.findById(cid);
        if (!cart) {
            throw new Error("Cart not found");
        }
        for (let prod of products) {
            // Verifica si el producto ya existe en el carrito
            const index = cart.products.findIndex(cartProduct => cartProduct.id_prod._id.toString() === prod.id_prod);
            if (index !== -1) {
                // Si ya existe, actualizamos la cantidad
                cart.products[index].quantity = prod.quantity;
            } else {
                // Si no existe, primero validamos que el producto exista en la base de datos
                const exists = await productModel.findById(prod.id_prod);
                if (!exists) {
                    throw new Error(`Product with ID ${prod.id_prod} not found`);
                }
                // Añade el producto al carrito
                cart.products.push(prod);
            }
        }
        await cart.save();
        res.status(200).send({ respuesta: 'OK', mensaje: 'Cart updated successfully' });
    } catch (error){
        res.status(400).send({respuesta: 'Error', mensaje: error})
    }
}

export const purchaseCart = async (req, res) => {
    const { cid } = req.params;
    const purchaser = req.user.user.email;

    try {
        //obtengo el cart
        const cart = await cartModel.findById(cid);
          //Si no existe el carrito que me avise
          if (!cart) {
            res.status(404).send({ res: 'Error en finalización de compra', message: `El carrito con el ID ${cid} no existe` });
        }

        let montoTotal = 0;
        const productosConStock = [];
        const productosSinStock = [];

        //Recorro todos los productos del carrito
        for (const cartProduct of cart.products) {
            //Obtengo el id del producto actual
            const product = await productModel.findById(cartProduct.id_prod);

            if (!product) {
                return res.status(404).send({ respuesta: "Error", mensaje: `Producto con ID ${cartProduct.id_prod} no encontrado` });
            }

            //Si hay suficiente stock en la base de datos: actualiza monto y stock, guarda producto, agrega a productos con stock
            //Si no: agrega a productos sin stock
            if (cartProduct.quantity <= product.stock) {
                montoTotal += product.price * cartProduct.quantity;
                product.stock -= cartProduct.quantity;
                cartProduct.quantity = 0;
                await productModel.findByIdAndUpdate(cartProduct.id_prod, product);
                productosConStock.push(cartProduct);
            } else {
                productosSinStock.push(cartProduct);
            }
        }

        //Creo el ticket
        const ticket = await ticketModel.create({ amount: montoTotal, purchaser: purchaser });
        if (ticket) {
            //Actualizo el carrito con los productos que tienen stock
            cart.products = productosConStock;
            const updatedCart = await cartModel.findByIdAndUpdate(cid, { products: cart.products }, { new: true });

            if (updatedCart) {
                return res.status(200).send({ message: "exito" });
            }
        }

        console.log("Productos sin stock:", productosSinStock);
        res.status(500).send({ respuesta: "Error", mensaje: "Ha ocurrido un error en el servidor" });
    } catch (error) {
        res.status(400).send({ res: 'Error en finalización del carrito', message: error });
    }
};
    


//Exportar todas las funciones juntas como cartController   
export const cartController = { 
    getCarts,
    getCart,
    createCart,
    cleanCart,
    addOrUpdateProductInCart,
    removeProductbyId,
    updateCartWithProducts,
    updateProductQuantity,
    purchaseCart
}