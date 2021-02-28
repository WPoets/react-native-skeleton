import React from 'react';
import { View, StatusBar, StyleSheet, Platform } from 'react-native';

const STATUSBAR_HEIGHT = StatusBar.currentHeight;

const GeneralStatusBarColor = ({ backgroundColor, ...props }) => (

    <StatusBar backgroundColor={backgroundColor} {...props} />
);
const styles = StyleSheet.create({
    statusBar: {
        height: STATUSBAR_HEIGHT
    }
});
export default GeneralStatusBarColor;