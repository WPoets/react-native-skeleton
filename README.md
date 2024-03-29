<p align="center">
	<a href="https://www.wpoets.com/" target="_blank"><img width="200"src="https://www.wpoets.com/wp-content/uploads/2018/05/WPoets-logo-1.svg" alt='Your Web and WordPress Experts'></a>
</p>

# RNSkelton

### Environment Setup

Requires latest node and latest android studio environment.
Use below link to know how to configure the environment.

https://reactnative.dev/docs/environment-setup

### Third Paty Dependencies
1. google-services.json (Mandatory)
2. facebook app id
3. branch.io keys

Note: We are using firebase, facebook SDK and branch.io

### Package ID

In this skelton we have used the package ID: com.example.rn .
So you will have to replace "com.example.rn" with your package id in the "android" folder.

### How to change package ID references ?

1. search for the current package ID "com.example.rn" in the "android folder"
2. you will find the old references and you may replace it with your new package id
3. you can update the folder names eg: android/app/src/debug/java/com/example/rn to android/app/src/debug/java/com/example1/rn1

### Using release keystore

Paste your release keystore in android/app folder and update references in android/gradle.properties

### Awesome App XML Exports

We have added a sample react demo awesome app code exports inside "aw_xml_exports" folder. 

### Installation

Install the dependencies and start the server.

```sh
$ cd react-native-skelton
$ npm install
$ npx react-native run-android
```
If you are using yarn

```sh
$ cd react-native-skelton
$ yarn install
$ yarn android
```

### Changing webView source

App.js

```
apiUrl: 'https://alpha.wordpoets.com/api/initialize',
```
Find the above code and change the url

[Read further](codedoc.md) for the detailed explanation.

## We're Hiring!

<p align="center">
<a href="https://www.wpoets.com/careers/"><img src="https://www.wpoets.com/wp-content/uploads/2020/11/work-with-us_1776x312.png" alt="Join us at WPoets, We specialize in designing, building and maintaining complex enterprise websites and portals in WordPress."></a>
</p>
