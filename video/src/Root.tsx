import { Composition } from "remotion";
import { TipDemo } from "./TipDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TipDemo"
        component={TipDemo}
        durationInFrames={450} // 15 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
