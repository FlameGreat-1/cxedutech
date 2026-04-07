
{
  "id": "pi_3TJgPrLKVi4mWW370kaH4kXQ",
  "object": "payment_intent",
  "amount": 1084072,
  "amount_details": {
    "tip": {}
  },
  "automatic_payment_methods": {
    "allow_redirects": "always",
    "enabled": true
  },
  "canceled_at": null,
  "cancellation_reason": null,
  "capture_method": "automatic_async",
  "client_secret": "pi_3TJgPrLKVi4mWW370kaH4kXQ_secret_cfRarCYJh6N0GEAXr59p3CZaY",
  "confirmation_method": "automatic",
  "created": 1775594407,
  "currency": "ngn",
  "description": null,
  "excluded_payment_method_types": null,
  "last_payment_error": null,
  "livemode": false,
  "next_action": null,
  "payment_method": "pm_1TJhfLLKVi4mWW37M3pNQnLh",
  "payment_method_configuration_details": {
    "id": "pmc_1RSNpWLKVi4mWW37yn9KstNW",
    "parent": null
  },
  "payment_method_types": [
    "card",
    "link"
  ],
  "processing": null,
  "receipt_email": null,
  "setup_future_usage": null,
  "shipping": null,
  "source": null,
  "status": "succeeded"
}


{
    "success": true,
    "data": {
        "clientSecret": "pi_3TJgPrLKVi4mWW370kaH4kXQ_secret_cfRarCYJh6N0GEAXr59p3CZaY",
        "payment": {
            "id": 82,
            "order_id": 103,
            "provider": "stripe",
            "stripe_payment_intent_id": "pi_3TJgPrLKVi4mWW370kaH4kXQ",
            "paystack_reference": null,
            "amount": "10840.72",
            "currency": "NGN",
            "payment_method": "card",
            "status": "pending",
            "created_at": "2026-04-07T20:40:05.798Z",
            "updated_at": "2026-04-07T20:40:05.798Z",
            "currency_symbol": "₦"
        }
    }
}


{
    "status": true,
    "message": "Access code validated",
    "data": {
        "email": "intellidev69@gmail.com",
        "merchant_logo": "https://public-files-paystack-prod.s3.eu-west-1.amazonaws.com/integration-logos/paystack.jpg",
        "merchant_name": "cotradie",
        "amount": 1683636,
        "domain": "test",
        "currency": "NGN",
        "id": 6014904573,
        "channels": [
            "card",
            "bank_transfer",
            "bank",
            "ussd"
        ],
        "label": "",
        "original_amount": 1683636,
        "added_fees": 0,
        "merchant_id": 1784987,
        "merchant_key": "pk_test_a07387f5e467f5eb42cab39b86a8c3e04cb6fc6b",
        "access_code": "65o4ge4i96vgder",
        "transaction_status": "abandoned",
        "log": null,
        "customer": {
            "id": 351653062
        },
        "reference": "inflexa_105_1e271a0be0365789d31eeb81",
        "saved_cards": {
            "enabled": false,
            "registered": false,
            "registered_phone": null,
            "registered_calling_code": null
        },
        "customer_code": "CUS_u9whm2r79y05zbs",
        "channel_settings": {
            "card": {
                "request_for_card_holder_name": false
            }
        },
        "plan_details": null,
        "channel_options": {
            "bank_transfer": [
                "wema-bank",
                "test-bank"
            ],
            "ussd": [
                "737",
                "919",
                "966"
            ]
        },
        "merchant_channel_settings": {
            "bank_transfer": {
                "fulfil_late_notification": false
            }
        },
        "link_config": {
            "enabled": true,
            "has_payment_instruments": false,
            "has_linked_accounts": false,
            "has_saved_cards": false,
            "registered": false,
            "registered_phone": null,
            "registered_calling_code": null
        },
        "supported_banks": [
            {
                "id": 67,
                "name": "Kuda Bank",
                "slug": "kuda-bank",
                "gateway": "digitalbankmandate",
                "code": "50211",
                "types": [
                    "wallet"
                ]
            },
            {
                "id": 82,
                "name": "Carbon",
                "slug": "carbon",
                "gateway": "digitalbankmandate",
                "code": "565",
                "types": [
                    "wallet"
                ],
                "logo_url": "https://pstk-integration-logos.s3.eu-west-1.amazonaws.com/carbon.png",
                "account_identifier": {
                    "name": "Account Number",
                    "validation": "/^[0-9]{10,10}$/"
                }
            },
            {
                "id": 169,
                "name": "PalmPay",
                "slug": "palmpay",
                "gateway": "ibank",
                "code": "999991",
                "types": [
                    "wallet"
                ]
            },
            {
                "id": 171,
                "name": "OPay Digital Services Limited (OPay)",
                "slug": "paycom",
                "gateway": "ibank",
                "code": "999992",
                "types": [
                    "wallet"
                ]
            },
            {
                "id": 770,
                "name": "Pocket App",
                "slug": "pocket",
                "gateway": "digitalbankmandate",
                "code": "00716",
                "types": [
                    "wallet"
                ]
            }
        ],
        "exchange_rate": {
            "id": 317494,
            "rate": 0.0007445767
        },
        "public_encryption_key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnBaWj2t3CwC6kxlhHYxKs2eirgl0kYohe6MZaNKS7XbS1zWlM2xZlaY9fUZbn9jlWv+GGaKWci2gaGBU45JXAqzlpQbuWiMYavcfG19kB1dBNy6vOH++uJSEPNud7EwaBpdY9YENMkKKcEkTAZNXhifGGcSlAaBQ9NZmYdG5bTBiht1TsQk19GLOcS9DftjlAk7EadAVnfJBLLnVgZxBDTMP5L4LW1EMAS8y8Lwp98LWu7T3Of2X0+37+BvbdGRomuwn/KejnUmKjUrFOrrNHz+h2MbH2AUgLkR+Wd5FX+/YDZI1TXHhVMLVmM08ZZr0HpoLevjwCgv7CMhtvm7q6wIDAQAB",
        "whitelabel": false
    }
}




