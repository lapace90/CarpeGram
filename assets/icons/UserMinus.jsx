import * as React from "react"
import Svg, { Path } from "react-native-svg"

const UserMinus = (props) => (
  <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color={"#000000"} fill={"none"} {...props}>
    <Path d="M5.78256 15.1112C4.68218 15.743 1.79706 17.0331 3.55429 18.6474C4.41269 19.436 5.36872 20 6.57068 20H13.4293C14.6313 20 15.5873 19.436 16.4457 18.6474C18.2029 17.0331 15.3178 15.743 14.2174 15.1112C11.6371 13.6296 8.36294 13.6296 5.78256 15.1112Z" stroke="currentColor" strokeWidth={props.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.5 8C13.5 9.933 11.933 11.5 10 11.5C8.067 11.5 6.5 9.933 6.5 8C6.5 6.067 8.067 4.5 10 4.5C11.933 4.5 13.5 6.067 13.5 8Z" stroke="currentColor" strokeWidth={props.strokeWidth} />
    <Path d="M17 12L22 12" stroke="currentColor" strokeWidth={props.strokeWidth} strokeLinecap="round" />
  </Svg>
);

export default UserMinus;