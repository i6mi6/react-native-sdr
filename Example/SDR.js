import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import PropTypes from 'prop-types'
import axios from 'axios'

export const PROP_PREFIX = "prop::"
export const FUNCTION_PREFIX = "function::"
export const TEXT_PREFIX = "text::"

const ApiContext = React.createContext({
    method: "get",
    baseUrl: "",
    headers: {},
    sdrTypes: {}
});

export class Provider extends React.Component {

    render() {
        return (
            <ApiContext.Provider value={this.props.client}>
                {this.props.children}
            </ApiContext.Provider>
        )
    }
}

export class SDRClient extends React.Component {

    render() {
        return (
            <ApiContext.Consumer>
                {client => <SDRComponent {...this.props} client={client} />}
            </ApiContext.Consumer>
        )
    }
}

class SDRComponent extends React.Component {

    state = {
        loading: true,
        error: false,
        sdrTemplate: null,
    }

    componentWillMount() {
        this.fetchApiData(this.props.client)
    }

    fetchApiData = (client) => {
        console.log(client);
        return axios({
            method: client.method,
            url: this.appendEndpoint(client.baseUrl, this.props.url),
            headers: client.headers,
        })
            .then(res => this.setState({ sdrTemplate: res.data, loading: false }))
            .catch(() => {
                this.setState({ loading: false, error: true })
            })
    }

    appendEndpoint(baseUrl, endpoint) {
        if (!endpoint) {
            return baseUrl
        }
        var url = baseUrl
        if (!url.endsWith("/")) {
            url += "/"
        }
        var endp = endpoint
        if (endp.startsWith("/")) {
            endp = endp.substr(1, endp.length)
        }
        url += endp
        return url
    }

    render() {
        const { client } = this.props
        const { sdrTemplate, loading, error } = this.state
        if (loading) {
            return this.props.renderLoading()
        }
        if (error) {
            return this.props.renderError()
        }
        return <SDRContainer
            {...this.props}
            sdrTypes={client.sdrTypes}
            sdrTemplate={sdrTemplate} />
    }
}


export default class SDRContainer extends React.Component {

    shouldComponentUpdate = this.props.shouldComponentUpdate

    buildItem() {
        const { sdrTemplate } = this.props
        if (!sdrTemplate) {
            return <View />
        }
        return this.buildChildren(sdrTemplate)
    }

    buildChildren(node) {
        const { sdrTypes } = this.props
        const props = this.parseNodeProps(node.props) || {}
        props.key = props.key || ("" + Math.random())
        if (!Array.isArray(node.children) || !node.children.length) {
            return React.createElement(sdrTypes[node.type], props, this.replaceText(node.children))
        }
        const children = []
        for (var i = 0; i < node.children.length; i++) {
            children.push(this.buildChildren(node.children[i]))
        }
        return React.createElement(sdrTypes[node.type], props, children)
    }

    parseNodeProps(propsToParse) {
        if (!propsToParse) {
            return null
        }
        var props = { ...propsToParse }
        for (const key in props) {
            var prop = props[key];
            if (typeof prop === "string") {
                if (prop.startsWith(PROP_PREFIX)) {
                    props[key] = this.replaceProp(prop)
                } else if (prop.startsWith(FUNCTION_PREFIX)) {
                    props[key] = this.replaceFunction(prop)
                } else {
                    props[key] = this.replaceText(prop)
                }
            } else if (typeof prop === "object") {
                props[key] = this.parseNodeProps(prop)
            }
        }
        return props
    }

    replaceProp(prop) {
        if (typeof prop !== "string") {
            return prop
        }
        const parts = prop.replace(PROP_PREFIX, "").split(".")
        var element = this.props
        for (let j = 0; j < parts.length && element; j++) {
            element = element[parts[j]]
        }
        return element
    }

    replaceFunction(prop) {
        if (typeof prop !== "string") {
            return prop
        }
        const segments = prop.replace(FUNCTION_PREFIX, "").split("(")
        if (segments.length === 0) {
            return prop
        }
        const parts = segments[0].split(".")
        const argsSegment = segments[1]
        var func = this.props
        for (let i = 0; i < parts.length && func; i++) {
            func = func[parts[i]]
        }
        if (typeof func !== "function") {
            return () => { }
        }
        if (!argsSegment) {
            return func
        }
        const args = argsSegment.replace(")", "").split(/,\s*/g)
        for (let i = 0; i < args.length; i++) {
            if (args[i].includes(PROP_PREFIX)) {
                args[i] = this.replaceProp(args[i])
            } else if (args[i].includes(TEXT_PREFIX)) {
                args[i] = this.replaceText(args[i])
            }
        }
        return () => func(...args)
    }

    replaceText(text) {
        if (typeof text !== "string") {
            return text
        }
        const propsRegex = /(\${text::[^}]*})/g
        const matches = propsRegex.exec(text)
        var replaced = text
        if (!matches) {
            return text
        }
        for (let i = 0; i < matches.length; i++) {
            const parts = matches[i].replace("${" + TEXT_PREFIX, "").replace("}", "").split(".")
            var element = this.props
            for (let j = 0; j < parts.length && element; j++) {
                element = element[parts[j]]
            }
            const shouldReplace = !!{ "string": true, "number": true, "boolean": true }[typeof element]
            replaced = replaced.replace(matches[i], shouldReplace ? element : "")
        }
        return replaced
    }

    render() {
        return this.buildItem()
    }
}

Provider.propTypes = {
    client: PropTypes.shape({
        method: PropTypes.oneOf(["get", "put", "post"]).isRequired,
        baseUrl: PropTypes.string.isRequired,
        headers: PropTypes.object,
        sdrTypes: PropTypes.object,
    }).isRequired,
}

Provider.defaultProps = {
    client: PropTypes.shape({
        method: "get",
        baseUrl: "",
        headers: {},
    }).isRequired,
}


SDRClient.propTypes = {
    url: PropTypes.string,
    renderLoading: PropTypes.func,
    renderError: PropTypes.func,
}

SDRClient.defaultProps = {
    url: "",
    renderLoading: () => (
        <View style={{ flex: 1, alignContent: "center", justifyContent: "center" }}>
            <ActivityIndicator size="small" />
        </View>
    ),
    renderError: () => <View />,
}


SDRContainer.propTypes = {
    sdrTemplate: PropTypes.shape({
        type: PropTypes.string.isRequired,
        props: PropTypes.object,
        children: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.string,
            PropTypes.object,
        ]),
    }).isRequired,
    sdrTypes: PropTypes.object,
    shouldComponentUpdate: PropTypes.func,
}

SDRContainer.defaultProps = {
    shouldComponentUpdate: () => false,
    sdrTypes: { "View": View }
}