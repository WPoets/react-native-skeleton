import React, { Component } from "react"
import {notifications, messages} from "react-native-firebase-push-notifications"

class PushNotifier extends Component {
  constructor(props) {
    super(props)
    this.state = {
      token: "",
      hasPermission: false
    }
  }

  componentDidMount() {
    this.onNotificationListener()
    this.onNotificationOpenedListener()
    this.getInitialNotification()

    this.onTokenButtonPress();//triggering manually
  }
  componentWillUnmount() {}

  getToken = async () => {
    //get the messeging token
    const token = await notifications.getToken()
    //you can also call messages.getToken() (does the same thing)
    return token
  }

  getInitialNotification = async () => {
    //get the initial token (triggered when app opens from a closed state)
    const notification = await notifications.getInitialNotification()
    console.log("getInitialNotification", notification)
    return notification
  }

  onNotificationOpenedListener = () => {
    //remember to remove the listener on un mount
    //this gets triggered when the application is in the background
    this.removeOnNotificationOpened = notifications.onNotificationOpened(
      notification => {
        console.log("onNotificationOpened", notification)
        //do something with the notification
      }
    )
  }

  onNotificationListener = () => {
    //remember to remove the listener on un mount
    //this gets triggered when the application is in the forground/runnning
    //for android make sure you manifest is setup - else this wont work
    this.removeOnNotification = notifications.onNotification(notification => {
      //do something with the notification
      console.log("onNotification", notification)
    })
  }

  onTokenRefreshListener = () => {
    //remember to remove the listener on un mount
    //this gets triggered when a new token is generated for the user
    this.removeonTokenRefresh = messages.onTokenRefresh(token => {
      //do something with the new token
    })
  }

  setBadge = async number => {
    //only works on iOS for now
    return await notifications.setBadge(number)
  }

  getBadge = async () => {
    //only works on iOS for now
    return await notifications.getBadge()
  }

  hasPermission = async () => {
    //only works on iOS
    return await notifications.hasPermission()
  }

  requestPermission = async () => {
    //only works on iOS
    return await notifications.requestPermission()
  }
  componentWillUnmount() {
    //remove the listener on unmount
    if (this.removeOnNotificationOpened) {
      this.removeOnNotificationOpened()
    }
    if (this.removeOnNotification) {
      this.removeOnNotification()
    }

    if (this.removeonTokenRefresh) {
      this.removeonTokenRefresh()
    }
  }

  onTokenButtonPress = async () => {
    const token = await this.getToken()
    console.log("token : ", token)
    this.setState({ token: token })
  }

  onTestHasPermission = async () => {
    const has = await this.hasPermission()
    console.log("Has", has)
    this.setState({ hasPermission: has })
  }
  
  render() {
    //const { token, hasPermission } = this.state
    return (null);
  }
}

export default PushNotifier