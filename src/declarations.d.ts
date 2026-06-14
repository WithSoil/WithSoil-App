declare module '*.png' {
  import { ImageSourcePropType } from 'react-native';
  const content: ImageSourcePropType;
  export default content;
}

declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';