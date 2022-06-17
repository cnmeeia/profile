
// https://api.revenuecat.com/v1/receipts



const obj =
 {
  "request_date_ms" : 1655434983135,
  "request_date" : "2022-06-17T03:03:03Z",
  "subscriber" : {
    "non_subscriptions" : {

    },
    "first_seen" : "2022-06-17T03:01:43Z",
    "original_application_version" : "17",
    "other_purchases" : {

    },
    "management_url" : "https://apps.apple.com/account/subscriptions",
    "subscriptions" : {
      "com.songswipe.monthly" : {
        "is_sandbox" : false,
        "ownership_type" : "PURCHASED",
        "billing_issues_detected_at" : null,
        "period_type" : "trial",
        "expires_date" : "2122-06-20T03:02:56Z",
        "grace_period_expires_date" : null,
        "unsubscribe_detected_at" : null,
        "original_purchase_date" : "2022-06-17T03:02:57Z",
        "purchase_date" : "2022-06-17T03:02:56Z",
        "store" : "app_store"
      }
    },
    "entitlements" : {
      "SongSwipe Pro" : {
        "grace_period_expires_date" : null,
        "purchase_date" : "2022-06-17T03:02:56Z",
        "product_identifier" : "com.songswipe.monthly",
        "expires_date" : "2122-06-20T03:02:56Z"
      }
    },
    "original_purchase_date" : "2022-06-17T03:01:29Z",
    "original_app_user_id" : "$RCAnonymousID:ffa5e25642d04fac9310bbad326aab45",
    "last_seen" : "2022-06-17T03:01:43Z"
  }
}
$done({body: JSON.stringify(obj)});
