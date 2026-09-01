import { Header } from "@/components/site/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header overHero={false} />
      {children}
    </>
  );
}
