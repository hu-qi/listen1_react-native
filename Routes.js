import React from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { withTheme, ThemeProvider } from 'styled-components/native';

import { blackTheme, whiteTheme } from './src/config/theme';
import { ThemeFlex, PrimaryText } from './src/components';

// Screens
import PlaylistTabs from './src/views/playlist/playlist-tabs.screen';
import Playlist from './src/views/playlist/playlist.screen';
import BackgroundPlayer from './src/views/player/background-player.screen';
import ModalPlayerContainer from './src/views/player/modal-player-container.screen';
import MiniPlayer from './src/views/player/mini-player.screen';
import Setting from './src/views/setting/setting.screen';
import CreatePlaylist from './src/views/myplaylist/create-playlist.screen';
import ReOrder from './src/views/myplaylist/reorder.screen';
import ModalLiteContainer from './src/views/player/modal-lite-container.screen';
import ImportPlaylist from './src/views/myplaylist/import-playlist.screen';
import About from './src/views/setting/about.screen';
import ImportLocal from './src/views/setting/import-local.screen';
import ExportLocal from './src/views/setting/export-local.screen';
import NavHeader from './src/views/playlist/nav-header.screen'

const Stack = createNativeStackNavigator();

function MainStack({ theme }) {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={PlaylistTabs}
        options={({ navigation, route }) => ({
          headerTitle: () => (
            <NavHeader theme={theme} navigation={navigation} />
          ),
          headerStyle: {
            backgroundColor: theme.windowColor,
          },
        })} />
      <Stack.Screen name="Details" component={Playlist} options={({ navigation, route }) => ({
        title: '',
        headerTintColor: theme.primaryColor,
        headerStyle: { backgroundColor: theme.windowColor },
      })} />
      <Stack.Screen name="Setting" component={Setting} options={({ navigation, route }) => ({
        title: '更多',
        headerTintColor: theme.primaryColor,
        headerStyle: { backgroundColor: theme.windowColor },
      })} />
      <Stack.Screen name="CreatePlaylist" component={CreatePlaylist} options={({ navigation, route }) => {
        const {
          params = {
            onFinish: () => { },
          },
        } = route;
        return {
          title: '新建歌单',
          headerTintColor: theme.primaryColor,
          headerStyle: { backgroundColor: theme.windowColor },
          headerRight: (props) => (
            <TouchableOpacity
              onPress={() => params.onFinish()}
              style={{ padding: 10 }}
            >
              <PrimaryText style={{ fontSize: 18 }}>完成</PrimaryText>
            </TouchableOpacity>
          ),
        };
      }} />
      <Stack.Screen name="ImportPlaylist" component={ImportPlaylist} options={({ navigation, route }) => {
        const {
          params = {
            onFinish: () => { },
          },
        } = route;

        return {
          title: '导入歌单',
          headerTintColor: theme.primaryColor,
          headerStyle: { backgroundColor: theme.windowColor },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => params.onFinish()}
              style={{ padding: 10 }}
            >
              <PrimaryText style={{ fontSize: 18 }}>打开</PrimaryText>
            </TouchableOpacity>
          ),
        };
      }} />
      <Stack.Screen name="ReOrder" component={ReOrder} options={({ navigation, route }) => ({
        title: '编辑歌单',
        headerTintColor: theme.primaryColor,
        headerStyle: { backgroundColor: theme.windowColor },
      })} />
      <Stack.Screen name="About" component={About} options={({ navigation, route }) => ({
        title: '关于',
        headerTintColor: theme.primaryColor,
        headerStyle: { backgroundColor: theme.windowColor },
      })} />
      <Stack.Screen name="ImportLocal" component={ImportLocal} options={({ navigation, route }) => ({
        title: '恢复',
        headerTintColor: theme.primaryColor,
        headerStyle: { backgroundColor: theme.windowColor },
      })} />
      <Stack.Screen name="ExportLocal" component={ExportLocal} options={({ navigation, route }) => ({
        title: '备份',
        headerTintColor: theme.primaryColor,
        headerStyle: { backgroundColor: theme.windowColor },
      })} />
    </Stack.Navigator>
  );
}

function AppContainer(data) {
  return (
    <NavigationContainer>
      <MainStack theme={data.theme} navigation={data.navigation} />
    </NavigationContainer>
  );
}

const ThemedAppContainer = withTheme(AppContainer);

const ThemedStatusBar = withTheme(({ theme }) => (
  <StatusBar backgroundColor={theme.windowColor} barStyle={theme.barStyle} />
));

function App(props) {
  const { settingState } = props;
  const theme = settingState.theme === 'black' ? blackTheme : whiteTheme;

  return (
    <ThemeProvider theme={theme}>
      <ThemeFlex>
        <ThemedAppContainer />
        <ThemedStatusBar />
        <BackgroundPlayer />
        <MiniPlayer />
        <ModalPlayerContainer />
        <ModalLiteContainer />
      </ThemeFlex>
    </ThemeProvider>
  )
}

const mapStateToProps = ({ settingState, modalState, playerState, searchState, myPlaylistState }) => ({
  settingState,
  modalState,
  playerState,
  searchState,
  myPlaylistState
});

export default connect(mapStateToProps)(App);