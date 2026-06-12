import React from 'react';

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-md">
      <div className="revenue-loader">
        <svg width={100} height={100} viewBox="0 0 100 100">
          <defs>
            <mask id="clipping">
              <polygon points="0,0 100,0 100,100 0,100" fill="black" />
              <polygon points="25,25 75,25 50,75" fill="white" />
              <polygon points="50,25 75,75 25,75" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
            </mask>
          </defs>
        </svg>
        <div className="box" />
      </div>
      <span className="font-label-md text-label-md tracking-wider text-primary/80 animate-pulse mt-md">
        CARGANDO COMMAND CENTER...
      </span>
    </div>
  );
};

export default Loader;
