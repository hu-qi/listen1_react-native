import { View, Text } from 'react-native';
import React from 'react';
import { connect } from 'react-redux';
import { withTheme } from 'styled-components/native';
import { ListEditor } from '../../components';
import { saveMyPlaylists, editMyPlaylist } from '../../redux/actions';

class ReOrder extends React.Component {
  props: {
    navigation: Object,
    myPlaylistState: Object,
    dispatch: Function,
  };

  state = { data: [] };
  constructor(props) {
    super(props);
    const { navigation, route } = this.props;
    // const itemType = navigation.getParam('type', '');
    const {type:itemType} = route.params || '';

    this.state.type = itemType;
    if (itemType === 'myplaylist') {
      this.state.data = this.props.myPlaylistState.playlists.slice(1);
    } else if (itemType === 'playlist') {
      // const playlist = navigation.getParam('playlist', {});
      const {playlist} = route.params || {};
      this.state.data = playlist.tracks;
      this.state.info = playlist.info;
    }
  }
  //   componentWillUnmount() {
  //     this.props.dispatch(saveMyPlaylists(this._listEditor.getData()));
  //   }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <ListEditor
          renderRow={d => {
            return (
              <Text style={{ flex: 1, marginLeft: 10 }}>{d.data.title}</Text>
            )
          }}
          data={this.state.data}
          ref={component => {
            this._listEditor = component;
          }}
          onChange={data => {
            // TODO: optimaze state sync frequency
            if (this.state.type === 'myplaylist') {
              this.props.dispatch(saveMyPlaylists(data));
            } else if (this.state.type === 'playlist') {
              this.props.dispatch(
                editMyPlaylist({ tracks: data, info: this.state.info })
              );
            }
          }}
        />
      </View>
    );
  }
}
const mapStateToProps = ({ myPlaylistState }) => ({
  myPlaylistState,
});

export default connect(mapStateToProps)(withTheme(ReOrder));
