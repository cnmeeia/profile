var obj = {
    "id": "078f083370edc8e742e98391e6cca56bec0fbc2ecd97d2c27abd4924d65510d8",
    "operationName": "processAppleReceipt",
    "query": "mutation processAppleReceipt($receiptParams: AppleReceiptParams!)
{
    "processAppleReceipt": {
        "__typename": "SubscriptionResult",
            "error": 0,
                "subscription": {
            "__typename": "AppStoreSubscription",
                "status": "active",
                    "originalPurchaseDate": "2031-11-02T08:56:08.000Z",
                        "originalTransactionId": "360000972452688",
                            "expirationDate": "2021-11-16T09:56:08.000Z",
                                "productId": "com.gingerlabs.Notability.premium_subscription",
                                    "tier": "premium",
                                        "refundedDate": null,
                                            "refundedReason": null,
                                                "user": null
        }
    }
}
$done()
