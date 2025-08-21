import { useState } from "react";

import Spline from "@splinetool/react-spline";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

const HomeComponent = () => {
  const navigate = useNavigate();
  const [spline, setSpline] = useState();

  // biome-ignore lint/suspicious/noExplicitAny: safe
  function onLoad(spline: any) {
    setSpline(spline);
  }

  const triggerAnimation = async () => {
    if (!spline) return;
    // @ts-ignore safe
    spline.emitEvent("mouseDown", "6e165d5a-6439-48a2-9cb6-f59606d95cb7");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await navigate({ to: "/dashboard" });
  };

  return (
    <div className="hide-scrollbar relative h-full max-h-screen w-full overflow-hidden">
      <div className="absolute top-[40%] right-1/2 z-[100] translate-x-1/2">
        <button
          className="group h-8 w-[6.5rem] rounded-full border-none font-medium"
          onClick={triggerAnimation}
          type="button"
        >
          <Link className="flex w-full items-center gap-2" to="/" />
        </button>
      </div>
      <div className="h-screen scale-[200%] lg:scale-[120%]">
        <Spline
          onLoad={onLoad}
          scene="https://prod.spline.design/1YY0eA-94scqgNPJ/scene.splinecode"
        />
      </div>
    </div>
  );
};

export const Route = createFileRoute("/")({
  component: HomeComponent,
});
