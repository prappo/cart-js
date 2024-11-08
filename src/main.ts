import Cart from '../cart/cart'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
   <h1>Cart.js</h1>
   <p>A simple shopping cart for your website</p>
   <div>Demo</div>
    <div id="cart-container"></div>
  </div>
`

const cart = new Cart();

cart.addItem({
  id: "ii_1MtGUtLkdIwHu7ixBYwjAM02",
  amount: 10000,
  image: "https://img.drz.lazcdn.com/static/bd/p/f900e35fe0c633d904dbdaf28e880964.png_400x400q75.png_.webp",
  currency: "usd",
  customer: "cus_NeZei8imSbMVvi",
  date: 1680640231,
  title: "TP-Link TL-WR840N",
  description: "TP-Link TL-WR840N Wireless N Router",
  discountable: true,
  discounts: [],
  metadata: {},
  quantity: 1,
  subscription: null,
  tax_rates: [],
});

cart.addItem({
  id: "12",
  image: "https://img.drz.lazcdn.com/static/bd/p/f887d3133e1ce569b28be6c84a76e3c8.jpg_400x400q75.jpg_.webp",
  amount: 10000,
  title: "TP-Link TL-WR840N",
  description: "TP-Link TL-WR840N Wireless N Router",
})

// Add a discount
// cart.addDiscount({ value: 10, type: 'percentage' });

// Add tax
// cart.addTax({ rate: 8.25, name: 'Sales Tax' });

const template = `
<div style="width: 100%; max-width: 400px; font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    <items>
    <item>
    <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <img src="{{item.image}}" alt="{{item.title}}" style="width: 50px; height: 50px; margin-right: 15px;">
        <div style="flex: 1;">
            <div style="font-weight: bold;">{{item.title}}</div>
            <div style="color: #888; font-size: 14px;">{{item.description}}</div>
        </div>
        <div style="font-weight: bold; margin-right: 15px;">{{item.amount}}</div>
        <div style="display: flex; align-items: center;">
            <QtMinusBtn><button style="width: 24px; height: 24px; text-align: center; background: #eee; border: none; border-radius: 4px;">-</button></QtMinusBtn>
            <span style="margin: 0 10px;">{{item.quantity}}</span>
            <QtPlusBtn><button style="width: 24px; height: 24px; text-align: center; background: #eee; border: none; border-radius: 4px;">+</button></QtPlusBtn>
          </div>
        </div>
      </item>
    </items>

  

    <!-- Subtotal and Shipping -->
    <div style="display: flex; justify-content: space-between; font-size: 14px; margin: 15px 0;">
        <div>Subtotal</div>
        <div style="font-weight: bold;">{{subtotal}}</div>
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 15px;">
        <div>Shipping Fee</div>
        <div style="font-weight: bold;">{{tax}}</div>
    </div>

    <!-- Total -->
    <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; margin-bottom: 20px;">
        <div>Total</div>
        <div>{{total}}</div>
    </div>

    <CheckoutBtn>
    <!-- Confirm Order Button -->
    <button style="width: 100%; padding: 12px; font-size: 16px; font-weight: bold; color: #fff; background-color: #007bff; border: none; border-radius: 5px; cursor: pointer;">
        Confirm Order
    </button>
    </CheckoutBtn>
</div>

`

// Set template
cart.setTemplate(template);

// Initialize the cart
cart.init('#cart-container');



// Add event listener for checkout
document.addEventListener('cart:checkout', ((event: CartCheckoutEvent) => {
  console.log('Checkout event triggered:', event.detail);
  console.log('Total:', cart.getTotal());
  // cart.clearCart();
}) as EventListener);



// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
