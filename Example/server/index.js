const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())

app.get('/notifications/:type', (req, res) => {
  setTimeout(() => {
    const template = req.params.type === "preview" ? getPreviewNotification() : getFullNotification()
    res.json(template)
  }, 1000 * Math.random())
})


getPreviewNotification = () => {
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
    ]
  }
}

getFullNotification = () => {
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

app.listen(3000, () => console.log('Example server listening on port 3000!'))