{
    "success": true,
    "data": {
        "id": 105,
        "user_id": null,
        "total_amount": "16836.36",
        "currency": "NGN",
        "order_status": "Pending",
        "shipping_name": "Emmanuel Ugochukwu Iziogo",
        "shipping_email": "intellidev69@gmail.com",
        "shipping_phone": "+2348136872013",
        "shipping_address_line1": "471 alaba international market, ojo Lagos",
        "shipping_address_line2": "20 agbawi",
        "shipping_city": "Lagos",
        "shipping_state": "Lagos",
        "shipping_postal_code": "460106",
        "shipping_country": "NG",
        "shipment_id": null,
        "tracking_code": null,
        "created_at": "2026-04-07T21:13:47.752Z",
        "updated_at": "2026-04-07T21:13:47.752Z",
        "idempotency_key": "da2d7571-4e54-46fc-8705-ab7d7e4c8c3d",
        "subtotal": "14000.00",
        "shipping_cost": "36.36",
        "shipping_carrier": "USPS",
        "shipping_service": "First Class Package International Service",
        "tax_amount": "2800.00",
        "tax_rate": "20.00",
        "shipping_provider": "shippo",
        "items": [
            {
                "id": 174,
                "order_id": 105,
                "product_id": 18,
                "quantity": 1,
                "unit_price": "14000.00",
                "currency": "NGN",
                "currency_symbol": "₦"
            }
        ],
        "currency_symbol": "₦"
    }
}




{success: true,…}
data
: 
{id: 105, user_id: null, total_amount: "16836.36", currency: "NGN", order_status: "Pending",…}
created_at
: 
"2026-04-07T21:13:47.752Z"
currency
: 
"NGN"
currency_symbol
: 
"₦"
id
: 
105
idempotency_key
: 
"da2d7571-4e54-46fc-8705-ab7d7e4c8c3d"
items
: 
[{id: 174, order_id: 105, product_id: 18, quantity: 1, unit_price: "14000.00", currency: "NGN",…}]
order_status
: 
"Pending"
shipment_id
: 
null
shipping_address_line1
: 
"471 alaba international market, ojo Lagos"
shipping_address_line2
: 
"20 agbawi"
shipping_carrier
: 
"USPS"
shipping_city
: 
"Lagos"
shipping_cost
: 
"36.36"
shipping_country
: 
"NG"
shipping_email
: 
"intellidev69@gmail.com"
shipping_name
: 
"Emmanuel Ugochukwu Iziogo"
shipping_phone
: 
"+2348136872013"
shipping_postal_code
: 
"460106"
shipping_provider
: 
"shippo"
shipping_service
: 
"First Class Package International Service"
shipping_state
: 
"Lagos"
subtotal
: 
"14000.00"
tax_amount
: 
"2800.00"
tax_rate
: 
"20.00"
total_amount
: 
"16836.36"
tracking_code
: 
null
updated_at
: 
"2026-04-07T21:13:47.752Z"
user_id
: 
null
success
: 
true
MCP server
CrUX data in performance trace summaries, a new --slim mode, specialized skills and experimental screen recording support.

