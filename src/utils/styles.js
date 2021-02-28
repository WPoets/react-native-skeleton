import {StyleSheet, Dimensions, Header} from 'react-native';

const styles = StyleSheet.create({
    container: {
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
        // alignItems: 'center',
        // justifyContent: 'center',
        flex: 1
    },
    splashscreen: {
        height: '100%',
        width: '100%'
    },
    centerContainer: {
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
        alignItems: 'center',
        justifyContent: 'center'
    },
    center: {
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    centerText: {
        padding: 20,
    },
    buttonText: {
        padding: 10,
    },
    centerLogo: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    centerSplash:
    {
        width: 150,
        height: 100,
        resizeMode: 'contain',
        bottom: Dimensions.get('window').height * 0.30
    }
    ,
    logo: {
        width: 180,
        height: 60,
        resizeMode: 'contain',
        alignSelf: 'center'
    },
    limage: {
        width: Dimensions.get('window').width,
        height: 300,
        top: -100,
    },
    descText: {
        paddingHorizontal: 10,
        fontSize: 18,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#061f48',
        paddingBottom: 10
    },
    splashText: {
        fontSize: 20,
        bottom: Dimensions.get('window').height * 0.30,
        color:'#061f48'
    },
    headerLogoContainer: {
        height:60,
        width:'100%',
        backgroundColor:'#fefefe'
    },
    headerTitleContainer: {
        height:100,
        width:'100%',
        backgroundColor:'#fefefe'
    },
    headerTitle: {
        fontSize: 24,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
    }
}
);

export default styles;