import type { Route } from "./+types/home";
import logoDark from "/welcome/logo-dark.svg";
import logoLight from "/welcome/logo-light.svg";


export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <>
      <p>Hello How are you</p>
    </>
  );
}