Preserve Console history edits
Modify a previous command, browse for another one, and return to your draft without losing your work.

Improved support for adopted stylesheets
Adopted Style Sheets are now grouped under a dedicated #adopted-style-sheets node within the DOM tree in the Elements panel.





{items: [{product_id: 18, quantity: 1}],…}
currency
: 
"NGN"
items
: 
[{product_id: 18, quantity: 1}]
0
: 
{product_id: 18, quantity: 1}
product_id
: 
18
quantity
: 
1
shipping
: 
{shipping_name: "Emmanuel Ugochukwu Iziogo", shipping_email: "intellidev69@gmail.com",…}
shipping_address_line1
: 
"471 alaba international market, ojo Lagos"
shipping_address_line2
: 
"20 agbawi"
shipping_city
: 
"Lagos"
shipping_country
: 
"NG"
shipping_email
: 
"intellidev69@gmail.com"
shipping_name
: 
"Emmanuel Ugochukwu Iziogo"
shipping_phone
: 
"+2348136872013"
shipping_postal_code
: 
"460106"
shipping_state
: 
"Lagos"






{success: true, data: {authorization_url: "https://checkout.paystack.com/65o4ge4i96vgder",…}}
data
: 
{authorization_url: "https://checkout.paystack.com/65o4ge4i96vgder",…}
authorization_url
: 
"https://checkout.paystack.com/65o4ge4i96vgder"
payment
: 
{id: 86, order_id: 105, provider: "paystack", stripe_payment_intent_id: null,…}
reference
: 
"inflexa_105_1e271a0be0365789d31eeb81"
success
: 
true





{
    "success": true,
    "data": {
        "authorization_url": "https://checkout.paystack.com/65o4ge4i96vgder",
        "reference": "inflexa_105_1e271a0be0365789d31eeb81",
        "payment": {
            "id": 86,
            "order_id": 105,
            "provider": "paystack",
            "stripe_payment_intent_id": null,
            "paystack_reference": "inflexa_105_1e271a0be0365789d31eeb81",
            "amount": "16836.36",
            "currency": "NGN",
            "payment_method": "card",
            "status": "pending",
            "created_at": "2026-04-07T21:15:58.866Z",
            "updated_at": "2026-04-07T21:15:58.866Z",
            "currency_symbol": "₦"
        }
    }
}



{
    "analytics": {
        "endpoint": "/i/v0/e/"
    },
    "autocaptureExceptions": true,
    "autocapture_opt_out": false,
    "captureDeadClicks": false,
    "capturePerformance": {
        "network_timing": true,
        "web_vitals": true,
        "web_vitals_allowed_metrics": null
    },
    "conversations": false,
    "defaultIdentifiedOnly": true,
    "elementsChainAsString": true,
    "errorTracking": {
        "autocaptureExceptions": true,
        "suppressionRules": []
    },
    "hasFeatureFlags": false,
    "heatmaps": false,
    "logs": {
        "captureConsoleLogs": false
    },
    "productTours": false,
    "sessionRecording": false,
    "siteApps": [],
    "supportedCompression": [
        "gzip",
        "gzip-js"
    ],
    "surveys": false,
    "token": "phc_LZ6VShmQYuGQM536EGOroVpmYKcpeL7U4bbtN3govL0"
}


    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBpbmZsZXhhLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3NTU5NzIzMCwiZXhwIjoxNzc1NjgzNjMwfQ.MVl9hYXFIe5kqCYFvHsB6oP5cl1PSWXvqJegZvt1NYo",
        "user": {
            "id": 1,
            "username": "admin",
            "email": "admin@inflexa.com",
            "role": "admin",
            "created_at": "2026-03-30T22:21:21.678Z"
        }
    }
}


