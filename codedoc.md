## Code Documentation

### How to change splash screen background and logo ?

android/app/src/main/res/drawable

Update with your files

### How to change lottie animation ?
 Visit https://lottiefiles.com/ and get your favourite one's lottie json and paste it on src/components/loader_animation.json
### How to change ic_launcher icons

Go to android/app/src/main/res and update icons in midmap folders. Update both 'ic_launcher_foreground.png' and 'ic_launcher.png' because the basic behavior is being overrided from android/app/src/main/res/mipmap-anydpi-v26/*.xml

### How to replace facebook app id ?

Open android/app/src/main/res/values/strings.xml and replace facebook_app_id, fb_login_protocol_scheme with your app id and schme respectively.

### Where to change google-service.json ?

android/app/google-services.json

### Where to change branch keys ?

android/app/src/main/AndroidManifest.xml or branch.json (if you are using branch.json omit in manifest.xml)

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

### How to enable screen shot

Find this file android/app/src/main/java/com/example/rn/MainActivity.java and comment this line

```getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);```

### How to detect while app is being switched ?

Listen for the action "appState" from webview and process the state data.

Eg:

```var appStateAction = (message)=>{
        	let json = message.data;
            switch(json.action){
              case 'appState':
              	let reply = json.message;
                spa.focus_lost_count = reply.appStateCount;
                if(spa.focus_lost_count==1)
                {
                    //first time app switched
                }
                else if(spa.focus_lost_count>1){
                    //switched again
                }
              break;
              default: console.log('unknown event recieved');
            }
};
window.addEventListener("message", appStateAction);```