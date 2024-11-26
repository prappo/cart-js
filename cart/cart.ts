// Global type declaration for window object
declare global {
    interface Window {
        cartInstance: Cart;
    }
}

// ----------------
// Type Definitions
// ----------------

interface CartItem {
    id: string;                      // Unique identifier for the item
    amount: number;                  // Price in cents
    title: string;                   // Item name/title
    quantity: number;                // Number of items
    image?: string;                  // Optional item image URL
    currency?: string;               // Currency code (default: USD)
    customer?: string;               // Customer identifier
    date?: number;                   // Timestamp
    description?: string;            // Item description
    discountable?: boolean;          // Whether item can be discounted
    discounts?: Discount[];          // Item-specific discounts
    metadata?: Record<string, any>;  // Additional custom data
    subscription?: any;              // Subscription information
    tax_rates?: TaxRate[];          // Item-specific tax rates
}

interface Discount {
    value: number;                   // Discount amount
    type: 'percentage' | 'fixed';    // Discount type
}

interface TaxRate {
    rate: number;                    // Tax rate percentage
    name: string;                    // Tax name/description
}

interface ApiConfig {
    method: string;                  // HTTP method
    headers: Record<string, string>; // Request headers
    url: string;                     // API endpoint
}

// Custom event interface for checkout
interface CartCheckoutEvent extends CustomEvent {
    detail: {
        items: CartItem[];
        total: number;
        subtotal: number;
        taxes: TaxRate[];
        discounts: Discount[];
    };
}

/**
 * Cart Class
 * Implements shopping cart functionality with singleton pattern
 */
class Cart {
    private static instance: Cart;
    private items: CartItem[] = [];
    private taxes: TaxRate[] = [];
    private discounts: Discount[] = [];
    private template: string = '';
    private storage_key = 'cart_data';
    private container: HTMLElement | null = null;

    // ----------------
    // Initialization
    // ----------------

    constructor() {
        if (Cart.instance) {
            return Cart.instance;
        }
        Cart.instance = this;
        this.loadFromStorage();
    }

    public static getInstance(): Cart {
        if (!Cart.instance) {
            Cart.instance = new Cart();
        }
        return Cart.instance;
    }

    // ----------------
    // Storage Methods
    // ----------------

