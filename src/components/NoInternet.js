import React, { Component } from 'react';

import { StyleSheet, View, Dimensions, Text, Image, } from 'react-native';

class NoInternet extends Component {
    render() {
        return (
            // <View>
            <View style={styles.container}>
                <Image source={{ uri: 'no_internet' }} style={styles.image} />
                <View style={styles.centerContainer}>
                    <Text style={styles.titleText}>No Internet Connection</Text>
                    <Text style={styles.descText}>Please check your internet connection and try again.</Text>
                </View>

            </View>
            // </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,

    },
    centerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        top: 150
    },
    image: {
        top: Dimensions.get('window').height * 0.10,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height * 0.40,
    },
    titleText: {
        // fontWeight: 'bold',
        padding: 10,
        fontSize: 22,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        // fontFamily: 'Roboto'
    },
    descText: {
        fontSize: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
        paddingLeft: 50,
        paddingRight: 50,
        // padding: 50,
        textAlign: 'center',
    }
});

export default NoInternet;