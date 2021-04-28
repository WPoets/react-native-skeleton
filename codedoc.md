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
window.addEventListener("message", appStateAction);
```

### How to detect Ringer Mode

Make a postMessage communication using the action "ringerMode"

```
window.ReactNativeWebView.postMessage(`{"action":"ringerMode", "message":""}`);
```

```
var ringerModeAction = (message)=>{
	let json = message.data;
	switch(json.action){
		case 'ringerMode':
		let mode = json.message;
		console.log(mode);
		//eg: SILENT
		break;
		default: console.log('unknown event recieved');
	}
};
window.addEventListener("message", ringerModeAction);
```

### Sample Splash.js

```
import React, { Component } from 'react';
import { Animated, Text, View, ImageBackground, Image,StyleSheet } from 'react-native';
import LoadingDots from "react-native-loading-dots";
import LinearGradient from 'react-native-linear-gradient'
import NetInfo from "@react-native-community/netinfo";
class SplashScreen extends Component {
    constructor(props) {
		super(props);
		this.state = { isConnected: true}
    }

    componentDidMount() {
		this.unsubscribe = NetInfo.addEventListener(this.handleConnectivityChange);
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	handleConnectivityChange = state => {
		this.setState({ isConnected: state.isConnected });
	};

    render() {
        let Offline_Text = (
			<Text style={styles2.Offline_Text}>Check your INTERNET !</Text>
		);
        return (
            <View>
                <LinearGradient
					colors={['#1abc9c', '#004e77']}
				>
					<ImageBackground source={{ uri: 'background' }} style={styles2.backgroundImage}>
						<View style={styles2.SplashScreen_ChildView}>
							<View style={styles2.Circle}>
								<Image source={{ uri: 'logo' }}
									style={styles2.Logo} />
							</View>
							<View style={styles2.dotsWrapper}>
								<LoadingDots dots={4} size={10} colors={['#000', '#000', '#000', '#000']} />
							</View>
							<Text style={styles2.Loading1}>LOADING</Text>
							{/* <Text style={styles.Loading1}>Attitude. Skill. Knowledge.</Text>
							<Text style={styles.Loading2}> Your gateway to career success.</Text> */}
							{(this.state.isConnected === false) ? Offline_Text : null}
						</View>
					</ImageBackground>
				</LinearGradient>
            </View>

        )
    }
}

const styles2 = StyleSheet.create({
	SplashScreen_ChildView:
	{
		justifyContent: 'center',
		alignItems: 'center',
		flex: 1,
	},

	Loading1: {
		color: '#fff',
		fontFamily: 'Montserrat-Regular',
		textTransform: 'uppercase',
		fontSize: 18,
		letterSpacing: 0,
		top: 30,
		justifyContent: 'center'
	},

	Loading2: {
		color: '#fff',
		fontFamily: 'Montserrat-Regular',
		fontSize: 18,
		letterSpacing: 0,
		top: 30,
		justifyContent: 'center',
		marginTop: 10
	},

	Circle: {
		backgroundColor: '#fff',
		width: 150,
		height: 150,
		borderRadius: 100,
	},

	Logo: {
		width: '60%',
		height: '70%',
		resizeMode: 'contain',
		top: 20,
		left: 30
	},

	dotsWrapper: {
		width: 100,
		marginTop: 20,
		marginTop: 30,
		opacity: 0.5
	},

	Offline_Text: {
		width: 200,
		height: 50,
		backgroundColor: '#fff',
		textAlign: "center",
		paddingTop: 15,
		borderRadius: 50,
		bottom: 10,
		position: 'absolute'
	},

	backgroundImage: {
		height: '100%',
		width: '100%'
	},
    
    Offline_Text: {
		width: 200,
		height: 50,
		backgroundColor: '#fff',
		textAlign: "center",
		paddingTop: 15,
		borderRadius: 50,
		bottom: 10,
		position: 'absolute'
	},
});

export default SplashScreen; 
```