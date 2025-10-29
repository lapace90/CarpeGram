import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { theme } from '../../constants/theme'

import Home from './Home'
import {ArrowLeft} from './Arrows'
import { Maps, Location } from './Location'
import { UnlockIcon, LockIcon } from './Lock'
import User from './User'
import Heart from './Heart'
import Mail from './Mail'
import Call from './Call'
import Camera from './Camera'
import Comment from './Comment'
import Delete from './Delete'
import NoteEdit from './Edit'
import ImageIcon from './Image'
import logout from './logout'
import Plus from './Plus'
import Search from './Search'
import Send from './Send'
import Share from './Share'
import { ThreeDotsCircle, ThreeDotsVertical, ThreeDotsHorizontal } from './ThreeDots'
import Video from './Video'

const icons = {
  home: Home,
  arrowLeft: ArrowLeft,
  mail: Mail,
  lock: LockIcon,
  unlock: UnlockIcon,
  user: User,
  heart: Heart,
  call: Call,
  camera: Camera,
  comment: Comment,
  delet: Delete,
  edit: NoteEdit,
  image: ImageIcon,
  location: Location,
  maps: Maps,
  logout: logout,
  plus: Plus,
  search: Search,
  send: Send,
  share: Share,
  threeDotsCircle: ThreeDotsCircle,
  threeDotsVertical: ThreeDotsVertical,
  threeDotsHorizontal: ThreeDotsHorizontal,
  video: Video
}

const Icon = ({ name, ...props }) => {
  const IconComponent = icons[name];
  return (
    <IconComponent
      height={props.size || 24}
      width={props.size || 24}
      strokeWidth={props.strokeWidth || 1.9}
      color={theme.colors.textLight}
      {...props}
    />
  )
}

export default Icon;
