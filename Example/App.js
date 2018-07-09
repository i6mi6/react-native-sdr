import React from 'react'
import {
  Text,
  Image,
  TouchableOpacity,
} from 'react-native'
import View from 'react-native-view'
import SDRContainer from 'react-native-sdr';

class Example extends React.Component {

  getSDRTemplate() {
    return {
      type: "View",
      props: { mdp: true, style: { height: 140, borderWidth: 1, marginTop: 50, backgroundColor: "#F3E5F5" } },
      children: [
        {
          type: "View",
          props: { flex: true, row: true },
          children: [
            {
              type: "View",
              props: { style: { flex: 0.5 } },
              children: [
                {
                  type: "Text",
                  children: "${text::notification.userName}",
                },
                {
                  type: "Image",
                  props: {
                    source: { uri: "prop::notification.icon" },
                    style: { width: 50, height: 50 },
                  },
                },
              ]
            },
            {
              type: "View",
              props: { vcenter: true, style: { flex: 1 } },
              children: [
                {
                  type: "Text",
                  children: "${text::notification.title}",
                },
              ]
            },
          ]
        },
        {
          type: "Button",
          props: {
            onPress: "function::notification.onPress(${text::item.info.buttonName})",
            style: "prop::notification.buttonStyle"
          },
          children: [
            {
              type: "Text",
              props: { style: { color: "white" } },
              children: "Open ${text::notification.userName}'s profile",
            }
          ]
        }
      ]
    }
  }

  handleNotificationPress(name) {
    alert(name + " liked your post!")
  }

  getProps() {
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

  getSDRTypes() {
    return {
      "Text": Text,
      "View": View,
      "Image": Image,
      "Button": TouchableOpacity,
    }
  }

  render() {
    return (
      <View flex>
        <SDRContainer
          sdrTemplate={this.getSDRTemplate()}
          sdrTypes={this.getSDRTypes()}
          {...this.getProps()} />
      </View>
    )
  }
}

export default Example