    private loadFromStorage(): void {
        const savedData = localStorage.getItem(this.storage_key);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            this.items = parsedData.items || [];
            this.taxes = parsedData.taxes || [];
            this.discounts = parsedData.discounts || [];
            if (this.template) {
                this.render();
            }
        }
    }

    private saveToStorage(): void {
        localStorage.setItem(this.storage_key, JSON.stringify({
            items: this.items,
            taxes: this.taxes,
            discounts: this.discounts
        }));
    }

    // ----------------
    // Cart Operations
    // ----------------

    addItem(item: Pick<CartItem, 'id' | 'amount' | 'title'> & Partial<Omit<CartItem, 'id' | 'amount' | 'title'>>): void {
        const existingItem = this.items.find(i => i.id === item.id);
        if (existingItem) {
            console.warn(`Item with id ${item.id} already exists in cart`);
            return;
        }
        const defaultItem: CartItem = {
            ...item,
            quantity: item.quantity || 1,
            currency: item.currency || 'USD',
            discounts: item.discounts || [],
            tax_rates: item.tax_rates || [],
            metadata: item.metadata || {},
            discountable: item.discountable ?? true,
        };

        this.items.push(defaultItem);
        this.saveToStorage();
        this.render();
    }

    removeItem(itemId: string): void {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveToStorage();
    }

    updateQuantity(itemId: string, quantity: number): void {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            item.quantity = Math.max(0, quantity);
            if (item.quantity === 0) {
                this.removeItem(itemId);
            }
        }
        this.saveToStorage();
    }

    addTax(tax: TaxRate): void {
        this.taxes.push(tax);
        this.saveToStorage();
    }

    addDiscount(discount: Discount): void {
        this.discounts.push(discount);
        this.saveToStorage();
    }

    getSubtotal(): number {
        return this.items.reduce((sum, item) => sum + (item.amount * item.quantity), 0);
    }

    getTotal(): number {
        const subtotal = this.getSubtotal();
        const discountAmount = this.getTotalDiscount();
        const taxAmount = this.getTotalTax();

        return subtotal - discountAmount + taxAmount;
    }

    async send(config: ApiConfig): Promise<Response> {
        const cartData = {
            items: this.items,
            taxes: this.taxes,
            discounts: this.discounts,
            subtotal: this.getSubtotal(),
            total: this.getTotal()
        };

        try {
            const response = await fetch(config.url, {
                method: config.method,
                headers: {
                    'Content-Type': 'application/json',
                    ...config.headers
                },
                body: JSON.stringify(cartData)
            });

            if (!response.ok) {
                throw new Error('Cart submission failed');
            }

            return response;
        } catch (error) {
            console.error('Error sending cart:', error);
            throw error;
        }
    }

    setTemplate(templateStr: string): void {
        this.template = templateStr;
        if (this.items.length > 0) {
            this.render();
        }
    }

    // ----------------
    // Template Rendering
    // ----------------

    private renderTemplate(): string {
        let rendered = this.template;

        if (this.items.length === 0) {
            // If cart is empty, show the CartEmpty content and remove the items section
            const emptyMatch = this.template.match(/<CartEmpty>([^]*?)<\/CartEmpty>/);
            const emptyContent = emptyMatch ? emptyMatch[1] : '<h2>Cart is empty</h2>';

            // Replace items section with empty content
            rendered = rendered.replace(
                /<items>[^]*?<\/items>/,
                `<div class="cart-empty">${emptyContent}</div>`
            );

            // Remove the CartEmpty section
            rendered = rendered.replace(/<CartEmpty>[^]*?<\/CartEmpty>/, '');

            // Clear the totals
            rendered = rendered.replace(/{{subtotal}}/g, '$0.00');
            rendered = rendered.replace(/{{total}}/g, '$0.00');
            rendered = rendered.replace(/{{tax}}/g, '$0.00');
            rendered = rendered.replace(/{{discount}}/g, '$0.00');

            return rendered;
        }

        // Remove the CartEmpty section
        rendered = rendered.replace(/<CartEmpty>[^]*?<\/CartEmpty>/, '');

        // Create items HTML
        const itemsHtml = this.items.map(item => {
            let itemTemplate = this.template;

            // Replace all item properties dynamically
            Object.keys(item).forEach(key => {
                const value = item[key as keyof CartItem];
                const displayValue = key === 'amount'
                    ? `$${(Number(value) / 100).toFixed(2)}`
                    : String(value);

                const regex = new RegExp(`{{item\.${key}}}`, 'g');
                itemTemplate = itemTemplate.replace(regex, displayValue);
            });

            // Preserve inner HTML while adding data attributes
            const qtPlusMatch = itemTemplate.match(/<QtPlusBtn>([\s\S]*?)<\/QtPlusBtn>/);
            const qtMinusMatch = itemTemplate.match(/<QtMinusBtn>([\s\S]*?)<\/QtMinusBtn>/);
            const removeBtnMatch = itemTemplate.match(/<RemoveBtn>([\s\S]*?)<\/RemoveBtn>/);

            itemTemplate = itemTemplate
                .replace(/<QtPlusBtn>[\s\S]*?<\/QtPlusBtn>/,
                    `<span class="qt-btn" data-action="increase" data-item-id="${item.id}">${qtPlusMatch ? qtPlusMatch[1] : ''}</span>`)
                .replace(/<QtMinusBtn>[\s\S]*?<\/QtMinusBtn>/,
                    `<span class="qt-btn" data-action="decrease" data-item-id="${item.id}">${qtMinusMatch ? qtMinusMatch[1] : ''}</span>`)
                .replace(/<RemoveBtn>[\s\S]*?<\/RemoveBtn>/,
                    `<span class="remove-btn" data-item-id="${item.id}">${removeBtnMatch ? removeBtnMatch[1] : ''}</span>`);

            // Extract only the <item> content from the template
            const itemMatch = itemTemplate.match(/<item>([^]*?)<\/item>/);
            return itemMatch ? itemMatch[1] : '';
        }).join('');

        // Replace the items section with all rendered items
        rendered = rendered.replace(
            /<items>[^]*?<\/items>/,
            `<div class="cart-items">${itemsHtml}</div>`
        );

        // Add subtotal
        rendered = rendered.replace(/{{subtotal}}/g, `$${(this.getSubtotal() / 100).toFixed(2)}`);

        // Add total
        rendered = rendered.replace(/{{total}}/g, `$${(this.getTotal() / 100).toFixed(2)}`);

        // Add tax amount
        rendered = rendered.replace(/{{tax}}/g, `$${(this.getTotalTax() / 100).toFixed(2)}`);

        // Add discount amount
        rendered = rendered.replace(/{{discount}}/g, `$${(this.getTotalDiscount() / 100).toFixed(2)}`);

        // Preserve checkout button inner HTML
        const checkoutBtnMatch = rendered.match(/<CheckoutBtn>([\s\S]*?)<\/CheckoutBtn>/);
        if (checkoutBtnMatch) {
            const checkoutBtnContent = checkoutBtnMatch[1];
            rendered = rendered.replace(
                /<CheckoutBtn>[\s\S]*?<\/CheckoutBtn>/,
                checkoutBtnContent.replace(/<button/, '<button class="checkout-button"')
            );
        }

        return rendered;
    }

    // ----------------
    // Event Handling
    // ----------------

    private setupEventListeners(): void {
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;

            // Handle quantity buttons
            const quantityButton = target.closest('.qt-btn');
            if (quantityButton instanceof HTMLElement) {
                const itemId = quantityButton.getAttribute('data-item-id');
                const action = quantityButton.getAttribute('data-action');

                if (itemId) {
                    const item = this.items.find(i => i.id === itemId);
                    if (item) {
                        if (action === 'increase') {
                            this.updateQuantity(itemId, item.quantity + 1);
                        } else if (action === 'decrease') {
                            this.updateQuantity(itemId, item.quantity - 1);
                        }
                        this.render();
                    }
                }
            }

            // Handle remove button
            const removeButton = target.closest('.remove-btn');
            if (removeButton instanceof HTMLElement) {
                const itemId = removeButton.getAttribute('data-item-id');
                if (itemId) {
                    this.removeItem(itemId);
                    this.render();
                }
            }

            // Handle checkout button
            if (target.closest('.checkout-button')) {
                const checkoutEvent = new CustomEvent('cart:checkout', {
                    detail: {
                        items: this.items,
                        total: this.getTotal(),
                        subtotal: this.getSubtotal(),
                        taxes: this.getTaxes(),
                        discounts: this.getDiscounts()
                    },
                    bubbles: true,
                    composed: true
                });
                document.dispatchEvent(checkoutEvent);
            }
        });
    }

    private render(): void {
        if (this.container && this.template) {
            this.container.innerHTML = this.renderTemplate();
        }
    }

    init(selector?: string): void {
        if (typeof window !== 'undefined') {
            window.cartInstance = this;

            if (selector) {
                this.container = document.querySelector(selector);
                if (!this.container) {
                    console.warn(`Element with selector "${selector}" not found. Cart will not be initialized.`);
                    return;
                }
            } else {
                this.container = document.createElement('div');
                this.container.className = 'cart-container';
                document.body.appendChild(this.container);
            }

            if (this.template) {
                this.container.innerHTML = this.renderTemplate();
            }
            this.setupEventListeners();
        }
    }

    getItems(): CartItem[] {
        // Return a copy of the items array to prevent direct manipulation
        return [...this.items];
    }

    getTaxes(): TaxRate[] {
        // Return a copy of the taxes array
        return [...this.taxes];
    }

    getDiscounts(): Discount[] {
        // Return a copy of the discounts array
        return [...this.discounts];
    }

    clearCart(): void {
        this.items = [];
        this.taxes = [];
        this.discounts = [];
        this.saveToStorage();
        this.render();
    }

    // ----------------
    // Calculation Methods
    // ----------------

    private getTotalTax(): number {
        const discountedAmount = this.getDiscountedAmount();
        let taxAmount = 0;
        this.taxes.forEach(tax => {
            taxAmount += discountedAmount * (tax.rate / 100);
        });
        return taxAmount;
    }

    private getTotalDiscount(): number {
        const subtotal = this.getSubtotal();
        let discountAmount = 0;

        this.discounts.forEach(discount => {
            if (discount.type === 'percentage') {
                discountAmount += subtotal * (discount.value / 100);
            } else {
                discountAmount += discount.value;
            }
        });
        return discountAmount;
    }

    private getDiscountedAmount(): number {
        return this.getSubtotal() - this.getTotalDiscount();
    }
}

// Export singleton instance and class
export const cartInstance = Cart.getInstance();
export default Cart;
