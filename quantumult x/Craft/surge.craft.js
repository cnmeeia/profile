const obj = {
  "subscription" : {
    "tier" : "Pro",
    "subscriptionActive" : true,
    "expirationDate" : 11645281551129,
    "subscriptionType" : "license",
    "rawSubscriptionType" : "Subscription",
    "productId" : "2-day"
  },
};
$done({headers:{'Content-Type':'application/json'},body:JSON.stringify(obj)});
