# Cart.js

A simple and flexible shopping cart library for your website. Cart.js provides a complete shopping cart solution with support for discounts, taxes, custom templates, and local storage persistence.

## Installation

```bash
npm install @prappo/cart-js
```

## Quick Start

```javascript
import Cart from '@prappo/cart-js';

// Initialize cart
const cart = new Cart();

// Add items
cart.addItem({
  id: "item1",
  amount: 10000, // Amount in cents
  title: "Product Name",
  quantity: 1
});

// Set template
cart.setTemplate(`
  <div>
    <items>
      <item>
        <div>
          <h3>{{item.title}}</h3>
          <p>Price: {{item.amount}}</p>
          <QtMinusBtn>-</QtMinusBtn>
          {{item.quantity}}
          <QtPlusBtn>+</QtPlusBtn>
          <RemoveBtn>Remove</RemoveBtn>
        </div>
      </item>
    </items>
    <div>Total: {{total}}</div>
    <CheckoutBtn>
      <button>Checkout</button>
    </CheckoutBtn>
  </div>
`);

// Initialize the cart with a container
cart.init('#cart-container');
```

## Features

- 🛒 Easy to use shopping cart functionality
- 💲 Support for multiple currencies
- 🏷️ Discount management
- 💰 Tax calculation
- 📱 Responsive design
- 🎨 Customizable template system
- 💾 Local storage persistence

## API Reference

### Cart Methods

#### Initialization
```javascript
const cart = new Cart();
cart.init('#container-selector');
```

#### Item Management
```javascript
// Add item
cart.addItem({
  id: string,
  amount: number,
  title: string,
  quantity?: number,
  image?: string,
  currency?: string,
  description?: string
});

// Remove item
cart.removeItem(itemId);

// Update quantity
cart.updateQuantity(itemId, quantity);

// Clear cart
cart.clearCart();
```

#### Discounts & Taxes
```javascript
// Add discount
cart.addDiscount({
  value: number,
  type: 'percentage' | 'fixed'
});

// Add tax
cart.addTax({
  rate: number,
  name: string
});
```

#### Getters
```javascript
cart.getItems();        // Get all items
cart.getSubtotal();     // Get subtotal
cart.getTotal();        // Get total with tax and discounts
cart.getTaxes();        // Get applied taxes
cart.getDiscounts();    // Get applied discounts
```

### Template System

The template system uses special tags for dynamic content:

- `<items>` - Container for item list
- `<item>` - Individual item template
- `<QtPlusBtn>` - Quantity increase button
- `<QtMinusBtn>` - Quantity decrease button
- `<RemoveBtn>` - Remove item button
- `<CheckoutBtn>` - Checkout button
- `<CartEmpty>` - Empty cart content

Available variables:
- `{{item.property}}` - Item properties (id, title, amount, etc.)
- `{{subtotal}}` - Cart subtotal
- `{{total}}` - Cart total
- `{{tax}}` - Total tax amount
- `{{discount}}` - Total discount amount

### Events

```javascript
// Listen for checkout events
document.addEventListener('cart:checkout', (event) => {
  const { items, total, subtotal, taxes, discounts } = event.detail;
  // Handle checkout
});
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build library
npm run build:lib

# Build demo
npm run build:demo

# Build both library and demo
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.