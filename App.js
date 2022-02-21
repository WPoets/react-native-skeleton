import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, Text, View, Platform, Dimensions, PermissionsAndroid, Alert, Button, BackHandler, Image, ImageBackground, Linking, SafeAreaView, AppState} from 'react-native';
import { WebView } from 'react-native-webview';
import { check, PERMISSIONS, RESULTS, requestMultiple } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import auth from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-community/google-signin';
import firebase from '@react-native-firebase/app';
import analytics from '@react-native-firebase/analytics';
import PushNotifier from './src/components/PushNotifier';
import { AppEventsLogger } from 'react-native-fbsdk';
import PayuMoney from 'react-native-payumoney';
import { HashGenerator } from 'react-native-payumoney';
import DeviceInfo from 'react-native-device-info';
import NetInfo from "@react-native-community/netinfo";
import SplashScreen from './src/components/Splash';
import NoInternet from './src/components/NoInternet';
import MaintenanceScreen from './src/components/MaintenanceMode';
import Snackbar from 'react-native-snackbar';
import CryptoJS from 'react-native-crypto-js';
import RNAdvertisingId from 'react-native-advertising-id';
import IDFA from 'react-native-idfa';
import RNFetchBlob from 'rn-fetch-blob';
import compareVersions from 'compare-versions';
import HeaderLogo from './src/components/header_logo';
import GeneralStatusBarColor from './src/components/StatusBar';
import styles from './src/utils/styles.js';
import LottieView from 'lottie-react-native';
import crashlytics from '@react-native-firebase/crashlytics';
import branch, { BranchEvent } from 'react-native-branch';
import {Header, Icon} from 'react-native-elements';
import Tts from 'react-native-tts';
import RingerMode from 'react-native-ringer-mode';
import InAppReview from "react-native-in-app-review";

// REPLACE WITH YOUR APP URLS
const APP_STORE_LINK = 'https://apps.apple.com/in/app/signal-private-messenger/id874139669';
const PLAY_STORE_LINK = 'market://details?id=org.thoughtcrime.securesms';

let Analytics = firebase.analytics();

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

 	requestMultiple([PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE]).then(
 		(statuses) => {
 			//console.log(statuses);
 		},
 	);
 }

export default class App extends Component<Props> {

	constructor(props) {
		super(props);
		this.state = {
			key: 0,
			showSplash: true,
			isConnected: true,
			slowConnection: false,
			tryAgain: false,
			apiUrl: 'https://alpha.wordpoets.com/api/initialize',
			instanceId: null,
			aaid: null,
			idfa: null,
			advertisingId: null,
			device_info: null,
			forceUpdate: false,
			webViewData:{
				backgroundColor: '#fefefe',
				color: '#000000',
				statusBarColor: '#fefefe',
				contentColor: 'dark-content',
				loadingMsg: 'Loading...',
				backMsg: '',
				showBackButton:'no'
			},
			previousScreenWebViewData:{
				backgroundColor: '#fefefe',
				color: '#000000',
				backStatusBarColor: '#fefefe',
				backContentColor: 'dark-content',
				backHeaderColor: '#fefefe',
				backTitleColor: '#000000',
				statusBarColor: '#fefefe',
				contentColor: 'dark-content',
				loadingMsg: 'Loading...',
				backMsg: '',
				showBackButton:'no'
			},
			webviewLoaded: false,
			fbAccessToken: null,
			firstLaunched: false,
			branchParams: {
				latest : null,
				first : null,
			},
			initialLink: null,
			//For App State
			appState: AppState.currentState,
			appStateCount: 0
		};
		this.webView = null;
		this.onMessageReceived = this.onMessageReceived.bind(this);
		this._refPushNotifier = React.createRef();
		this.hideSplash = this.hideSplash.bind(this);
		this.reloadWebView = this.reloadWebView.bind(this);
		this.triggerfileDownload = this.triggerfileDownload.bind(this);
		this.getHeaders = this.getHeaders.bind(this);
		this.getDeviceInfo = this.getDeviceInfo.bind(this);
		this.getAdvertisingID = this.getAdvertisingID.bind(this);
		this.sendRequest = this.sendRequest.bind(this);
		this.handleResponse = this.handleResponse.bind(this);
		this.checkVersion = this.checkVersion.bind(this);
		this.checkResumeApplication = this.checkResumeApplication.bind(this);
		this.initBranch = this.initBranch.bind(this);
		this.handleDeepLinking = this.handleDeepLinking.bind(this);
		this.getInitialLink = this.getInitialLink.bind(this);
		this.setupWebViewData = this.setupWebViewData.bind(this);
	}

