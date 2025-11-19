import * as React from "react"
import Svg, { Path, Circle } from "react-native-svg"

const Info = (props) => (
  <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color={"#000000"} fill={"none"} {...props}>
    <Circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={props.strokeWidth} />
    <Path d="M12 17V11" stroke="currentColor" strokeWidth={props.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M11.992 8H12.001" stroke="currentColor" strokeWidth={props.strokeWidth + 1} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default Info;