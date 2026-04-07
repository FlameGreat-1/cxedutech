"message":"GET /uploads/product-1775124415340-705716609.avif 304 4ms","meta":{"method":"GET","url":"/uploads/product-1775124415340-705716609.avif","status":304,"duration":4,"ip":"::ffff:172.25.0.1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"}}
server-1    | {"timestamp":"2026-04-07T07:59:15.785Z","level":"info","message":"GET /uploads/product-1775124440333-639212570.avif 304 3ms","meta":{"method":"GET","url":"/uploads/product-1775124440333-639212570.avif","status":304,"duration":3,"ip":"::ffff:172.25.0.1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"}}
server-1    | {"timestamp":"2026-04-07T07:59:15.802Z","level":"info","message":"GET /uploads/product-1775124462753-667480057.avif 304 4ms","meta":{"method":"GET","url":"/uploads/product-1775124462753-667480057.avif","status":304,"duration":4,"ip":"::ffff:172.25.0.1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"}}
server-1    | {"timestamp":"2026-04-07T07:59:23.587Z","level":"info","message":"GET /api/payments/gateways/status 304 132ms","meta":{"method":"GET","url":"/api/payments/gateways/status","status":304,"duration":132,"ip":"::ffff:172.25.0.1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"}}
server-1    | {"timestamp":"2026-04-07T07:59:44.088Z","level":"info","message":"GET /api/health 200 2ms","meta":{"method":"GET","url":"/api/health","status":200,"duration":2,"ip":"::1","userAgent":"Wget"}}
server-1    | {"timestamp":"2026-04-07T08:00:01.609Z","level":"info","message":"Order #79 created: subtotal=23000 shipping=6.08 tax=4600 total=27606.08 provider=shippo"}
server-1    | {"timestamp":"2026-04-07T08:00:01.614Z","level":"info","message":"POST /api/orders/guest 201 2406ms","meta":{"method":"POST","url":"/api/orders/guest","status":201,"duration":2406,"ip":"::ffff:172.25.0.1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"}}
server-1    | {"timestamp":"2026-04-07T08:00:06.737Z","level":"info","message":"POST /api/payments/paystack/guest/initialize 201 1139ms","meta":{"method":"POST","url":"/api/payments/paystack/guest/initialize","status":201,"duration":1139,"ip":"::ffff:172.25.0.1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"}}
server-1    | {"timestamp":"2026-04-07T08:00:15.359Z","level":"info","message":"GET /api/health 200 10ms","meta":{"method":"GET","url":"/api/health","status":200,"duration":10,"ip":"::1","userAgent":"Wget"}}
server-1    | {"timestamp":"2026-04-07T08:00:30.375Z","level":"info","message":"GET /api/products/filters 304 27ms","meta":{"method":"GET","url":"/api/products/filters","status":304,"duration":27,"ip":"::ffff:172.25.0.1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"}}
server-1    | {"timestamp":"2026-04-07T08:00:31.227Z","level":"info","message":"GET /api/payments/paystack/verify/inflexa_79_dae5ed26c6bc0e0517d07255 200 768ms","meta":{"method":"GET","url":"/api/payments/paystack/verify/inflexa_79_dae5ed26c6bc0e0517d07255","status":200,"duration":768,"ip":"::ffff:172.25.0.1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"}}
server-1    | {"timestamp":"2026-04-07T08:00:32.674Z","level":"error","message":"Shippo API error (400): {\"rate\":[\"A rate may only be purchased if it was generated with complete address information.\"]}"}
server-1    | {"timestamp":"2026-04-07T08:00:32.675Z","level":"error","message":"Auto-shipping failed for order #79","meta":{"statusCode":400}}
server-1    | {"timestamp":"2026-04-07T08:00:34.651Z","level":"info","message":"Order confirmation email sent for order #79"}
server-1    | {"timestamp":"2026-04-07T08:00:46.687Z","level":"info","message":"GET /api/health 200 9ms","meta":{"method":"GET","url":"/api/health","status":200,"duration":9,"ip":"::1","userAgent":"Wget"}}









































server-1    | {"timestamp":"2026-04-07T08:06:35.044Z","level":"info","message":"GET /api/payments/gateways/status 304 66ms","meta":{"method":"GET","url":"/api/payments/gateways/status","status":304,"duration":66,"ip":"::ffff:172.25.0.1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"}}
server-1    | {"timestamp":"2026-04-07T08:06:58.943Z","level":"info","message":"GET /api/health 200 2ms","meta":{"method":"GET","url":"/api/health","status":200,"duration":2,"ip":"::1","userAgent":"Wget"}}
server-1    | {"timestamp":"2026-04-07T08:07:13.756Z","level":"info","message":"Order #80 created: subtotal=18500 shipping=6 tax=3700 total=22206 provider=shippo"}
server-1    | {"timestamp":"2026-04-07T08:07:13.781Z","level":"info","message":"POST /api/orders/guest 201 4458ms","meta":{"method":"POST","url":"/api/orders/guest","status":201,"duration":4458,"ip":"::ffff:172.25.0.1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"}}
server-1    | {"timestamp":"2026-04-07T08:07:18.316Z","level":"info","message":"POST /api/payments/paystack/guest/initialize 201 854ms","meta":{"method":"POST","url":"/api/payments/paystack/guest/initialize","status":201,"duration":854,"ip":"::ffff:172.25.0.1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"}}
server-1    | {"timestamp":"2026-04-07T08:07:29.773Z","level":"info","message":"GET /api/products/filters 304 27ms","meta":{"method":"GET","url":"/api/products/filters","status":304,"duration":27,"ip":"::ffff:172.25.0.1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"}}
server-1    | {"timestamp":"2026-04-07T08:07:30.175Z","level":"info","message":"GET /api/health 200 3ms","meta":{"method":"GET","url":"/api/health","status":200,"duration":3,"ip":"::1","userAgent":"Wget"}}
server-1    | {"timestamp":"2026-04-07T08:07:30.713Z","level":"info","message":"GET /api/payments/paystack/verify/inflexa_80_68679287393738e4df37d80b 200 871ms","meta":{"method":"GET","url":"/api/payments/paystack/verify/inflexa_80_68679287393738e4df37d80b","status":200,"duration":871,"ip":"::ffff:172.25.0.1","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"}}
server-1    | {"timestamp":"2026-04-07T08:07:32.941Z","level":"error","message":"Auto-shipping failed for order #80","meta":{"statusCode":502}}
server-1    | {"timestamp":"2026-04-07T08:07:33.249Z","level":"info","message":"Order confirmation email sent for order #80"}
server-1    | {"timestamp":"2026-04-07T08:08:01.531Z","level":"info","message":"GET /api/health 200 4ms","meta":{"method":"GET","url":"/api/health","status":200,"duration":4,"ip":"::1","userAgent":"Wg