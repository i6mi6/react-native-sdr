import React, { Component } from 'react'
import {
    Animated,
    Dimensions,
    TouchableOpacity,
    Text,
    Platform,
    PanResponder
} from 'react-native'
import View from 'react-native-view'
import PropTypes from 'prop-types';
import MAIcon from 'react-native-vector-icons/MaterialIcons'
import _ from 'lodash'
import * as Animatable from 'react-native-animatable';
const { width, height } = Dimensions.get('window')

const HEADER_HEIGHT = Platform.select({
    ios: 60,
    android: 50
})

export default class FallingDrawer extends Component {

    axisY = 0
    state = {
        panAnimation: new Animated.ValueXY({ x: 0, y: 0 }),
        screens: [],
        opened: false,
        selectedScreen: null
    }

    componentWillMount() {
        this.state.panAnimation.y.addListener((event) => this.axisY = event.value);

        this.panResponder = PanResponder.create({
            onMoveShouldSetResponderCapture: () => true,
            onMoveShouldSetPanResponderCapture: () => true,
            onPanResponderGrant: (e) => {
                this.state.panAnimation.setOffset({ y: this.axisY });
                this.state.panAnimation.setValue({ y: 0 });
            },
            onPanResponderMove: (e, gestureState) => {
                console.log(gestureState, this.state.panAnimation.y);
                if(this.state.panAnimation.y._offset + this.state.panAnimation.y._value < this.props.headerHeight){
                    return true
                }
                Animated.event([
                    null, { dy: this.state.panAnimation.y },
                ])(e, gestureState)
            },
            onPanResponderRelease: () => {

            }
        });

        const { screens } = this.props
        if (!screens || screens.length == 0) {
            return
        }
        this.optionViews = {}
        this.setState(() => ({ screens, selectedScreen: screens[0] }))
    }

    componentWillUnmount() {
        this.state.panAnimation.x.removeAllListeners();
        this.state.panAnimation.y.removeAllListeners();
    }

    open = async () => {
        const { screens } = this.state
        const { optionCollapseSpeed, optionCollapseDelay } = this.props
        await Promise.all([
            this.optionViews["drawer"].transitionTo({
                top: 0
            }, optionCollapseSpeed, 'linear'),
            this.optionViews[screens[0].key].transitionTo({
                top: 0
            }, optionCollapseSpeed, 'linear')
        ])
        for (var i = 1; i < screens.length; i++) {
            const index = i
            setTimeout(() => this.animateFallingOption(index), optionCollapseDelay * i)
        }
    }

    close = async () => {
        const { screens } = this.state
        await this.optionViews["drawer"].transitionTo({
            top: -height
        })
        for (var i = 0; i < screens.length; i++) {
            this.optionViews[screens[i].key].transitionTo({
                top: -height
            }, 1)
        }
    }

    animateFallingOption = async (i) => {
        const { screens } = this.state
        const { diversifyAnimations, optionCollapseSpeed } = this.props
        const optionHeight = height / screens.length
        const key = screens[i].key
        await this.optionViews[key].transitionTo({
            top: -optionHeight * i,
        }, optionCollapseSpeed)
        if (diversifyAnimations) {
            this.diversifyAnimations(key, i)
        } else {
            this.shake(key, i)
        }
    }

    diversifyAnimations = (key, i) => {
        const { shakeDuration } = this.props
        const timing = shakeDuration - 90 * i
        if ((i + 1) % 3 === 0) {
            this.optionViews[key].swing(timing)
        } else if ((i + 1) % 2 === 0) {
            this.optionViews[key].shake(timing)
        } else {
            this.optionViews[key].bounce(timing)
        }
    }

    shake = (key, i) => {
        const { shakeDuration } = this.props
        const timing = shakeDuration - 90 * i
        this.optionViews[key].shake(timing)
    }

    onSelectScreen = (screen) => {
        this.close().then(() => {
            this.setState(() => ({ selectedScreen: screen }))
        })
    }

    renderScreen = (screen) => {
        const { screens } = this.state
        const optionHeight = height / screens.length
        return (
            <Animatable.View ref={view => this.optionViews[screen.key] = view} key={screen.key} style={{ position: "absolute", top: -height, left: -width / 4, height: height, width: width + width / 2, backgroundColor: screen.color }}>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => this.onSelectScreen(screen)} delayPressIn={200}>
                    <View flex />
                    <View style={{ height: optionHeight }}>
                        {screen.customHeader ? screen.customHeader() :
                            <View flex vcenter hcenter>
                                <Text style={{ color: screen.titleColor || "#FFF", marginTop: 12, fontSize: 18, marginTop: Platform.OS == 'ios' ? 15 : 5 }}>{screen.name}</Text>
                            </View>}
                    </View>
                </TouchableOpacity>
            </Animatable.View>
        )
    }

    render() {
        const { screens, selectedScreen } = this.state
        const { headerHeight } = this.props
        if (screens.length == 0) {
            return null
        }
        return (
            <View flex>
                {selectedScreen.render()}
                <Animatable.View {...this.panResponder.panHandlers} ref={view => this.optionViews['drawer'] = view} style={{ backgroundColor: selectedScreen.color, position: "absolute", height: height + headerHeight, width, top: -height, transform: [{ translateY: this.state.panAnimation.y }] }}>
                    <View flex>
                        {_.map(screens, (o, i) => this.renderScreen(o, i))}
                    </View>
                    <View row vcenter style={{ ...styles.header, height: headerHeight }}>
                        <View flex>
                            <TouchableOpacity style={{ marginTop: 12, marginLeft: 15 }} onPress={this.open}>
                                <MAIcon name="menu" size={30} color={selectedScreen.hamburgerColor || "#FFF"} />
                            </TouchableOpacity>
                        </View>
                        <View flex>
                            {selectedScreen.customHeader ? selectedScreen.customHeader() :
                                <View flex vcenter hcenter>
                                    <Text style={{ color: selectedScreen.titleColor || "#FFF", marginTop: 12, fontSize: 18, marginTop: Platform.OS == 'ios' ? 15 : 5 }}>{selectedScreen.name}</Text>
                                </View>}
                        </View>
                        <View flex />
                    </View>
                </Animatable.View>
            </View>
        )
    }
}

const styles = {
    header: {
        shadowOpacity: 0.21,
        shadowOpacity: 1,
        shadowRadius: 2,
        shadowOffset: { height: 0, width: 0 },
        elevation: 3,
    }
}

FallingDrawer.propTypes = {
    screens: PropTypes.array,
    headerHeight: PropTypes.number,
    shakeDuration: PropTypes.number,
    optionCollapseSpeed: PropTypes.number,
    optionCollapseDelay: PropTypes.number,
    diversifyAnimations: PropTypes.bool,
};

FallingDrawer.defaultProps = {
    headerHeight: HEADER_HEIGHT,
    shakeDuration: 800,
    optionCollapseSpeed: 150,
    optionCollapseDelay: 200,
    diversifyAnimations: true
}
