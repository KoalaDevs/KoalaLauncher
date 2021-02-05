import * as ActionTypes from "./actionTypes";

export function updateSoundsSetting(sounds) {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.UPDATE_SOUNDS,
      sounds,
    });
  };
}

export function updateReleaseChannel(releaseChannel) {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.UPDATE_RELEASE_CHANNEL,
      releaseChannel,
    });
  };
}

export function updateHideWindowOnGameLaunch(hideWindow) {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.HIDE_WINDOW_ON_GAME_LAUNCH,
      hideWindow,
    });
  };
}

export function updateShowNews(value) {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.UPDATE_SHOW_NEWS,
      value,
    });
  };
}

export function updatePotatoPcMode(value) {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.UPDATE_POTATO_PC_MODE,
      value,
    });
  };
}

export function updateResolution(resolution) {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.UPDATE_MINECRAFT_RESOLUTION,
      resolution,
    });
  };
}

export function updateJavaPath(path) {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.UPDATE_JAVA_PATH,
      path,
    });
  };
}

export function updateJavaMemory(memory) {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.UPDATE_JAVA_MEMORY,
      memory,
    });
  };
}

export function updateJavaArguments(args) {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.UPDATE_JAVA_ARGUMENTS,
      args,
    });
  };
}

export function updateDiscordRPC(val) {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.UPDATE_DISCORD_RPC,
      val,
    });
  };
}

export function updateCurseReleaseChannel(curseReleaseChannel) {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.UPDATE_CURSE_RELEASE_CHANNEL,
      curseReleaseChannel,
    });
  };
}

export function updateAssetsCheckSkip(value) {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.UPDATE_ASSETS_CHECK_SKIP,
      value,
    });
  };
}

export function updateCacheModsInstances(value) {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.UPDATE_CACHE_MODS_INSTANCES,
      value,
    });
  };
}

export function updateCacheMods(value) {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.UPDATE_CACHE_MODS,
      value,
    });
  };
}
