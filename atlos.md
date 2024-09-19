Request a DemoPricingIntegrationGet Started
Get Started
Login
Request a Demo
Pricing
FAQ
Integration
Contact Us
Vanilla Integration
Vanilla or custom integration
Use these integration instructions to add ATLOS to a custom-built website or a website built on top of a CMS that does not have an ATLOS plugin. The integration is very simple. ATLOS can be added to your website with as few as only two lines of JavaScript!

First, if you haven't done so already, sign up to get your merchant ID and the API secret. You only need a web3 compatible wallet, such as Metamask, to sign up. Once you log in, find the merchant ID and the API secret under Settings.

After you get your merchant ID, follow the instructions below:

Step 1: import ATLOS script file
On your checkout page, add the line of code below before the </body> tag:


<script async src="https://atlos.io/packages/app/atlos.js"></script>
        
Step 2: add a payment button
Add a link or a button with the onclick attribute that opens the payment widget:


<button onclick="atlos.Pay({
    merchantId: 'XYZ123',
    orderId: '123465', 
    orderAmount: 19.95, 
    orderCurrency: 'USD',
    recurrence: atlos.RECURRENCE_MONTH,
    userEmail: 'name@email.com',
    userName: 'John Smith',
    onSuccess: handleSuccess,
    onCanceled: handleCanceled,
    onCompleted: handleCompleted,
    subscriptionId: 'abc1234567',
    theme: 'light',
})">Complete Payment</button>
        
Substitute the placeholder text with:

merchantId	your merchant ID
orderId	Used to track the order. If you only sell one product, you can pass an empty string ''
orderAmount	the order amount, e.g. 1234.56
orderCurrency	(optional) the order currency, e.g. 'USD'
userEmail	(optional) if you pass user email, and the user makes a payment with a non-EVM compatible or a native coin, we will send automatic subscription payment reminders to that user
userName	(optional) the user name to incude in the subscription payment reminders
onSuccess	(optional) a callback function to call when the payment is completed successfully
onCanceled	(optional) a callback function to call when the payment widget is closed and the payment was not completed
onCompleted	(optional) a callback function to call when the payment widget is closed and the payment was completed successfully
subscriptionId	(optional) if you pass this field, the payment will be credited to that subscription ID
theme	(optional) light or dark theme, defaults to 'light'
The payment widget supports multiple languages. It detected the browser or the device default language and culture for numbers format automatically.

Recurrence interval values:

atlos.RECURRENCE_NONE	one-time payment, no recurrence
atlos.RECURRENCE_DAY	daily
atlos.RECURRENCE_WEEK	weekly
atlos.RECURRENCE_MONTH	monthly
atlos.RECURRENCE_YEAR	annually
Live example:


<button onclick="atlos.Pay({
    merchantId: 'DEMO',
    orderId: '123465', 
    orderAmount: 1.00, 
    orderCurrency: 'USD',
    recurrence: atlos.RECURRENCE_NONE,
    onSuccess: handleSuccess,
    onCanceled: handleCanceled,
    theme: 'dark',
})" class="button secondary">Click to Pay</button>
        
Try it:

Click to Pay
Optional: postback
You may set an optional postback (a.k.a. webhook) URL in Settings. Each time a payment transaction has at least one confirmation on blockchain, our system will send a POST request to that URL to notify your backend system of the successful payment.

The POST request will contain the following data in JSON format:


{
    "TransactionId": "ATLOS_transaction_number",
    "SubscriptionId": "subscription_id",
    "MerchantId": "merchant_id",
    "OrderId": "order_id",
    "Amount": amount,
    "Fee": fee,
    "Blockchain": "blockchain_code",
    "Asset": "asset_code",
    "BlockchainHash": "blockchain_transaction_hash",
    "UserAddress": "user_wallet_address",
    "OrderAmount": order_amount,            // amount in order currency
    "OrderCurrency": "order_currency",      // order currency, e.g. "EUR"
    "TimeSent": time_sent,
    "Status": 100                           // always 100 (confirmed)
}
        
We also recommend that you check the authenticity of the postback message by verifying its HMAC-SHA256 signature. We sign each message using your API secret. You can view your API secret in Settings. We pass the HMAC signature in the Signature header of the POST request.

HMAC signature verification example in NodeJS:


var crypto = require('crypto');

function verifySignature(api_secret, signature, message_data) {
    var hmac = crypto.createHmac('sha256', api_secret);
    hmac.write(message_data);
    hmac.end()
    var message_signature = hmac.read().toString('base64');

    return message_signature == signature;
}
        
Optional: get transactions API
Sometimes, your system my need to fetch all transactions or specific transactions in a given time range. This may be useful if your system was down for maintenance and needs to catch up with payments that were made while it was down. To get transactions, you may call the following endpoint:

https://atlos.io/api/merchant/GetTransactions

Example input:


{
    "MerchantId": "XYZ123",
    "TimeStart": "2020-10-20",
    "TimeFinish": "2024-10-20",
    "Skip": 100,
    "Take": 500
}
        
All fields are optional except for MerchantId. Make sure to pass your API secret in the ApiSecret header.

Example output:


{
    "TotalCount": 259,
    "Transactions": [
        {
            "TransactionId": "RpoWRCnC84cjjQ5Y",
            "Type": 2,        // 1 - payment, 2 - subscription, 3 - cancelation
            "SubscriptionId": "Xx9Gp1FJuKiP",
            "MerchantId": "XYZ123",
            "UserWallet": "0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0",
            "BlockchainCode": "PGN",
            "AssetCode": "USDC",
            "OrderId": "123465",
            "Amount": 19.950000,
            "Fee": 0.199500,
            "BlockchainHash": "0x81d4eba9504bac535d112551afc1dd35ebfc6c8306ad805728a0a886f765def6",
            "BlockNumber": 25,
            "TimeSent": "2023-06-02T02:17:04Z",
            "Status": 100
        },
        ...
    ]
}
        
Optional: cancel subscription API
Allows canceling recurring payments by the merchant.

https://atlos.io/api/merchant/CancelSubscription

Example input:


{
    "SubscriptionId": "fCuVVhyEoFAZ",
}
        
or:


{
    "MerchantId": "8Q01TM9NNX",
    "OrderId": "XYZ123",
}
        
How to view transactions
View the payments in the Payments section of the Merchant Panel. You may also verify all transaction data with the corresponding block explorers:

Ethereum Explorer

Binance Explorer

Polygon Explorer

Optimism Explorer

Arbitrum Explorer

We recommend using a separate wallet just for ATLOS transactions.

How to get help
Need integration support? Contact us at support@atlos.io.

General
Homepage
Pricing
Contact Us
Request a Demo
Merchants
Signup
Login
Integration
Accepted Coins
FAQ
Support
Resources
How Does It Work?
Crypto Savings Calculator
Benefits of Stablecoins
Accept Crypto on Shopify
Accept Crypto on WooCommerce
Accept Crypto on WHMCS
Accept Crypto on Kajabi
Accept Crypto Donations
Logo
ATLOS is a community-maintained project managed by ATLOS DAO.
    
© 2024 ATLOS DAO. All rights reserved.
Terms of Use, Privacy Policy