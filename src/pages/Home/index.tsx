import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';
import { toast } from 'react-toastify';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, updateProductAmount, cart } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    sumAmount[product.id] = product.amount;
    return sumAmount;
  }, {} as CartItemsAmount)

  useEffect(() => {
    async function loadProducts() {
      api.get('/products').then((response) => {
        if(response.status === 200) {
          var productsResponse = response.data as Product[];
          var formatedProds = productsResponse.map((product) => {
            return {...product, priceFormatted: formatPrice(product.price)}
          })
  
          setProducts(formatedProds);
        } else {
          toast.error(`Erro ao buscar produtos\n${response.statusText}`);
        }
      })
    }

    loadProducts();
  }, []);

  async function handleAddProduct(id: number) {
    if (cart.findIndex(x => x.id === id) === -1)
      await addProduct(id);
    else
      updateProductAmount({productId: id, amount: cartItemsAmount[id]});
    
    console.log(cart)
    console.log(cartItemsAmount)
  }

  return (
    <ProductList>
      {
        products.map((product) => 
          <li>
            <img src={product.image} alt={product.title} />
            <strong>{product.title}</strong>
            <span>{product.priceFormatted}</span>
            <button
              type="button"
              data-testid="add-product-button"
              onClick={() => handleAddProduct(product.id)}
            >
              <div data-testid="cart-product-quantity">
                <MdAddShoppingCart size={16} color="#FFF" />
                {cartItemsAmount[product.id] || 0}
              </div>

              <span>ADICIONAR AO CARRINHO</span>
            </button>
          </li>
        )
      }
    </ProductList>
  );
};

export default Home;
