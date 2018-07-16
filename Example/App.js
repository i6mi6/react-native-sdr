import React from 'react'
import {
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import View from 'react-native-view'
import { Provider, SDRClient } from './SDR';

const ApiClient = {
  method: "get",
  baseUrl: "http://localhost:3000",
  sdrTypes: {
    "Text": Text,
    "View": View,
    "Image": Image,
    "Button": TouchableOpacity,
  }
}

class Example extends React.Component {

  render() {
    return (
      <Provider client={ApiClient}>
        <ScreenOne />
      </Provider>
    )
  }
}

class ScreenOne extends React.Component {

  handleNotificationPress(name) {
    alert(name + " liked your post!")
  }

  getNotification() {
    return {
      notification: {
        title: "Liked your post",
        type: "LIKE",
        userName: "John Doe",
        icon: "https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
        onPress: (name) => this.handleNotificationPress(name),
        buttonStyle: { backgroundColor: "green", borderRadius: 20, height: 30, justifyContent: "center", alignItems: "center" },
      },
    }
  }

  renderLoading() {
    return (
      <View hcenter vcenter style={{ height: 140, borderWidth: 1, marginTop: 50 }}>
        <ActivityIndicator size="small" />
      </View>
    )
  }

  render() {
    return (
      <View flex>
        <SDRClient
          url="notifications/full"
          renderLoading={this.renderLoading}
          {...this.getNotification()}
        />
        <SDRClient
          url="notifications/preview"
          renderLoading={this.renderLoading}
          {...this.getNotification()}
        />
      </View>
    )
  }
}

export default Example