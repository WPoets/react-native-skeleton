import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, Text, View, Platform, Dimensions, PermissionsAndroid, Alert, Button, BackHandler, Image, ImageBackground, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { check, PERMISSIONS, RESULTS, requestMultiple } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import auth from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-community/google-signin';
import SplashScreen from 'react-native-splash-screen';
import firebase from '@react-native-firebase/app';
import analytics from '@react-native-firebase/analytics';
import PushNotifier from './src/components/PushNotifier';
import { LoginButton, AccessToken, LoginManager } from 'react-native-fbsdk';
import { GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import { AppEventsLogger } from 'react-native-fbsdk';
import PayuMoney from 'react-native-payumoney';
import { HashGenerator } from 'react-native-payumoney';
import DeviceInfo from 'react-native-device-info';
import Tts from 'react-native-tts';
import LoadingDots from "react-native-loading-dots";
import NetInfo from "@react-native-community/netinfo";
import LinearGradient from 'react-native-linear-gradient'

let Analytics = firebase.analytics();

const defaultAppAnalytics = firebase.analytics();
const { width } = Dimensions.get('window');

GoogleSignin.configure({
	webClientId: '<REPLACE ME WITH YOU YOUR WEB CLIENT ID>',
});

const AndroidDefaultPermissionsRequest = async () => {
	try {
		const location = await PermissionsAndroid.request(
			PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
			{
				title: "Location Accessing Permission",
				message: "App needs access to your location.Please enable GPS.",
				buttonNeutral: "Ask Me Later",
				buttonNegative: "Cancel",
				buttonPositive: "OK"
			}
		);
		if (location === PermissionsAndroid.RESULTS.GRANTED) {
			// alert("You can use the location");
		} else {
			// alert("Location permission denied");
		}
	} catch (err) {
		console.warn(err);
	}

	requestMultiple([PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.RECORD_AUDIO, PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE, PERMISSIONS.ANDROID.MODIFY_AUDIO_SETTINGS, PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]).then(
		(statuses) => {

		},
	);

};

export async function checkPermissions() {


	check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE).then((result) => {
		switch (result) {
			case RESULTS.UNAVAILABLE:
				break;
			case RESULTS.DENIED:
				break;
			case RESULTS.GRANTED:
				break;
			case RESULTS.BLOCKED:
				break;
		}
	})
		.catch((error) => {

		});
}

export default class App extends Component<Props> {

	constructor(props) {
		super(props);
		this.state = { isConnected: true, fbAccessToken: null, webviewLoaded: false, firstLaunched: false };
		this.webView = null;
		this.onMessageReceived = this.onMessageReceived.bind(this);
		this._refPushNotifier = React.createRef();
	}

	_onLoadEnd = (e) => {
		var nativeEvent = e.nativeEvent;
		var that = this;
		setTimeout(function () {
			if (!nativeEvent.loading) {
				that.setState({ webviewLoaded: true });
				that.setState({ firstLaunched: true });
			}
		}, 3000);
	}

	_onError = (e) => {
		var nativeEvent = e.nativeEvent;
		var that = this;
		if (nativeEvent.code === -2) {
			that.setState({ webviewLoaded: false });
			that.setState({ firstLaunched: false });
		}
	}

	backAction = () => {

		Alert.alert("Hold on!", "Are you sure you want to exit from app?", [
			{
				text: "Cancel",
				onPress: () => null,
				style: "cancel"
			},
			{ text: "YES", onPress: () => BackHandler.exitApp() }
		]);
		return true;
	};