	async componentDidMount() {
		
		/** Fetch the device identifier (aaid / idfa) and set in state */
		await this.getAdvertisingID();

		/** Fetch device info and set in state */
		await this.getDeviceInfo();

		/* Fetch Headers for the API Request */
		await this.getHeaders();

		/** Initiate Branch and set received params in state */
		await this.initBranch();

		/** Fetch Deep linking params */
		await this.handleDeepLinking();

		/** API Request to launch the app */
		let response = await this.sendRequest();

		/** Handle API response and launch webview accordingly */
		await this.handleResponse(response.json());

		this.hideSplash();
		//checkPermissions();
		//AndroidDefaultPermissionsRequest();

		try{
			NetInfo.addEventListener(this.handleConnectivityChange);
			this.backHandler = BackHandler.addEventListener(
				"hardwareBackPress",
				this.backAction
			);
		}catch(e){
		}

		// For App State
		AppState.addEventListener("change", this.handleAppStateChange);
	}



	componentWillUnmount() {
		try{
			NetInfo.removeEventListener(this.handleConnectivityChange);
			this.backHandler.remove();
		}catch(e){

		}
	}

	//For App State
	handleAppStateChange = nextAppState => {
		if (
		  	this.state.appState.match(/inactive|background/) &&
		  	nextAppState === "active"
		) {
		  	//console.log("App has come to the foreground!");
		}

		this.setState({ appState: nextAppState});

		if(this.state.appState=='active'){
			this.setState({appStateCount: this.state.appStateCount+1 });
			let appStateData = {};
			appStateData.action = 'appState';
			appStateData.message = {appState: this.state.appState, appStateCount: this.state.appStateCount};
			console.log(appStateData);
			this.sendToWebView(this.webView, JSON.stringify(appStateData));
		}
	};

	handleConnectivityChange = state => {
		this.setState({ isConnected: state.isConnected });
		if(!state.isConnected){
			this.setState({ webviewLoaded: false });
		}else{
			this.setState({ slowConnection: false });
			this.setState({ tryAgain: false });
		}
	};


 	hideSplash() {
		setTimeout(() => {
			this.setState({
				showSplash: false,
				referrer: '',
			})
		}, 3500)
	}

	reloadWebView() {
		if(this.webView!==null){
			this.webView.reload();
		}
	}

	async getAdvertisingID() {
        if (Platform.OS === 'android') {

            const advertResponse = await RNAdvertisingId.getAdvertisingId();

            this.setState({
                aaid: advertResponse['advertisingId'],
                advertisingId: advertResponse['advertisingId']
            })
        }else if(Platform.OS === 'ios'){
			const idfa = await IDFA.getIDFA();
            this.setState({
                idfa: idfa,
				advertisingId: idfa
            })
		}
    }
	
