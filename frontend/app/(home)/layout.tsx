import { AppLayout } from "@/components/layout/root-layout"
import RootProvider from "@/lib/context/web3-auth"

export default function GameLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <RootProvider>
      <AppLayout>
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-24 md:pt-24 md:pb-12">
          {children}
        </div>
      </AppLayout>
    </RootProvider>
  )
}
