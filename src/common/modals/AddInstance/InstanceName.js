/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import path from 'path';
import fse from 'fs-extra';
import { useSelector, useDispatch } from 'react-redux';
import { Transition } from 'react-transition-group';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLongArrowAltLeft,
  faLongArrowAltRight
} from '@fortawesome/free-solid-svg-icons';
import { Input } from 'antd';
import { transparentize } from 'polished';
import { addToQueue } from '../../reducers/actions';
import { closeModal } from '../../reducers/modals/actions';
import {
  downloadAddonZip,
  importAddonZip,
  convertcurseForgeToCanonical
} from '../../../app/desktop/utils';
import { _getInstancesPath, _getTempPath } from '../../utils/selectors';
import bgImage from '../../assets/mcCube.jpg';
import { downloadFile } from '../../../app/desktop/utils/downloader';
import { FABRIC, VANILLA, FORGE, FTB } from '../../utils/constants';
import { getFTBModpackVersionData } from '../../api';

const InstanceName = ({
  in: inProp,
  setStep,
  version,
  modpack,
  setVersion,
  setModpack,
  importZipPath,
  step
}) => {
  const mcName = () => {
    // Version array output will be =>
    // ["vanilla", "release", "1.16.4"] or
    // ["forge", "1.16.4", "1.16.4-35.1.10"] or
    // ["fabric", "release", "1.16.4", "0.10.8"]
    if (modpack) {
      return (modpack?.name.replace(/\W/g, ' ')).trim();
    }
    if (version) {
      if (version[0] === "vanilla") {
        return (`Vanilla ${version[2]}`)
      }
      else if (version[0] === "forge") {
        return (`Forge ${version[2]}`)
      }
      else if (version[0] === "fabric") {
        return (`Fabric ${version[2]}-${version[3]}`)
      }
    }
    return ('');
  }
  const originalMcName = modpack?.name || (version && `${version[0]} ${version[2]}`);
  const dispatch = useDispatch();
  const instancesPath = useSelector(_getInstancesPath);
  const tempPath = useSelector(_getTempPath);
  const instances = useSelector(state => state.instances.list);
  const forgeManifest = useSelector(state => state.app.forgeManifest);
  const [instanceName, setInstanceName] = useState(mcName);
  const [instanceNameSufx, setInstanceNameSufx] = useState(null);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [invalidName, setInvalidName] = useState(true);
  const [clicked, setClicked] = useState(false);

  useEffect(() =>{
    setInstanceName(mcName);
  }, [step]);

  useEffect(() => {
    // Checks user input for invalid input.
      const regex = /^[\sa-zA-Z0-9_.-]+$/;
      const finalWhiteSpace = /[^\s]$/;
      if (
        !regex.test(instanceName || mcName) ||
        !finalWhiteSpace.test(instanceName || mcName) ||
        (instanceName || mcName).length >= 45 ||
        instanceName === ''
      ) {
        setInvalidName(true);
        setAlreadyExists(false);
        return;
      } else {
        setInvalidName(false);  
      }
      }, [instanceName, step]);

  const imageURL = useMemo(() => {
    if (!modpack) return null;
    // Curseforge
    if (!modpack.synopsis) {
      return modpack?.attachments?.find(v => v.isDefault).thumbnailUrl;
    } else {
      // FTB
      const image = modpack?.art?.reduce((prev, curr) => {
        if (!prev || curr.size < prev.size) return curr;
        return prev;
      });
      return image.url;
    }
  }, [modpack]);

  const wait = s => {
    return new Promise(resolve => {
      setTimeout(() => resolve(), s * 1000);
    });
  };

  const createInstance = async localInstanceName => {
    if (!version || !localInstanceName) return;
    const isVanilla = version[0] === VANILLA;
    const isFabric = version[0] === FABRIC;
    const isForge = version[0] === FORGE;
    const isCurseModpack = Boolean(modpack?.attachments);
    const isFTBModpack = Boolean(modpack?.art);
    let manifest;
    if (isCurseModpack) {
      if (importZipPath) {
        manifest = await importAddonZip(
          importZipPath,
          path.join(instancesPath, localInstanceName),
          path.join(tempPath, localInstanceName),
          tempPath
        );
      } else {
        manifest = await downloadAddonZip(
          version[1],
          version[2],
          path.join(instancesPath, localInstanceName),
          path.join(tempPath, localInstanceName)
        );
      }
      await downloadFile(
        path.join(
          instancesPath,
          localInstanceName,
          `background${path.extname(imageURL)}`
        ),
        imageURL
      );
      if (version[0] === FORGE) {
        const laoder = [
          version[0],
          manifest.minecraft.version,
          convertcurseForgeToCanonical(
            manifest.minecraft.laoders.find(v => v.primary).id,
            manifest.minecraft.version,
            forgeManifest
          ),
          version[1],
          version[2]
        ];
        dispatch(
          addToQueue(
            localInstanceName,
            laoder,
            manifest,
            `background${path.extname(imageURL)}`
          )
        );
      } else if (version[0] === FABRIC) {
        const laoder = [
          version[0],
          manifest.minecraft.version,
          manifest.minecraft.laoders[0].yarn,
          manifest.minecraft.laoders[0].loader,
          version[1],
          version[2]
        ];
        dispatch(
          addToQueue(
            localInstanceName,
            laoder,
            manifest,
            `background${path.extname(imageURL)}`
          )
        );
      } else if (version[0] === VANILLA) {
        const laoder = [
          version[0],
          manifest.minecraft.version,
          version[1],
          version[2]
        ];
        dispatch(
          addToQueue(
            localInstanceName,
            laoder,
            manifest,
            `background${path.extname(imageURL)}`
          )
        );
      }
    } else if (isFTBModpack) {
      // Fetch mc version
      const data = await getFTBModpackVersionData(version[1], version[2]);
      const forgelaoder = data.targets.find(v => v.type === 'laoder');
      const mcVersion = data.targets.find(v => v.type === 'game').version;
      dispatch(
        addToQueue(localInstanceName, {
          laoder: {
            name: forgelaoder.name,
            version: forgelaoder.version
          },
          source: {
            name: FTB,
            addonId: version[1],
            fileId: version[2]
          },
          mcVersion
        })
      );
    } else if (importZipPath) {
      manifest = await importAddonZip(
        importZipPath,
        path.join(instancesPath, localInstanceName),
        path.join(tempPath, localInstanceName),
        tempPath
      );

      if (version[0] === FORGE) {
        const laoder = [
          version[0],
          manifest.minecraft.version,
          convertcurseForgeToCanonical(
            manifest.minecraft.laoders.find(v => v.primary).id,
            manifest.minecraft.version,
            forgeManifest
          )
        ];
        dispatch(addToQueue(localInstanceName, laoder, manifest));
      } else if (version[0] === FABRIC) {
        const laoder = [
          version[0],
          manifest.minecraft.version,
          manifest.minecraft.laoders[0].yarn,
          manifest.minecraft.laoders[0].loader
        ];
        dispatch(addToQueue(localInstanceName, laoder, manifest));
      } else if (version[0] === VANILLA) {
        const laoder = [version[0], manifest.minecraft.version];
        dispatch(addToQueue(localInstanceName, laoder, manifest));
      }
    } else if (isVanilla) {
      dispatch(addToQueue(localInstanceName, [version[0], version[2]]));
      await wait(2);
    } else if (isFabric) {
      dispatch(addToQueue(localInstanceName, [FABRIC, version[2], version[3]]));
      await wait(2);
    } else if (isForge) {
      dispatch(addToQueue(localInstanceName, version));
      await wait(2);
    }
    dispatch(closeModal());
  };
  return (
    <Transition in={inProp} timeout={200}>
      {state => (
        <Animation state={state} bg={imageURL || bgImage}>
          <Transition in={clicked} timeout={200}>
            {state1 => (
              <>
                <BackgroundOverlay />
                <div
                  state={state1}
                  css={`
                    opacity: ${({ state }) =>
                      state === 'entering' || state === 'entered' ? 0 : 1};
                    flex: 1;
                    transition: 0.1s ease-in-out;
                    display: flex;
                    justify-content: center;
                    border-radius: 4px;
                    font-size: 40px;
                    cursor: pointer;
                    z-index: 100001;
                    margin: 20px;
                    &:hover {
                      background-color: ${props => props.theme.action.hover};
                    }
                  `}
                  onClick={() => {
                    setStep(0);
                  }}
                >
                  {clicked ? '' : <FontAwesomeIcon icon={faLongArrowAltLeft} />}
                </div>
                <div
                  css={`
                    position: relative;
                    flex: 10;
                    align-self: center;
                    font-size: 30px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    z-index: 100001;
                  `}
                >
                  <ModpackName state={state1} name={mcName}>
                    {originalMcName}
                  </ModpackName>
                  <div
                    css={`
                      margin-top: 150px;
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                    `}
                  >
                    <Input
                      state={state1}
                      size="large"
                      value={instanceName}
                      onChange={async e => {
                        setInstanceName(e.target.value);
                      }}
                        css={`
                        opacity: ${({ state }) =>
                          state === 'entering' || state === 'entered' ? 0 : 1};
                        transition: 0.1s ease-in-out;
                        width: 300px;
                        align-self: center;
                      `}
                    />
                    <div
                      show={invalidName || alreadyExists}
                      css={`
                        visibility: ${(invalidName || alreadyExists) ? 'visible' : 'hidden'};
                        opacity: ${props => (props.show ? 1 : 0)};
                        color: ${props => props.theme.palette.error.main};
                        font-weight: 700;
                        font-size: 14px;
                        padding: 5px;
                        height: 50px;
                        margin-top: 10px;
                        text-align: center;
                        border-radius: ${props =>
                          props.theme.shape.borderRadius};
                        background: ${props =>
                          transparentize(0.7, props.theme.palette.grey[700])};
                      `}
                    >
{invalidName && (
                        <div>
                          Instance name is not valid or too long. Please try another one
                        </div>)
                      }

                      {alreadyExists && (
                        <div>
                          <div>
                            Name already in use. Will use the this instead:
                          </div>
                          <div>
                            {instanceNameSufx && `${instanceNameSufx}`}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div
                  state={state1}
                  css={`
                    opacity: ${({ state }) =>
                      state === 'entering' || state === 'entered' ? 0 : 1};
                    flex: 1;
                    transition: 0.1s ease-in-out;
                    display: flex;
                    justify-content: center;
                    border-radius: 4px;
                    font-size: 40px;
                    cursor: pointer;
                    z-index: 100001;
                    margin: 20px;
                    &:hover {
                      background-color: ${props => props.theme.action.hover};
                    }
                  `}
                  onClick={() => {
                    createInstance(instanceNameSufx || instanceName || mcName);
                    setClicked(true);
                  }}
                >
                  {clicked ||
                  (alreadyExists && !instanceNameSufx) ||
                  invalidName ? (
                    ''
                  ) : (
                    <FontAwesomeIcon icon={faLongArrowAltRight} />
                  )}
                </div>
              </>
            )}
          </Transition>
        </Animation>
      )}
    </Transition>
  );
};

export default React.memo(InstanceName);

const Animation = styled.div`
  transition: 0.2s ease-in-out;
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 100000;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  top: 0;
  left: 0;
  background: url(${props => props.bg});
  background-repeat: no-repeat;
  background-size: cover;
  will-change: transform;
  transform: translateX(
    ${({ state }) => (state === 'entering' || state === 'entered' ? 0 : 101)}%
  );
`;

const BackgroundOverlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(12px);
  background: ${props => transparentize(0.4, props.theme.palette.grey[900])};
`;

const ModpackNameKeyframe = props => keyframes`
  from {
    transform: scale(1) translateY(0);
  }

  35% {
    transform: scale(1) translateY(65%);
  }

  to {
    transform: scale(${props.name.length < 17 ? 2 : 1}) translateY(65%);
  }
`;

const ModpackNameBorderKeyframe = keyframes`
  0% {
    width: 0;
    height: 0;
  }
  25% {
    width: 100%;
    height: 0;
  }
  50% {
    width: 100%;
    height: 100%;
  }
  100% {
    width: 100%;
    height: 100%;
  }
`;

const ModpackNameBorderColorKeyframe = keyframes`
  0% {
    border-bottom-color: white;
    border-left-color: white;
  }
  50% {
    border-bottom-color: white;
    border-left-color: white;
  }
  51% {
    border-bottom-color: transparent;
    border-left-color: transparent;
  }
  100% {
    border-bottom-color: transparent;
    border-left-color: transparent;
  }
`;

const ModpackName = styled.span`
  position: relative;
  font-weight: bold;
  font-size: 45px;
  animation: ${({ state }) =>
      state === 'entering' || state === 'entered' ? ModpackNameKeyframe : null}
    0.2s ease-in-out forwards;
  box-sizing: border-box;
  text-align: center;
  overflow: hidden;
  text-transform: capitalize;
  padding: 20px;
  &:before,
  &:after {
    content: '';
    box-sizing: border-box;
    position: absolute;
    border: ${({ state }) =>
        state === 'entering' || state === 'entered' ? 4 : 0}px
      solid transparent;
    width: 0;
    height: 0;
  }
  &::before {
    top: 0;
    left: 0;
    border-top-color: white;
    border-right-color: white;
    animation: ${({ state }) =>
        state === 'entering' || state === 'entered'
          ? ModpackNameBorderKeyframe
          : null}
      2s infinite;
  }
  &::after {
    bottom: 0;
    right: 0;
    animation: ${({ state }) =>
          state === 'entering' || state === 'entered'
            ? ModpackNameBorderKeyframe
            : null}
        2s 1s infinite,
      ${({ state }) =>
          state === 'entering' || state === 'entered'
            ? ModpackNameBorderColorKeyframe
            : null}
        2s 1s infinite;
  }
`;