import React, { Component } from 'react';

import { StyleSheet, View, Dimensions, Text, Image, } from 'react-native';

class TryAgain extends Component {
    render() {
        return (
            <View style={styles.centerContainer}>
                <Image style={styles.limage}
                    source={{ uri: 'no_internet' }}
                />
                <Text style={styles.descText}>Oops! Internet Connection Timed out.</Text>
                <Text style={styles.descText}>Please try again.</Text>
                <View style={[{ width: "50%", margin: 10, }]}>
                    <Button
                        onPress={this.reloadURL}
                        title="RETRY"
                        color="#d41d19"
                    />
                </View>
            </View>
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

export default TryAgain;