	async getDeviceInfo(){
		let device_data = {};
		device_data.unique_id = DeviceInfo.getUniqueId();
		device_data.application_name = DeviceInfo.getApplicationName();
		device_data.app_name = DeviceInfo.getBrand();
		device_data.build_number = DeviceInfo.getBuildNumber();
		device_data.version = DeviceInfo.getVersion();
		device_data.bundle_id = DeviceInfo.getBundleId();
		device_data.system_name = DeviceInfo.getSystemName();
		device_data.device_os = Platform.OS === "ios" ? "ios" : "android";
		device_data.device_os_version = DeviceInfo.getSystemVersion();
		device_data.is_tablet = DeviceInfo.isTablet();
		device_data.device_type = DeviceInfo.getDeviceType();

		device_data.carrier = await DeviceInfo.getCarrier().then(carrier => {
			return carrier;
		});
		device_data.device_model = await DeviceInfo.getDeviceName().then(device => {
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

		/* Fetch Instance ID from firebase */
		let token = await this._refPushNotifier.current.getToken();
		device_data.instance_id = token;

		device_data.aaid = this.state.aaid;

		device_data.idfa = this.state.idfa;

		device_data.advertisingId = this.state.advertisingId;

		this.setState({device_info: device_data});
	}

	async getHeaders(){
		const xApiKey = await this.getXApiKey();

		const headers = {
            'device-info': JSON.stringify(this.state.device_info),
            'x-api-key': xApiKey,
        };
		
        this.setState({
            headers
        })
	}

	async initBranch(){
		branch.subscribe(({error, params, uri}) => {
			if (error) {
				console.error('Error from Branch: ' + error)
				return
			}

			// params will never be null if error is null
		})

		let lastParams = await branch.getLatestReferringParams() // params from last open
		let installParams = await branch.getFirstReferringParams() // params from original install

		let branchParams = {}

		branchParams.latest = lastParams;
		branchParams.first = installParams;
		this.setState({
			branchParams: branchParams
		});

	}

	async getInitialLink() {
		let url = await Linking.getInitialURL();
		this.setState({
			initialLink: url
		})
    }


	async handleDeepLinking(){
		await this.getInitialLink();
	}

	async getParams() {

		const params = {
			attributeParams : this.state.branchParams,
			initialLink : this.state.initialLink
		}

        return JSON.stringify(params);
    }

	async getXApiKey(){
		const HASH_KEY = '59b6ab46d379b89d794c87b74a511fbd59b6ab46d379b89d794c87b74a511fbd';
		const HASH_INIT_VECTOR = '0aaff094b6dc29742cc98a4bac8bc8f9';
		const TIMESTAMP = Math.trunc(new Date().getTime() / 1000).toString();
        let ciphertext = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(TIMESTAMP), CryptoJS.enc.Hex.parse(HASH_KEY), { iv: CryptoJS.enc.Hex.parse(HASH_INIT_VECTOR) }).toString();
        return ciphertext;
	}

	async sendRequest() {

		const headers = this.state.headers;
		const body = await this.getParams();
		this.setTimeoutFunction();
        return RNFetchBlob.fetch('POST',this.state.apiUrl, headers, body);
	}

	async handleResponse(response) {
		if (response.status == '513') {
			/** Maintainence mode */
			this.setState({
				showMaintanenceScreen: true
			});

		}else if (response.status == '200'){
			
			let webViewData = this.state.webViewData;

			webViewData.url = response.url;			
			webViewData.logo = response.logo;
			webViewData.title = response.title;
			webViewData.loadingMsg = response.loading_message;
			webViewData.backMsg = response.on_back_message;
			
			this.setState({
				webViewData: webViewData
			});
			await this.checkVersion(response);
			await this.checkResumeApplication(response);
		}else{
			
		}
	}	

	async checkVersion(response){

		let latest_version = response.latest_version;
		let force_update = response.force_update;

		let ack = compareVersions(this.state.device_info.version, latest_version);
		if(ack < 0){
			
			/** Ask user to update the app */

			if(force_update == "yes"){
				/** Force user to update */

				if (Platform.OS == 'android') {
					Alert.alert(
						'New Version Available.',
						'Update now to continue using the App.',
						[
							{
								text: 'EXIT', onPress: () => {
									this.setState({
										forceUpdate: true,
									});

									BackHandler.exitApp();

								}, style: 'cancel'
							},
							{
								text: 'UPDATE NOW', onPress: () => {
									this.setState({
										forceUpdate: true,
									})
									if (Platform.OS == 'ios') {
										Linking.openURL(APP_STORE_LINK).catch(err => console.error('An error occurred', err));
									}
									else {
										Linking.openURL(PLAY_STORE_LINK).catch(err => console.error('An error occurred', err));
									}
								}
							},
						],
						{ cancelable: false },
					);
				} else {
					Alert.alert(
						'New Version Available.',
						'Update now to continue using the App.',
						[
							{
								text: 'UPDATE NOW', onPress: () => {
									this.setState({
										forceUpdate: true,
									})
									if (Platform.OS == 'ios') {
										Linking.openURL(APP_STORE_LINK).catch(err => console.error('An error occurred', err));
									}
									else {
										Linking.openURL(PLAY_STORE_LINK).catch(err => console.error('An error occurred', err));
									}
								}
							},
						],
						{ cancelable: false },
					);
				}

			}else{
				/** Show update popup */
				Alert.alert(
					'New Version Available.',
					'Update now for a better experience.',
					[
						{
							text: 'Later', onPress: () => {
								
								this.checkResumeApplication(response);

							}, style: 'cancel'
						},
						{
							text: 'Update Now', onPress: () => {
								if (Platform.OS == 'ios') {
									Linking.openURL(APP_STORE_LINK).catch(err => console.error('An error occurred', err));
								}
								else {
									Linking.openURL(PLAY_STORE_LINK).catch(err => console.error('An error occurred', err));
								}
							}
						},
					],
					{ cancelable: false },
				);				
			}
		}

	}

	async checkResumeApplication(response){

		if (response['application_found'] == 'yes') {

            Alert.alert(
                'Resume Application',
                'There are applications filled from this device. Do you want to continue?',
                [
                    { text: 'CANCEL', onPress: () => null, style: 'cancel' },
                    {
                        text: 'SEE APPLICATIONS', onPress: () => {

                            this.setState({
                                slowConnection: false,
                                visible: true,
                                tryAgain: false,
                                key: this.state.key + 1,
                                urlReceived: true,
                                backUrl: response['resume_app_message']['on_back_url'],
                                initialResponseReceived: true,
                            });

                            this.setTimeoutFunction();
                            this.setupWebViewData(response['resume_app_message']);
                        }
                    }

                ]
            );
        }

	}

	async setupWebViewData(webViewObject){
		let webViewData = this.state.webViewData;
		webViewData.url = webViewObject['url'];

		webViewData.logo = "no"
		if (webViewObject['logo'] == 'yes') {
			webViewData.logo= "yes"
		}

		webViewData.title = ""
		if (webViewObject['title'] != undefined) {
			webViewData.title = webViewObject['title']
		}

		webViewData.titleColor = '#000'
		if (webViewObject['title_color'] != undefined) {
			webViewData.titleColor = webViewObject['title_color']
		}

		webViewData.statusBarColor = '#fff'
		webViewData.contentColor = 'dark-content'
		if (webViewObject['header_background_color'] != undefined) {
			webViewData.statusBarColor = webViewObject['header_background_color']
			webViewData.contentColor = 'light-content'
		}

		this.setState({
			webViewData: webViewData,
			webviewLoaded: false
		})
	}

	async setupPreviousScreenWebViewData(webViewObject){
		let previousScreenWebViewData = this.state.previousScreenWebViewData;

		if (webViewObject['url'] != undefined && webViewObject['url'] != "") {
			previousScreenWebViewData.url = webViewObject['url'];
		}else{
			previousScreenWebViewData.url = "";	
		}

		previousScreenWebViewData.logo = "no"
		if (webViewObject['logo'] == 'yes') {
			previousScreenWebViewData.logo= "yes"
		}

		previousScreenWebViewData.title = ""
		if (webViewObject['title'] != undefined) {
			previousScreenWebViewData.title = webViewObject['title']
		}

		previousScreenWebViewData.titleColor = '#fffff'
		if (webViewObject['title_color'] != undefined) {
			previousScreenWebViewData.titleColor = webViewObject['title_color']
		}

		previousScreenWebViewData.statusBarColor = '#fff'
		previousScreenWebViewData.contentColor = 'dark-content'
		if (webViewObject['header_background_color'] != undefined) {
			previousScreenWebViewData.statusBarColor = webViewObject['header_background_color']
			previousScreenWebViewData.contentColor = 'light-content'
		}

		this.setState({
			previousScreenWebViewData: previousScreenWebViewData
		})
	}

	_onLoadStart = (e) => {
		var nativeEvent = e.nativeEvent;
		if (!nativeEvent.loading) {
			this.setState({ webviewLoaded: false });
		}
	}

	_onLoadEnd = (e) => {
		var nativeEvent = e.nativeEvent;
		if (!nativeEvent.loading) {
			this.setState({ webviewLoaded: true });
			this.setState({ firstLaunched: true });
			this.setState({ slowConnection: false });
			this.setState({ tryAgain: false });
		}
	}

	_onError = (e) => {
		var nativeEvent = e.nativeEvent;
		var that = this;

//		if (nativeEvent.code === -2) {
			that.setState({ webviewLoaded: false });
			that.setState({ firstLaunched: false });
			that.setState({ slowConnection: true });
			that.setState({ tryAgain: true });
//		}

	}

	backAction = async () => {
		if(this.state.previousScreenWebViewData.url !== undefined && this.state.previousScreenWebViewData.url != ""){
			await this.setupWebViewData(this.state.previousScreenWebViewData);
		}else{
			Alert.alert("Hold on!", "Are you sure you want to exit from app?", [
				{
					text: "Cancel",
					onPress: () => null,
					style: "cancel"
				},
				{ text: "YES", onPress: () => BackHandler.exitApp() }
			]);
		}

 		return true;
	};

	signIn = async (webView) => {
		try {
			await GoogleSignin.hasPlayServices();
			const userInfo = await GoogleSignin.signIn();

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

	onShare = async (share_title,share_message,share_url) => {
		try {
		const result = await Share.share({
			message:share_message,
			url:share_url,
			Title:share_title,
		});

		if (result.action === Share.sharedAction) {
			if (result.activityType) {
			// shared with activity type of result.activityType
			} else {
			// shared
			}
		} else if (result.action === Share.dismissedAction) {
			// dismissed
		}
		} catch (error) {
			alert(error.message);
		}
	};

	addReview = async () => {
		InAppReview.isAvailable();
		InAppReview.RequestInAppReview()
		.then((hasFlowFinishedSuccessfully) => {
			
			// when return true in android it means user finished or close review flow
			console.log('InAppReview in android', hasFlowFinishedSuccessfully);
			//Alert.alert('InAppReview in android');

			if (hasFlowFinishedSuccessfully) {
				//Alert.alert('hasFlowFinishedSuccessfully');
			}
		})
		.catch((error) => {
			console.log(error);
		});
	};

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
			case 'logEvent':
				Analytics.setAnalyticsCollectionEnabled(true);
                Analytics.setUserId(this.state.instanceId);
                Analytics.logEvent(messageObject['message'], messageObject['properties']);
				break;
            case 'downloadFile':
                this.triggerfileDownload(messageObject['url'], messageObject['name']);
                break;
            case 'snackbar':
				Snackbar.show({
                    text: messageObject['message'],
                    duration: Snackbar.LENGTH_SHORT,
                });
                break;
			case 'viewPDF':
				Linking.openURL(messageObject['url']);
				break;
			case 'downloadFile':
				this.triggerfileDownload(messageObject['url'], messageObject['name']);
				break;
			case 'getToken':
				let data = {};
				data.action = 'getToken';
				data.token = this.state.instanceId;
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
			case 'navigate':
				await this.getHeaders();
				this.setState({
                    slowConnection: false,
                    tryAgain: false,
                    visible: true,
                    key: this.state.key + 1,
                    urlReceived: true,
					webviewLoaded:false
                });
				this.setTimeoutFunction();
				if(this.state.webViewData.url == messageObject.url){
					webView.reload();
				}else{
					await this.setupWebViewData(messageObject);
				}
				
				break;
			case 'onBackPressed':
				await this.setupPreviousScreenWebViewData(messageObject);
				break;
			case 'getVersion':
				let version = DeviceInfo.getVersion();
				this.sendToWebView(webView, JSON.stringify({version:version}));
				break;
			case 'forceUpdate':
				Snackbar.show({
					text: messageObject['text'],
					duration: Snackbar.LENGTH_INDEFINITE,
					action: {
						text: 'An update is available, please update',
						textColor: 'orange',
						onPress: () => { Linking.openURL(messageObject['link']); },
					},
				});
			case 'checkPermission':
				checkPermissions();
				break;
			case 'ringerMode':
				let ringerMode = await RingerMode.getRingerMode();
				let ringerModeData = {};
				ringerModeData.action = 'ringerMode';
				ringerModeData.message = ringerMode;
				this.sendToWebView(webView, JSON.stringify(ringerModeData));
				break;
			case 'resetAppStateCount':
				this.setState({appStateCount:0});
				break;
			case 'share':
				this.onShare(messageObject['title'], messageObject['message'],messageObject['url']);
				break;	
			case 'addreview':
				this.addReview();
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
	
    setTimeoutFunction() {
        clearTimeout(this.slowConnectionTimer);
        clearTimeout(this.tryAgainTimer);

        this.slowConnectionTimer = setTimeout(() => {
            if (this.state.visible) {
                this.setState({
                    slowConnection: true
                })
            }
        }, 5000);

        this.tryAgainTimer = setTimeout(() => {
            if (this.state.visible) {
                this.setState({
                    tryAgain: true
                })
            }
        }, 10000);
    }

    triggerfileDownload(urlDownload, fileName) {
        finalName = fileName;
        if (Platform.OS == 'android') {
            const downloadManager = require("react-native-simple-download-manager");
            const configDownload = {
                downloadTitle: finalName,
                downloadDescription:finalName,
                saveAsName: finalName,
                allowedInRoaming: true,
                allowedInMetered: true,
                showInDownloads: true,
                external: false, //when false basically means use the default Download path (version ^1.3)
                path: "Download/" //if "external" is true then use this path (version ^1.3)
            };

            downloadManager
                .download((url = urlDownload), (headers = {}), (config = configDownload))
                .then(response => {
                    console.log("Download success!");
                })
                .catch(err => {
                    console.log("Download failed!", err);
                });
        } else {
            let dirs = RNFetchBlob.fs.dirs
            RNFetchBlob
                .config({
                    // add this option that makes response data to be stored as a file,
                    // this is much more performant.
                    // fileCache: true,
                    path: dirs.DocumentDir + '/' + finalName
                })
                .fetch('GET', urlDownload, {
                    //some headers ..
                })
                .then((res) => {
                    // the temp file path
                    rnFetch.fs.writeFile(dirs.DocumentDir + '/' + finalName, res.data, 'base64');
                    rnFetch.ios.previewDocument(dirs.DocumentDir + '/' + finalName);
                    console.log('The file saved to ', res.path())
                }).catch((err) => {
                    console.log('Download Failed', err);
                })
        }

    }

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
			merchantId: '<MERCHANT_ID>',
			key: '<KEY>',
			successUrl: 'https://www.payumoney.com/mobileapp/payumoney/success.php',
			failedUrl: 'https://www.payumoney.com/mobileapp/payumoney/failure.php',
			isDebug: true,
			hash: this.hashGenerator(data)
		};

		try{
			let response = await PayuMoney(payData);
			return response.response;
		}catch(e){
			let response = {};
			response.result = {};
			response.result.status = "failure";
			response.result.txnId = data.txnId;
			return response;
		}

	};

	/*** Hash Generator ****/
	hashGenerator = (data) => {
		return HashGenerator({
			key: "<KEY>",
			amount: data.amount,
			email: data.email,
			txnId: data.txnId,
			productName: data.productName,
			firstName: data.firstName,
			salt: "<SALT>",
		});
	}

	randomTxnId = () => {
		return (Math.floor(1000000000000 + Math.random() * 9000000000000));
	}


	render() {
		const jsCode = `window.isRNWebView=true;window.postMessage(document.cookie);`;

		let webViewData = this.state.webViewData;
		
		let Web_View = (
			<View style={styles.container}>


				{this.state.webViewData.title !== undefined && this.state.webViewData.title != "" && (
					<View style={styles.headerTitleContainer}>
						<Header 
							leftComponent={<Icon color='#000' name='angle-left' style={{paddingTop:10}} type='font-awesome' size={14} raised  onPress={() => this.backAction()} />}
							centerComponent={{ text: webViewData.title, style: { color: webViewData.titleColor,fontSize:20,paddingTop:10} }}
							containerStyle={{
								backgroundColor: webViewData.statusBarColor,
								justifyContent: 'space-around',							
								paddingVertical:10
							}}
							barStyle="light-content"
							backgroundColor={webViewData.statusBarColor}
						/>
					</View>
				)}

				{ this.state.webViewData.logo === "yes"  && (
					<View style={styles.headerLogoContainer}>

						{(this.state.webViewData.logo === "yes") && (
							<HeaderLogo />
						)}
					</View>
				)}

				<WebView
					originWhitelist={["https://", "file://"]}
					allowsInlineMediaPlayback
					source={{ 
						uri: webViewData.url, 
						headers: this.state.headers
					}}
					onMessage={(event) => {
						this.onMessageReceived(event, this.webView);
					}}
					ref={(webView) => this.webView = webView}
					javaScriptEnabledAndroid={true}
					javaScriptEnabled={true}
					domStorageEnabled={true}
					injectedJavaScript={jsCode}
					onLoadStart={(e) => this._onLoadStart(e)}
					onLoadEnd={(e) => this._onLoadEnd(e)}
					onError={(e) => this._onError(e)}
					key={this.state.key}
				/>
			</View>
		)

		return (
            <View style={styles.container}>
				<GeneralStatusBarColor backgroundColor={webViewData.statusBarColor} barStyle={webViewData.contentColor} />

				<View style={styles.container}>
					{(this.state.showSplash === true) ? <SplashScreen /> : null}
					{(this.state.showMaintanenceScreen === true) ? <MaintenanceScreen /> : null}
					{(this.state.isConnected === false) ? <NoInternet /> : null}

					{(!this.state.showSplash && !this.state.showMaintanenceScreen && this.state.isConnected) ? Web_View : null}


					{(this.state.isConnected) && !this.state.webviewLoaded && !this.state.showSplash && (
						 <View style={styles.centerContainer}>
							{/* Custom Loader	 */}
                            <LottieView style={{ height: 300, width: 300, top:5 }} source={require('./src/components/loader_animation.json')} autoPlay loop />

                            {this.state.slowConnection && (<Text style={styles.descText} >
                                It seems like the connection is slow. We are trying to reach our servers, please wait.
                            </Text>)}

                        </View>
					)}

					{this.state.tryAgain && !this.state.webviewLoaded && (
                        <View style={styles.centerContainer}>
                            <Image style={styles.limage}
                                source={{ uri: 'no_internet' }}
                            />
                            <Text style={styles.descText}>Oops! Internet Connection Timed out.</Text>
                            <Text style={styles.descText}>Please try again.</Text>
                            <View style={[{ width: "50%", margin: 10, }]}>
                                <Button
                                    onPress={this.reloadWebView}
                                    title="Retry"
                                    color="#d41d19"
                                />
                            </View>
                        </View>
                    )}	
									
					<PushNotifier ref={this._refPushNotifier} />
				</View>
			</View>
		);
	}
}