# Question

Design an e-commerce website that allows users to browse products and purchase them.

## Real-life examples

- [Amazon](https://www.amazon.com)
- [ebay](https://www.ebay.com)
- [walmart](https://www.walmart.com)
- [flipkart](https://www.flipkart.com)

# Requirements exploration

## Functional Requirements

### What are the core features to be supported?

- Browsing products.
- Adding products to cart.
- Checking out successfully.

### What are the pages in the website?

- Product listing page (PLP)
- Product details page (PDP)
- Cart page
- Checkout page

### What product details will be shown on the PLPs and PDPs?

- PLPs: Product name, Product image, Price.
- PDPs: Product name, Product images (multiple), Product description, Price.

### What does the user demographics look like?

- International users of a wide age range: US, Asia, Europe, etc.

## Non-functional requirements?

- Each page should load under 2 seconds. Interactions with page elements should respond quickly.

### What devices will the application be used on?

All possible devices: laptop, tablets, mobile, etc.

Do users have to be signed in to purchase?
Users can purchase as a guest without being signed in.

## Architecture / high-level design

### Component responsibilities

- **Server**: Provides HTTP APIs to fetch products data, cart items, modify the carts and create orders.
- **Controller**: Controls the flow of data within the application and makes network requests to the server.
- **Client Store**: Stores data needed across the whole application. Since there are many pages with data some amount of overlapping data, a client store is useful for sharing data across sections of a page and across pages.
- **Pages**:
  - **Product List**: Displays a list of product items that can be added to the cart.
  - **Product Details**: Displays details of a single product along with additional details.
  - **Cart**: Displays added cart items and allows changing of quantity and deleting added items.
  - **Checkout**: Displays address and payment forms the user has to complete in order to place the order.

### Server-side rendering or client-side rendering?

SEO is important for e-commerce websites, hence SSR should be a priority.

### What top e-commerce sites use

Let's take a look at e-commerce sites in the wild and their rendering choices:

| Site     | Architecture | Rendering | UI Framework |
| -------- | ------------ | --------- | ------------ |
| Amazon   | MPA          | SSR       | In-house     |
| eBay     | MPA          | SSR       | Marko        |
| Walmart  | SPA          | SSR       | React        |
| Flipkart | SPA          | SSR       | React        |

All these e-commerce sites use SSR! This suggests the importance of using SSR for e-commerce sites.

## Data model

| Entity           | Source              | Belongs To                                 | Fields                                                                         |
| ---------------- | ------------------- | ------------------------------------------ | ------------------------------------------------------------------------------ |
| `ProductList`    | Server              | Product Listing Page                       | `products` (list of Products), `pagination` (pagination metadata)              |
| `Product`        | Server              | Product Listing Page, Product Details Page | `name`, `description`, `unit_price`, `currency`, `primary_image`, `image_urls` |
| `Cart`           | Server              | Client Store                               | `items` (list of `CartItems`), `total_price`, `currency`                       |
| `CartItem`       | Server              | Client Store                               | `quantity`, `product`, `price`, `currency`                                     |
| `AddressDetails` | User input (Client) | Checkout Page                              | `name`, `country`, `street`, `city`, etc.                                      |
| `PaymentDetails` | User input (Client) | Checkout Page                              | `card_number`, `card_expiry`, `card_cvv`                                       |

- Few points for discussion:

  - The `Cart` entity belongs to the Client Store because some websites might want to show the number of cart items in the navbar or have a popup to allow users to quickly access the cart items and make modifications. If there's no such need then it's acceptable for the cart to belong to the Cart page.

  - `Cart` and `CartItem` have `total_price` and `price` fields respectively fetched as part of the server response instead of having the client compute the price (multiply the quantity by the `unit_price`) to give the flexibility of applying discounts due to bulk purchase or use of promo codes. The price computation logic is defined on the server, so the final price should be computed on the server and the client should rely on the server to calculate the total price instead of making its own calculations.

  - Since our website has an international audience, we should have localized prices in the user's `currency`, hence the currency field.

## Interface definition (API)

1. Product Information
   - Fetch products listing
   - Fetch a particular product's detail
2. Cart Modification
   - Add a product to the cart
   - Change quantity of a product in the cart
   - Remove a product from the cart
3. Complete the order

We can also assume that a user only has a maximum of one cart and the user's current cart can be retrieved on the server. Hence we can omit passing the cart ID as arguments for any APIs related to cart modification.

### Fetch products listing

| Field       | Value                       |
| ----------- | --------------------------- |
| HTTP Method | `GET`                       |
| Path        | `/products`                 |
| Description | Fetches a list of products. |

**Parameters**

| Parameter    | Type     | Description                                  |
| ------------ | -------- | -------------------------------------------- |
| `size`       | `number` | Number of results per page                   |
| `page`       | `number` | Page number to fetch                         |
| `search`     | `string` | Search term to filter products by name, etc. |
| `sort_by`    | `string` | Field to sort products by                    |
| `sort_order` | `string` | Sort order (asc or desc)                     |

**Sample response**

```json
{
  "pagination": {
    "size": 5,
    "page": 2,
    "total_pages": 4,
    "total": 20
  },
  "results": [
    {
      "id": 123, // Product ID.
      "name": "Cotton T-shirt",
      "description": "Cotton T-shirt",
      "base_price": 12,
      "category": {
        "id": 1,
        "name": "Shirts",
        "image_url": "https://www.greatcdn.com/img/shirts.jpg"
      }
      // ... More product details.
    }
    // ... More products.
  ]
}
```

We use offset-based pagination here as opposed to cursor-based pagination because:

- Having page numbers is useful for navigating between search results and jumping to specific pages.
- Product results do not suffer from the stale results issue that much as new products are not added that quickly/frequently.
- It's useful to know how many total results there are.

### Fetch product details

| Field       | Value                             |
| ----------- | --------------------------------- |
| HTTP Method | GET                               |
| Path        | /products/{productId}             |
| Description | Fetches the details of a product. |

**Parameters**
| Parameter | Type | Description |
| --- | --- | --- |
| productId | number | ID of product to be fetched |
**Sample response**

```json
{
  "id": 123, // Product ID.
  "name": "Cotton T-shirt",
  "description": "Cotton T-shirt",
  "base_price": 12,
  "category": {
    "id": 1,
    "name": "Shirts",
    "image_url": "https://www.greatcdn.com/img/shirts.jpg"
  }
  // ... More product details.
}
```

### Add a product to cart

| Field       | Value                     |
| ----------- | ------------------------- |
| HTTP Method | `POST`                    |
| Path        | `/cart/products`          |
| Description | Add a product to the cart |

**Parameters**
| Parameter | Type | Description |
| --- | --- | --- |
| productId | `number` | ID of product to be added |
| quantity | `number` | Number of items to be added |

**Sample response**

The updated cart object is returned.

```json
{
  "id": 789, // Cart ID.
  "total_price": 24,
  "currency": "USD",
  "items": [
    {
      "quantity": 2,
      "price": 24,
      "currency": "USD",
      "product": {
        "id": 123, // Product ID.
        "name": "Cotton T-shirt",
        "primary_image": "https://www.greatcdn.com/img/t-shirt.jpg"
      }
    }
  ]
}
```

### Change quantity of product in cart

| Field       | Value                                    |
| ----------- | ---------------------------------------- |
| HTTP Method | `PUT`                                    |
| Path        | `/cart/products/{productId}/`            |
| Description | Change quantity of a product in the cart |

**Parameters**

| Parameter | Type     | Description                  |
| --------- | -------- | ---------------------------- |
| productId | `number` | ID of product to be modified |
| quantity  | `number` | New quantity of the product  |

**Sample response**

The updated cart object is returned.

```json
{
  "id": 789, // Cart ID.
  "total_price": 24,
  "currency": "USD",
  "items": [
    {
      "quantity": 3,
      "price": 36,
      "currency": "USD",
      "product": {
        "id": 123, // Product ID.
        "name": "Cotton T-shirt",
        "primary_image": "https://www.greatcdn.com/img/t-shirt.jpg"
      }
    }
  ]
}
```

## Remove product from cart

| Field       | Value                          |
| ----------- | ------------------------------ |
| HTTP Method | `DELETE`                       |
| Path        | `/cart/products/{productId}  ` |
| Description | Remove a product from the cart |

**Parameters**  
| Parameter | Type | Description |
| ----------- | ------ | ---------------------------- |
| productId | `number` | ID of product to be removed |

**Sample response**

The updated cart object is returned.

```json
{
  "id": 789, // Cart ID.
  "total_price": 0,
  "currency": "USD",
  "items": []
}
```

## Place order

| Field       | Value                       |
| ----------- | --------------------------- |
| HTTP Method | `POST`                      |
| Path        | `/order`                    |
| Description | Create an order from a cart |

**Parameters**
| Parameter | Type | Description |
| -------------- | ------ | ---------------------------- |
| cartID | `number` | ID of the cart containing the items |
| address_details | `object` | Object containing address fields |
| payment_details | `object` | Object containing payment method fields (credit card) |

**Sample response**
The order object is returned upon successful order creation.

```json
{
  "id": 456, // Order ID.
  "total_price": 36,
  "currency": "USD",
  "items": [
    // ... Same items as per the cart.
  ],
  "address_details": {
    "name": "John Doe",
    "country": "US",
    "address": "1600 Market Street",
    "city": "San Francisco"
    // ... Other address fields.
  },
  "payment_details": {
    // Only show the last 4 digits.
    // We shouldn't be storing the credit card number
    // unencrypted anyway.
    "card_last_four_digits": "1234"
  }
}
```

## Notes

Depending on whether we want to optimize for returning users, we might want to save the address and payment details on the cart object so that people who abandoned the cart after filling up the checkout form but before placing the order and resume from where they left off without having to fill up the forms again.

## Optimizations and deep dive

### Performance

Performance is absolutely critical for e-commerce websites. Seemingly small performance improvements can lead to significant revenue and conversion increases. A [study by Google and Deloitte](https://web.dev/case-studies/milliseconds-make-millions) showed that even a 0.1 second improvement in load times can improve conversion rates across the purchase funnel. [web.dev by Google has a long list of case studies of how improving site performance led to improved conversions.](https://web.dev/case-studies)

**General performance tips**

- Code split JavaScript by routes/pages.
- Split content into separate sections and prioritize above-the-fold content while lazy loading below-the-fold content.
- Defer loading of non-critical JavaScript (e.g. code needed to show modals, dialogs, etc.).
- Prefetch JavaScript and data needed for the next page upon hover of links/buttons.
  - Prefetch full product details needed by PDPs when users hover over items in PLPs.
  - Prefetch checkout page while on the cart page.
- Optimize images with lazy loading and adaptive loading.
- Prefetching top search results.

**Core Web Vitals**

Know the various core web vital metrics, what they are, and how to improve them.

[Largest Contentful Paint (LCP)](https://web.dev/articles/lcp): The render time of the largest image or text block visible within the viewport, relative to when the page first started loading.

- Optimize performance – loading of JavaScript, CSS, images, fonts, etc.

[First Input Delay (FID)](https://web.dev/articles/fid): Measures load responsiveness because it quantifies the experience users feel when trying to interact with unresponsive pages. A low FID helps ensure that the page is usable.

- Reduce the amount of JavaScript needed to be executed on page load.
  [Cumulative Layout Shift (CLS)](https://web.dev/articles/cls): Measures visual stability because it helps quantify how often users experience unexpected layout shifts. A low CLS helps ensure that the page is delightful.
- Include size attributes on images and video elements or reserve space for these elements using CSS aspect-ratio to reserve the required space for images while the images are loading. Use CSS min-height to minimize layout shifts while elements are lazy loaded.

### Search engine optimization

SEO is extremely important for e-commerce websites as organic search is the primary way people discover products.

- PDPs should have proper `<title>` and `<meta>` tags for description, keywords, and [open graph tags.](https://ahrefs.com/blog/open-graph-meta-tags/)
- Generate a sitemap.xml to tell crawlers the available pages of the website.
- Use [JSON structured data](https://developer.chrome.com/docs/lighthouse/seo/structured-data) to help search engines understand the kind of content on your page. For the e-commerce case, the [Product type](https://developers.google.com/search/docs/appearance/structured-data/product) would be the most relevant.
- Use semantic markup for elements on the page, which also helps accessibility.
- Ensure fast loading times to help the website rank better in Google search.
- Use SSR for better SEO because search engines can index the content without having to wait for the page to be rendered (in the case of CSR).
- Pre-generate pages for popular searches or lists.

### Images

Images are one of the largest contributors to page size and serving optimized images is absolutely essential on e-commerce websites which are image heavy where every product has at least one image.

- Use the [WebP image format](https://web.dev/articles/serve-images-webp) which is the most efficient image format that currently exists. eBay uses WebP format across all their web, Android and iOS apps. Ensure you are able to articulate on a high level why WebP format is superior.
- Images should be hosted on a CDN.
- Define the priority of the images and divide them into critical and non-critical assets.
- Lazy load below-the-fold images.
- Use `<img loading="lazy">` for non-critical images.
- Load critical images early.
- Inline the image within the HTML as a data blob so that there's no need to make a separate HTTP request to fetch the image.
- Using `<link rel="preload">` so they download as soon as possible.
- [Adaptive loading](https://web.dev/articles/adaptive-loading-cds-2019) of images, loading high-quality images for devices on fast networks and using lower-quality images for devices on slow networks.

### Form Optimization

- Country spesific address form
  Different countries have different address formats. To optimize for global shipping, having localized address forms help greatly in improving conversions and that users do not drop off when filling out the address forms because they do not know how to understand certain fields. For example:

  - "ZIP Code"s are called "Postal Code"s in the United Kingdom.
  - There are no states in the Japan, only prefectures.
  - Different countries have their own postal/zip code formats and require different validation.
    [Stripe Checkout](https://checkout.stripe.dev/checkout), [FRANK'S COMPULSIVE GUIDE TO POSTAL ADDRESSES](https://www.columbia.edu/~fdc/postal/)

- Optimize autofilling
  Help users autofill their address forms by specifying the right `type` and `autocomplete` values for the form `<input>`s for the shipping address forms and credit card forms.
- Shipping Address Form
  | Field | type | autocomplete | Others |
  | -------------- | -------------- | ----------------------- | -------------------------------------------------------------- |
  | Name | `text` | shipping name | `autocorrect="off"` `spellcheck="false"` |
  | Country | Use `<select>` | shipping country | N/A |
  | Address line 1 | `text` | shipping address-line1 | `autocorrect="off"` `spellcheck="false"` |
  | Address line 2 | `text` | shipping address-line1 | `autocorrect="off"` `spellcheck="false"` |
  | City | `text` | shipping address-level2 | `autocorrect="off"` `spellcheck="false"` |
  | State | Use` <select>` | shipping address-level1 | N/A |
  | Postal Code | `text` | shipping postal-code | `autocorrect="off"` `spellcheck="false"` `inputmode="numeric"` |

- Credit Card Form
  | Field | type | autocomplete | Others |
  |-------------|------|--------------|---------------------------------------------------------|
  | Card Number | `text` | cc-number |` autocorrect="off"` `spellcheck="false` `inputmode="numeric"` |
  | Card Expiry | `text` | cc-exp |` autocorrect="off"` `spellcheck="false` `inputmode="numeric"` |
  | Card CVC | `text` | cc-csc |` autocorrect="off"` `spellcheck="false` `inputmode="numeric"` |
- Error messages

  Leverage client-side validation and clearly communicate any form errors. Connect the error message to the `<input>` via `aria-describedby` and use `aria-live="assertive"` for the error message. [Help users find the error message for a form control](https://web.dev/learn/forms/accessibility/#help-users-find-the-error-message-for-a-form-control)

- [Payment Form](https://web.dev/learn/forms/payment/)
- [Payment and address form best practices](https://web.dev/articles/payment-and-address-form-best-practices)

### Accessibility

- Use semantic elements where possible: headings, buttons, links, inputs instead of styled `<div>`s.
- `<img>` tags should have the alt attribute specified or left empty if the merchant did not provide a description for them.
- Building accessible forms has been covered in detail above. In summary:
  - `<input>`s should have associated `<label>`s.
  - `<input>`s are linked to their error messages via aria-describedby and error messages are announced with aria-live="assertive".
    Use `<input>`s of the correct types and appropriate validation-related attributes like pattern, minlength, maxlength.
  - Visual order matches DOM order.
  - Make the currently focused form control obvious.
    Reference: [Accessibility | Forms | web.dev](https://web.dev/learn/forms/accessibility/) and [WebAIM: Creating Accessible Forms](https://webaim.org/techniques/forms/)

### Security

Since payment details are highly sensitive, we have to make sure the website is secure:

- Use HTTPS so that all communication with the server is encrypted and that other users on the same Wi-FI network cannot intercept and obtain any sensitive details.
- Payment details submission API should not be using HTTP GET because the sensitive details will be included as a query string in the request URL which will get added to the browsing history which is potentially unsafe if the browser is shared by other users. Use HTTP POST or PUT instead.
  Source: [Security and privacy | web.dev](https://web.dev/learn/forms/security-privacy/)

User experience

- Make the checkout page clean (e.g. minimal navbar and footer) and remove distractions to reduce bounce rate.
- Allow persisting cart contents (either in database or cookies) as some people spend time researching and considering, only making the purchase during subsequent sessions. You don't want them to have to add all of the items to their cart again.
- Make promo code fields less prominent so that people without promo codes will not leave the page to search the web for a promo code. Those who have a promo code beforehand will take the effort to find the promo code input field.
