import React, { Component } from 'react';
import { Animated, Text, View, ImageBackground, Image } from 'react-native';
import styles from '../utils/styles';

class FadeInView extends React.Component {
    state = {
        fadeAnim: new Animated.Value(0),  
    }

    componentDidMount() {
        Animated.timing(                  
            this.state.fadeAnim,            
            {
                toValue: 1,                   
                duration: 3500,
                useNativeDriver: true           
            }
        ).start();                        
    }

    render() {
        let { fadeAnim } = this.state;

        return (
            <Animated.View                 
                style={{
                    ...this.props.style,
                    opacity: fadeAnim,         
                }}
            >
                {this.props.children}
            </Animated.View>
        );
    }
}

class SplashScreen extends Component {
    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>

                <ImageBackground source={{ uri: 'splash_bg' }} style={{
                    width: '100%', height: '100%', resizeMode: 'contain', alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FadeInView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Image style={styles.centerSplash}
                            source={{ uri: 'splash' }}
                        />
                        <Text style={styles.splashText}>My app tag line</Text>
                    </FadeInView>

                </ImageBackground>
            </View>

        )
    }
}

export default SplashScreen; 