	signIn = async (webView) => {
		try {
			await GoogleSignin.hasPlayServices();
			const userInfo = await GoogleSignin.signIn();
			this.setState({ userInfo });

			let responseData = {};
			responseData.action = 'user_data';
			responseData.data = userInfo;
			this.sendToWebView(webView, JSON.stringify(responseData));
		} catch (error) {
			alert(error.code);
			if (error.code === statusCodes.SIGN_IN_CANCELLED) {
				// user cancelled the login flow
			} else if (error.code === statusCodes.IN_PROGRESS) {
				// operation (e.g. sign in) is in progress already
			} else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
				// play services not available or outdated
			} else {
				// some other error happened
			}
		}
	}

	getCurrentUser = async () => {
		const currentUser = await GoogleSignin.getCurrentUser();
		this.setState({ currentUser });
		return currentUser;
	};

	onMessageReceived = async (event, webView) => {
		var messageObject = JSON.parse(event.nativeEvent.data);
		switch (messageObject['action']) {
			case 'enableGps':
				this.fourceTOEnableGPS();
				break;
			case 'showAlert':
				Alert.alert(messageObject['msg']);
				break;
			case 'googleSignIn':
				this.signIn(webView);
				break;
			case 'googlesignOut':
				this.signOut();
				break;
			case 'logEvent':
				Analytics.setAnalyticsCollectionEnabled(true);
				// Analytics.logEvent(messageObject['message'], messageObject['properties']);
				Analytics.logEvent('goal_completion', { name: 'quiz_pass' });
				break;
			case 'getToken':
				let token = await this._refPushNotifier.current.getToken();

				let data = {};
				data.action = 'getToken';
				data.token = token;
				this.sendToWebView(webView, JSON.stringify(data));
				break;
			case 'payu_pay':
				//PayU
				let paymentInfo = await this.processPayU(messageObject.message);
				let paymentData = {};
				paymentData.action = 'payu_pay_res';
				paymentData.message = paymentInfo;
				this.sendToWebView(webView, JSON.stringify(paymentData));
				break;
			case 'speech':
				Tts.speak(messageObject['message']);
				break;
			case 'fb_event':
				//FB Custom Event
				AppEventsLogger.logEvent('fire_event', { type: "custom" });
				break;
			case 'device_info':
				let deviceData = {};
				deviceData.action = 'device_info';

				let device_data = {};
				device_data.unique_id = DeviceInfo.getUniqueId();
				device_data.application_name = DeviceInfo.getApplicationName();
				device_data.app_name = DeviceInfo.getBrand();
				device_data.build_number = DeviceInfo.getBuildNumber();
				device_data.bundle_id = DeviceInfo.getBundleId();
				device_data.device_id = DeviceInfo.getDeviceId();
				device_data.system_name = DeviceInfo.getSystemName();
				device_data.is_tablet = DeviceInfo.isTablet();
				device_data.device_type = DeviceInfo.getDeviceType();

				device_data.carrier = await DeviceInfo.getCarrier().then(carrier => {
					return carrier;
				});
				device_data.base_os = await DeviceInfo.getBaseOs().then(baseOs => {
					return baseOs;
				});
				device_data.device = await DeviceInfo.getDevice().then(device => {
					return device;
				});
				device_data.device_name = await DeviceInfo.getDeviceName().then(deviceName => {
					return deviceName;
				});

				device_data.ip = await DeviceInfo.getIpAddress().then(ip => {
					return ip;
				});

				device_data.mac_address = await DeviceInfo.getMacAddress().then(mac => {
					return mac;
				});

				device_data.user_agent = await DeviceInfo.getUserAgent().then(userAgent => {
					return userAgent;
				});

				deviceData.data = device_data;


				this.sendToWebView(webView, JSON.stringify(deviceData));
				break;
			case 'extLink':
				if (messageObject['message'] !== 'undefined' && messageObject['message'] !== null) {
					Linking.openURL(messageObject['message']);
				}
				break;
			default:
				break;

		}

	}

	sendToWebView = (webView, data) => {
		const clientResponseCode = `window.postMessage(${data}, "*");
							true;
							`;
		if (webView) {
			webView.injectJavaScript(clientResponseCode);
		}
	};
	
	fourceTOEnableGPS = () => {
		RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({ interval: 10000, fastInterval: 5000 })
			.then(data => {
				// The user has accepted to enable the location services
				// data can be :
				//  - "already-enabled" if the location services has been already enabled
				//  - "enabled" if user has clicked on OK button in the popup
				//alet(data);
			}).catch(err => {
				if (err.code === 'ERR00') {
					this.fourceTOEnableGPS();
				}
				// The user has not accepted to enable the location services or something went wrong during the process
				// "err" : { "code" : "ERR00|ERR01|ERR02", "message" : "message"}
				// codes : 
				//  - ERR00 : The user has clicked on Cancel button in the popup
				//  - ERR01 : If the Settings change are unavailable
				//  - ERR02 : If the popup has failed to open
				// https://github.com/Richou/react-native-android-location-enabler
			});
	}

	componentDidMount() {
		SplashScreen.hide();
		checkPermissions();
		AndroidDefaultPermissionsRequest();
		NetInfo.addEventListener(this.handleConnectivityChange);
		this.backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			this.backAction
		);
	}

	componentWillUnmount() {
		NetInfo.removeEventListener(this.handleConnectivityChange);
		this.backHandler.remove();
	}

	handleConnectivityChange = state => {
		this.setState({ isConnected: state.isConnected });
	};

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

	randomTxnId = () => {
		return (Math.floor(1000000000000 + Math.random() * 9000000000000));
	}

	render() {
		const jsCode = `window.isRNWebView=true;window.postMessage(document.cookie);`;
		let Offline_Text = (
			<Text style={styles.Offline_Text}>Check your INTERNET !</Text>
		);
		let Splash_Screen = (
			<View style={styles.SplashScreen_RootView}>
				<LinearGradient
					colors={['#0393EE', '#014F7E']}
					style={styles.linearGradient}
				>
					<ImageBackground source={require('./src/images/background.png')} style={styles.backgroundImage}>
						<View style={styles.SplashScreen_ChildView}>
							<View style={styles.Circle}>
								<Image source={require('./src/images/logo.png')}
									style={styles.Logo} />
							</View>
							<View style={styles.dotsWrapper}>
								<LoadingDots dots={4} size={10} colors={['#000', '#000', '#000', '#000']} />
							</View>
							<Text style={styles.Loading1}>LOADING</Text>
							{(this.state.isConnected === false) ? Offline_Text : null}
						</View>
					</ImageBackground>
				</LinearGradient>
			</View >)
		let Web_View = (
			<WebView
				originWhitelist={["https://", "file://"]}
				allowsInlineMediaPlayback
				source={{ uri: 'https://example.com' }}
				onMessage={(event) => {
					this.onMessageReceived(event, this.webView);
				}}

				ref={(webView) => this.webView = webView}
				javaScriptEnabledAndroid={true}
				javaScriptEnabled={true}
				domStorageEnabled={true}
				injectedJavaScript={jsCode}
				onLoadEnd={(e) => this._onLoadEnd(e)}
				onError={(e) => this._onError(e)}
			/>
		)
		return (
			<View style={this.state.webviewLoaded === false ? styles.MainContainer : styles.Container}>
				{(this.state.webviewLoaded === false) ? Splash_Screen : null}
				{(this.state.isConnected === true || this.state.firstLaunched) ? Web_View : null}
				<PushNotifier ref={this._refPushNotifier} />
			</View>

		);
	}
}

const styles = StyleSheet.create({
	MainContainer:
	{
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: (Platform.OS === 'ios') ? 20 : 0
	},

	Container: {
		flex: 1
	},

	SplashScreen_RootView:
	{
		justifyContent: 'center',
		flex: 1,
		margin: 10,
		position: 'absolute',
		width: '100%',
		height: '100%',
	},

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

	linearGradient: {
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
		height: '100%',
		opacity: 1
	},

	backgroundImage: {
		height: '100%',
		width: '100%'
	}
});