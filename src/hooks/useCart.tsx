import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { HttpGetById } from "../infra/httpRequests/HttpGetById";
import { Product, Stock } from "../types";
import { ProductList } from "../pages/Home/styles";
import { Cart } from "../components/Header/styles";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const isProductInCart = cart.find(
        (product) => product.id === productId && product
      );

      if (isProductInCart) {
        const { amount: amountInStock } = await HttpGetById({
          path: "stock",
          id: productId,
        });

        if (isProductInCart.amount < amountInStock) {
          const productWithAmountUpdated = cart.map((product) =>
            product.id === productId
              ? { ...product, amount: product.amount + 1 }
              : product
          );
          localStorage.setItem(
            "@RocketShoes:cart",
            JSON.stringify(productWithAmountUpdated)
          );
          setCart(productWithAmountUpdated);
        } else {
          toast.error("Quantidade solicitada fora de estoque");
        }
      } else {
        const productToBeUpdated = await HttpGetById({
          path: "products",
          id: productId,
        });
        const productWithAmount = {
          ...productToBeUpdated,
          amount: 1,
        };
        const newCartItems = [...cart, productWithAmount];
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCartItems));
        setCart(newCartItems);
      }
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const isProductExist = cart.find((product) => product.id === productId);
      if (isProductExist) {
        const newArrayOfProducts = cart.filter(
          (product) => product.id !== productId
        );
        localStorage.setItem(
          "@RocketShoes:cart",
          JSON.stringify(newArrayOfProducts)
        );
        setCart(newArrayOfProducts);
      }
      throw new Error();
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const { amount: amountInStock }: Stock = await HttpGetById({
        path: "stock",
        id: productId,
      });

      if (amount <= 0) return;

      if (amount <= amountInStock) {
        const newCart = cart.map((product) =>
          product.id === productId ? { ...product, amount } : product
        );
        setCart(newCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
        setCart(newCart);
      } else {
        toast.error("Quantidade solicitada fora de estoque");
      }
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
