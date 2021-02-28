import React, { Component } from 'react';
import styles from '../utils/styles.js';
import { View, Image, } from 'react-native';

class HeaderLogo extends Component {
    render() {
        return (
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
                <Image style={styles.logo}
                    source={{ uri: 'logo' }}
                />
            </View>
        );
    }
}
export default HeaderLogo;