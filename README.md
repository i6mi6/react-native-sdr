# react-native-sdr
Server Driven Rendering (SDR) component for React Native

# Installation

```javascript
$ npm install react-native-sdr --save
```

# Motivation

Server Driven Rendering (SDR) is the process in which an app is told how to render a component remotely.
The difference between SDR and Server Side Rendering (SSR) is that the latter does the actual rendering.
Imagine yourself building a social network app and you have to implement elements for the timeline.
Normally, you would have multiple types of data (news, photo shares, announcements, etc.) and corresponding components for them. However, as time goes you will find the need to push new updates for every new type you add (or even small UI tweaks in certain components). SDR allows you to specify the template on your server and pass it on to your app in order to handle the rendering.

# Usage

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

The component requires a **types** and a **template**. 
Types are all elements that the component has access to (Image, View, etc.). If you want the component to be able to use them during the assembly, you must specify them beforehand.

```jsx
getSDRTypes() {
    return {
      "Text": Text,
      "View": View,
      "Image": Image,
      "Button": TouchableOpacity,
    }
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
// props to component in the app
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

| prop | type | description |default|
| ------ | ------ | ------ | ------ |
|sdrTemplate|object|The template to render||
|sdrTypes|object|Types to choose from when rendering|{ "View": View }|
|shouldComponentUpdate|function|shouldComponentUpdate|() => false|


License
----

MIT
