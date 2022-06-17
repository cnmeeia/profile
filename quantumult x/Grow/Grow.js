
// https:\/\/api\.revenuecat\.com




const obj =
 {
  "request_date_ms" : 1655439711875,
  "request_date" : "2022-06-17T04:21:51Z",
  "subscriber" : {
    "non_subscriptions" : {

    },
    "first_seen" : "2022-06-17T03:48:34Z",
    "original_application_version" : "782",
    "other_purchases" : {

    },
    "management_url" : "https://apps.apple.com/account/subscriptions",
    "subscriptions" : {
      "grow_1y_128" : {
        "is_sandbox" : false,
        "ownership_type" : "PURCHASED",
        "billing_issues_detected_at" : null,
        "period_type" : "active",
        "expires_date" : "2099-06-24T04:21:39Z",
        "grace_period_expires_date" : null,
        "unsubscribe_detected_at" : null,
        "original_purchase_date" : "2022-06-17T04:21:39Z",
        "purchase_date" : "2022-06-17T04:21:39Z",
        "store" : "app_store"
      }
    },
    "entitlements" : {
      "grow.pro" : {
        "grace_period_expires_date" : null,
        "purchase_date" : "2022-06-17T04:21:39Z",
        "product_identifier" : "grow_1y_128",
        "expires_date" : "2099-06-24T04:21:39Z"
      }
    },
    "original_purchase_date" : "2022-06-17T03:47:31Z",
    "original_app_user_id" : "$RCAnonymousID:1d8a908e87e84538b64f6d606872ab3e",
    "last_seen" : "2022-06-17T03:48:34Z"
  }
}

$done({body: JSON.stringify(obj)});
