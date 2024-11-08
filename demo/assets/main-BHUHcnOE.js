(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))n(e);new MutationObserver(e=>{for(const i of e)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function s(e){const i={};return e.integrity&&(i.integrity=e.integrity),e.referrerPolicy&&(i.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?i.credentials="include":e.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(e){if(e.ep)return;e.ep=!0;const i=s(e);fetch(e.href,i)}})();class a{constructor(){if(this.items=[],this.taxes=[],this.discounts=[],this.template="",this.storage_key="cart_data",this.container=null,a.instance)return a.instance;a.instance=this,this.loadFromStorage()}static getInstance(){return a.instance||(a.instance=new a),a.instance}loadFromStorage(){const t=localStorage.getItem(this.storage_key);if(t){const s=JSON.parse(t);this.items=s.items||[],this.taxes=s.taxes||[],this.discounts=s.discounts||[],this.template&&this.render()}}saveToStorage(){localStorage.setItem(this.storage_key,JSON.stringify({items:this.items,taxes:this.taxes,discounts:this.discounts}))}addItem(t){if(this.items.find(e=>e.id===t.id)){console.warn(`Item with id ${t.id} already exists in cart`);return}const n={...t,quantity:t.quantity||1,currency:t.currency||"USD",discounts:t.discounts||[],tax_rates:t.tax_rates||[],metadata:t.metadata||{},discountable:t.discountable??!0};this.items.push(n),this.saveToStorage(),this.render()}removeItem(t){this.items=this.items.filter(s=>s.id!==t),this.saveToStorage()}updateQuantity(t,s){const n=this.items.find(e=>e.id===t);n&&(n.quantity=Math.max(0,s),n.quantity===0&&this.removeItem(t)),this.saveToStorage()}addTax(t){this.taxes.push(t),this.saveToStorage()}addDiscount(t){this.discounts.push(t),this.saveToStorage()}getSubtotal(){return this.items.reduce((t,s)=>t+s.amount*s.quantity,0)}getTotal(){const t=this.getSubtotal(),s=this.getTotalDiscount(),n=this.getTotalTax();return t-s+n}async send(t){const s={items:this.items,taxes:this.taxes,discounts:this.discounts,subtotal:this.getSubtotal(),total:this.getTotal()};try{const n=await fetch(t.url,{method:t.method,headers:{"Content-Type":"application/json",...t.headers},body:JSON.stringify(s)});if(!n.ok)throw new Error("Cart submission failed");return n}catch(n){throw console.error("Error sending cart:",n),n}}setTemplate(t){this.template=t,this.items.length>0&&this.render()}renderTemplate(){let t=this.template;if(this.items.length===0){const e=this.template.match(/<CartEmpty>([^]*?)<\/CartEmpty>/),i=e?e[1]:"<h2>Cart is empty</h2>";return t=t.replace(/<items>[^]*?<\/items>/,`<div class="cart-empty">${i}</div>`),t=t.replace(/<CartEmpty>[^]*?<\/CartEmpty>/,""),t=t.replace(/{{subtotal}}/g,"$0.00"),t=t.replace(/{{total}}/g,"$0.00"),t=t.replace(/{{tax}}/g,"$0.00"),t=t.replace(/{{discount}}/g,"$0.00"),t}t=t.replace(/<CartEmpty>[^]*?<\/CartEmpty>/,"");const s=this.items.map(e=>{let i=this.template;Object.keys(e).forEach(l=>{const m=e[l],p=l==="amount"?`$${(Number(m)/100).toFixed(2)}`:String(m),g=new RegExp(`{{item.${l}}}`,"g");i=i.replace(g,p)});const o=i.match(/<QtPlusBtn>([\s\S]*?)<\/QtPlusBtn>/),r=i.match(/<QtMinusBtn>([\s\S]*?)<\/QtMinusBtn>/),d=i.match(/<RemoveBtn>([\s\S]*?)<\/RemoveBtn>/);i=i.replace(/<QtPlusBtn>[\s\S]*?<\/QtPlusBtn>/,`<span class="qt-btn" data-action="increase" data-item-id="${e.id}">${o?o[1]:""}</span>`).replace(/<QtMinusBtn>[\s\S]*?<\/QtMinusBtn>/,`<span class="qt-btn" data-action="decrease" data-item-id="${e.id}">${r?r[1]:""}</span>`).replace(/<RemoveBtn>[\s\S]*?<\/RemoveBtn>/,`<span class="remove-btn" data-item-id="${e.id}">${d?d[1]:""}</span>`);const h=i.match(/<item>([^]*?)<\/item>/);return h?h[1]:""}).join("");t=t.replace(/<items>[^]*?<\/items>/,`<div class="cart-items">${s}</div>`),t=t.replace(/{{subtotal}}/g,`$${(this.getSubtotal()/100).toFixed(2)}`),t=t.replace(/{{total}}/g,`$${(this.getTotal()/100).toFixed(2)}`),t=t.replace(/{{tax}}/g,`$${(this.getTotalTax()/100).toFixed(2)}`),t=t.replace(/{{discount}}/g,`$${(this.getTotalDiscount()/100).toFixed(2)}`);const n=t.match(/<CheckoutBtn>([\s\S]*?)<\/CheckoutBtn>/);if(n){const e=n[1];t=t.replace(/<CheckoutBtn>[\s\S]*?<\/CheckoutBtn>/,e.replace(/<button/,'<button class="checkout-button"'))}return t}setupEventListeners(){document.addEventListener("click",t=>{const s=t.target,n=s.closest(".qt-btn");if(n instanceof HTMLElement){const i=n.getAttribute("data-item-id"),o=n.getAttribute("data-action");if(i){const r=this.items.find(d=>d.id===i);r&&(o==="increase"?this.updateQuantity(i,r.quantity+1):o==="decrease"&&this.updateQuantity(i,r.quantity-1),this.render())}}const e=s.closest(".remove-btn");if(e instanceof HTMLElement){const i=e.getAttribute("data-item-id");i&&(this.removeItem(i),this.render())}if(s.closest(".checkout-button")){const i=new CustomEvent("cart:checkout",{detail:{items:this.items,total:this.getTotal(),subtotal:this.getSubtotal(),taxes:this.getTaxes(),discounts:this.getDiscounts()},bubbles:!0,composed:!0});document.dispatchEvent(i)}})}render(){this.container&&this.template&&(this.container.innerHTML=this.renderTemplate())}init(t){if(typeof window<"u"){if(window.cartInstance=this,t){if(this.container=document.querySelector(t),!this.container){console.warn(`Element with selector "${t}" not found. Cart will not be initialized.`);return}}else this.container=document.createElement("div"),this.container.className="cart-container",document.body.appendChild(this.container);this.template&&(this.container.innerHTML=this.renderTemplate()),this.setupEventListeners()}}getItems(){return[...this.items]}getTaxes(){return[...this.taxes]}getDiscounts(){return[...this.discounts]}clearCart(){this.items=[],this.taxes=[],this.discounts=[],this.saveToStorage(),this.render()}getTotalTax(){const t=this.getDiscountedAmount();let s=0;return this.taxes.forEach(n=>{s+=t*(n.rate/100)}),s}getTotalDiscount(){const t=this.getSubtotal();let s=0;return this.discounts.forEach(n=>{n.type==="percentage"?s+=t*(n.value/100):s+=n.value}),s}getDiscountedAmount(){return this.getSubtotal()-this.getTotalDiscount()}}a.getInstance();document.querySelector("#app").innerHTML=`
  <div>
   <h1>Cart.js</h1>
   <p>A simple shopping cart for your website</p>
   <div>Demo</div>
    <div id="cart-container"></div>
  </div>
`;const c=new a;c.addItem({id:"ii_1MtGUtLkdIwHu7ixBYwjAM02",amount:1e4,image:"https://img.drz.lazcdn.com/static/bd/p/f900e35fe0c633d904dbdaf28e880964.png_400x400q75.png_.webp",currency:"usd",customer:"cus_NeZei8imSbMVvi",date:1680640231,title:"TP-Link TL-WR840N",description:"TP-Link TL-WR840N Wireless N Router",discountable:!0,discounts:[],metadata:{},quantity:1,subscription:null,tax_rates:[]});c.addItem({id:"12",image:"https://img.drz.lazcdn.com/static/bd/p/f887d3133e1ce569b28be6c84a76e3c8.jpg_400x400q75.jpg_.webp",amount:1e4,title:"TP-Link TL-WR840N",description:"TP-Link TL-WR840N Wireless N Router"});const f=`
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

`;c.setTemplate(f);c.init("#cart-container");document.addEventListener("cart:checkout",u=>{console.log("Checkout event triggered:",u.detail),console.log("Total:",c.getTotal())});
