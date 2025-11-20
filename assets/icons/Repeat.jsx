import * as React from "react"
import Svg, { Path } from "react-native-svg"

const Repeat = (props) => (
  <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} fill={"none"} {...props}>
    <Path d="M17 1L21 5L17 9V6H5V8H3V4C3 2.9 3.9 2 5 2H17V1ZM7 23L3 19L7 15V18H19V16H21V20C21 21.1 20.1 22 19 22H7V23Z" fill="currentColor" />
  </Svg>
);

export default Repeat;