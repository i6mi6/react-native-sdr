
<img src="./media/logo.png" width="250" alt="My cool logo"/>

# Server Driven Rendering (SDR) for React Native

# Installation

```javascript
$ npm install react-native-sdr --save
```

or 

```javascript
$ yarn add react-native-sdr
```

# Motivation

Server Driven Rendering (SDR) is the process in which an app is told how to render a component remotely.
The difference between SDR and Server Side Rendering (SSR) is that in the latter the server does the actual rendering.
Imagine yourself building a social network app and you have to implement elements for the timeline.
Normally, you would have multiple types of data (news, photo shares, announcements, etc.) and corresponding components for them. However, as time goes you will find the need to push new updates for every new type you add (or even small UI tweaks in certain components). SDR allows you to specify the template on your server and pass it on to your app in order to handle the rendering.

# Usage

## Autosync with server

On your Client:

```jsx
import { Provider, SDRClient } from 'react-native-sdr';

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

class App extends React.Component {
  render() {
    return (
      <Provider client={ApiClient}>
        <ScreenOne />
      </Provider>
    )
  }
}

class ScreenOne extends React.Component {
  render() {
    return (
      <View>
        <SDRClient
          url="/sdr/notifications/preview"
          {...otherProps}
        />
      </View>
    )
  }
}

```

and your (example Express) Server:

```javascript

app.get('/sdr/notifications/:type', (req, res) => {
  const template = req.params.type === "preview" ? getPreviewTemplate() : getFullTemplate()
  res.json(template)
})

```

## Manual lifecycle handling

```jsx
import SDRContainer from 'react-native-sdr';

  getSDRTemplate() {
    ...
  }

  getSDRTypes() {
    ...
  }

  render() {
    return (
      <SDRContainer
        sdrTemplate={this.getSDRTemplate()}
        sdrTypes={this.getSDRTypes()}
        // ...otherProps 
        />
    )
  }
```

## Templates and types

The component requires **types** and a **template**. 
Types are all elements that the component has access to (Image, View, etc.). If you want the component to be able to use them during the assembly, you must specify them beforehand. An example types object looks like this:

```jsx
 {
    "Text": Text,
    "View": View,
    "Image": Image,
    "Button": TouchableOpacity,
  }
```

The template is what you pass from the server to the component. 
It used for rendering the component. It must look like this:

```
{
  type: [Mandatory] Component type from predefined types,
  props: [Optional] Props to pass to the component,
  children: [Optional] Array of child objects or a string if text element
}
```

**Template variables** are used to access props passed to the component. Example:

```jsx
// some usual props to your component
{
  notification: {
    meta: {
      title: "Liked your comment",
      name: "John Doe"
    }
  }
}

// template from the server
{
  type: "Text",
  children: "Name: ${text::notification.meta.name}, Action: ${text::notification.meta.title}"
}
```

will render

```jsx
<Text>Name: John Doe, Action: Liked your comment</Text>
```

There are multiple types of variables:

| variable | description |
| ------ | ------ |
|prop::some.path.to.object|Retrieves the object from **this.props**|
|function::some.path.to.function|Retrieves the function from **this.props**|
|${text::some.path.to.text}|Retrieves the text from **this.props**|

*Refer to the Example for more*

# Available props:

## Provider 

| prop | type | description |default|
| ------ | ------ | ------ | ------ |
|client|object|The client used for sync with the server||

## SDRClient 

| prop | type | description |default|
| ------ | ------ | ------ | ------ |
|url|string|The endpoint which is expected to return a **template**||
|renderLoading|func|Renders a loading component during sync|<View><ActivityIndicator/></View>|
|renderError|func|Renders an error component if an error occurs during sync|<View/>|

## SDRContainer 

| prop | type | description |default|
| ------ | ------ | ------ | ------ |
|sdrTemplate|object|The template to render||
|sdrTypes|object|Types to choose from when rendering|{ "View": View }|
|shouldComponentUpdate|function|shouldComponentUpdate|() => false|


License
----

MIT
