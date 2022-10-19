const obj = {
  "data": {
    "subscription" : {
    "tier" : "Pro",
    "subscriptionActive" : true,
    "expirationDate" : 11645281551129,
    "subscriptionType" : "license",
    "rawSubscriptionType" : "Subscription",
    "productId" : "2-day"
  },
  }
};
$done({status:200,headers:{'Content-Type':'application/json'},body:JSON.stringify(obj)});
