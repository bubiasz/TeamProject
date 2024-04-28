import { useCallback } from "react";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";

export const Background = (): JSX.Element => {
  const customInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const options = {
    background: {
      color: {
        value: "#000",
      },
    },
    fpsLimit: 120,
    interactivity: {
      detectsOn: "canvas" as "canvas",
      events: {
        onHover: {
          enable: true,
          mode: "bubble"
        },
        onClick: {
          enable: true,
          mode: "repulse"
        },
        resize: true
      },
      modes: {
        grab: {
          distance: 400,
          lineLinked: {
            opacity: 0.5
          }
        },
        bubble: {
          distance: 400,
          size: 4,
          duration: 0.3,
          opacity: 0.5,
          speed: 3
        },
        repulse: {
          distance: 200,
          duration: 0.4
        },
        push: {
          particlesNb: 4
        },
        remove: {
          particlesNb: 2
        }
      }
    },
    particles: {
      color: {
        value: "#BF40BF",
      },
      number: {
        value: 400,
        density: {
          enable: true,
          area: 800
        }
      },
      shape: {
        type: "circle",
        stroke: {
          width: 0,
          color: "#000000"
        },
        polygon: {
          nbSides: 5
        },
        image: {
          src: "img/github.svg",
          width: 100,
          height: 100
        }
      },
      opacity: {
        value: 0.4,
        random: true,
        anim: {
          enable: false,
          speed: 1,
          opacityMin: 0.1,
          sync: false
        }
      },
      size: {
        value: 10,
        random: true,
        anim: {
          enable: false,
          speed: 40,
          sizeMin: 0.1,
          sync: false
        }
      },
      lineLinked: {
        enable: false,
        distance: 500,
        color: "#ffffff",
        opacity: 0.4,
        width: 2
      },
      move: {
        enable: true,
        speed: 0.5,
        direction: "bottom",
        random: false,
        straight: false,
        outMode: "out",
        bounce: false,
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200
        }
      }
    },
    detectRetina: true
  };

  return (
    <div className="w-full h-full absolute inset-0 -z-50">
      <Particles
        id="tsparticles"
        init={customInit}
        options={{
          ...options,
          particles: {
            ...options.particles,
            move: {
              ...options.particles.move,
              direction: "none", 
              outMode: "bounce" 
            }
          }
        }}
      />
    </div>
  );
};
