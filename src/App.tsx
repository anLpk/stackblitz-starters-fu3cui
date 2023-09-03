import { FC } from 'react';
import TruncatedFileName from './MiddleTruncate';

export const App: FC = () => {
  return (
    <div
      style={{
        containerName: 'test',
        containerType: 'inline-size',
        resize: 'horizontal',
        p: 'lg',
        overflow: 'auto',
        border: '1px dashed tomato',
      }}
    >
      <TruncatedFileName
        fileName={
          'thisisverylooooooongfilenamethisisverylooooooongfilenamethisisverylooooooongfilename.tsx'
        }
      />
    </div>
  );
};
