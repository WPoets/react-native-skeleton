## Code Documentation

### How to change splash screen background and logo ?

src/images

Replace background.png and logo.png 


### How to replace facebook app id ?

Open android/app/src/main/res/values/strings.xml and replace facebook_app_id, fb_login_protocol_scheme with your app id and schme respectively.

### Where to change google-service.json ?

android/app/google-services.json

### Where to change release key information ?

android/gradle.properties

### Where to change google webClient ID ?

App.js

```
GoogleSignin.configure({
	webClientId: '<REPLACE ME WITH YOU YOUR WEB CLIENT ID>',
});
```

### How to respond to new postMessage actions ?

App.js

```
onMessageReceived
```

Modify above function to add your own custom actions

### How to configure payU money ?

App.js

```
/*** Process PayU */
	processPayU = async (data) => {
		let txnId = this.randomTxnId();
		data.txnId = txnId;
		const payData = {
			amount: data.amount,
			txnId: data.txnId,
			productName: data.productName,
			firstName: data.firstName,
			email: data.email,
			phone: data.phone,
			merchantId: '123456',
			key: 'abcdefgh',
			successUrl: 'https://www.payumoney.com/mobileapp/payumoney/success.php',
			failedUrl: 'https://www.payumoney.com/mobileapp/payumoney/failure.php',
			isDebug: true,
			hash: this.hashGenerator(data)
		};

		let response = await PayuMoney(payData);
		return response;
	};

	/*** Hash Generator ****/
	hashGenerator = (data) => {
		return HashGenerator({
			key: "abcdefgh",
			amount: data.amount,
			email: data.email,
			txnId: data.txnId,
			productName: data.productName,
			firstName: data.firstName,
			salt: "qwertyuiop",
		});
	}
```

Update merchantId, key, salt and product details

### How to update webView source ?

App.js

```
WebView
    originWhitelist={["https://", "file://"]}
    allowsInlineMediaPlayback
    source={{ uri: 'https://example.com' }}
```
Find the above code and change the source