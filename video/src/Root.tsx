import { Composition } from "remotion";
import { TipDemo } from "./TipDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TipDemo"
        component={TipDemo}
        durationInFrames={600} // 20 seconds at 30fps - smoother, more zoomed in
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
