import { useCallback } from "react";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";

export const Background = (): JSX.Element => {
  const customInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const options = {
    preset: "links",
  };

  return (
    <div className="w-full h-full absolute inset-0 -z-50">
      <Particles
        id="tsparticles"
        init={customInit}
        options={{
          background: {
            color: {
              value: "#000",
            },
          },
          fpsLimit: 120,
          interactivity: {},
          particles: {
            color: {
              value: "#ffffff",
            },
            links: {
              color: "#BF40BF",
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 2,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 120,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 0.2, max: 2 },
            },
          },
          detectRetina: true,
        }}
      />
    </div>
  );
};
