import React, { Component } from 'react';

import { StyleSheet, View, Dimensions, Text, Image, } from 'react-native';

class MaintenanceScreen extends Component {
    render() {
        return (
            <View>
                <View style={styles.container}>
                    <Image source={{ uri: 'no_internet' }} style={styles.image} />
                    <View style={styles.centerContainer}>
                        <Text style={styles.titleText}>Under Maintenance</Text>
                        {/* <Text style={styles.noFont}>No Internet Connection</Text> */}
                        <Text style={styles.descText}>We are sorry, our Server is under Maintenance! Please try again soon.</Text>
                    </View>

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
        fontWeight: 'bold',
        fontSize: 22,
        // fontFamily: 'Montserrat-SemiBold',
        color: "#000000"
    },
    noFont: {
        fontWeight: 'bold',
        fontSize: 22,
        // fontFamily: 'Montserrat-SemiBold',
        // color: "#000000"
    },
    descText: {
        fontSize: 16,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 50,
        textAlign: 'center',
        // fontFamily: 'Monsterrat'

    }
});

export default MaintenanceScreen;