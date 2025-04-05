declare module '@iconify/react' {
  import * as React from 'react';
  
  export interface IconifyIconProps extends React.SVGAttributes<SVGElement> {
    icon: string | object;
    width?: string | number;
    height?: string | number;
    color?: string;
    inline?: boolean;
    hFlip?: boolean;
    vFlip?: boolean;
    flip?: string;
    rotate?: number | string;
  }
  
  export const Icon: React.FC<IconifyIconProps>;
} 